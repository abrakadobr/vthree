<template>
  <div
    ref="containerRef"
    class="three-renderer"
    :style="containerStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import * as THREE from 'three'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch
} from 'vue'
import { ThreeRendererContextKey } from '../keys'

const props = defineProps({
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  antialias: { type: Boolean, default: true },
  alpha: { type: Boolean, default: false },
  shadows: { type: Boolean, default: false },
  pixelRatio: { type: Number, default: null }
})

const emit = defineEmits(['ready'])

const containerRef = ref(null)
const size = ref({ width: 1, height: 1 })

const renderer = new THREE.WebGLRenderer({
  antialias: props.antialias,
  alpha: props.alpha
})
renderer.setPixelRatio(props.pixelRatio ?? Math.min(window.devicePixelRatio, 2))
if (props.shadows) {
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
}

let activeScene = null
let activeCamera = null
let animationFrameId = 0
let observer = null
const beforeRenderCallbacks = new Set()

const context = {
  renderer,
  get scene () { return activeScene },
  set scene (value) { activeScene = value },
  get camera () { return activeCamera },
  set camera (value) { activeCamera = value },
  getSize: () => size.value,
  onBeforeRender (callback) {
    beforeRenderCallbacks.add(callback)
    return () => beforeRenderCallbacks.delete(callback)
  }
}

provide(ThreeRendererContextKey, context)

const containerStyle = computed(() => {
  if (props.width != null && props.height != null) {
    return { width: `${props.width}px`, height: `${props.height}px` }
  }
  return { width: '100%', height: '100%' }
})

function updateSize () {
  const el = containerRef.value
  if (!el) return
  const width = props.width ?? el.clientWidth
  const height = props.height ?? el.clientHeight
  if (width <= 0 || height <= 0) return
  size.value = { width, height }
  renderer.setSize(width, height)
}

function animate () {
  animationFrameId = requestAnimationFrame(animate)
  beforeRenderCallbacks.forEach((callback) => callback())
  if (activeScene && activeCamera) {
    renderer.render(activeScene, activeCamera)
  }
}

watch(() => [props.width, props.height], updateSize)

onMounted(() => {
  containerRef.value.appendChild(renderer.domElement)
  updateSize()
  observer = new ResizeObserver(updateSize)
  observer.observe(containerRef.value)
  animate()
  emit('ready', renderer)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  observer?.disconnect()
  renderer.dispose()
  renderer.domElement.remove()
})
</script>

<style scoped>
.three-renderer {
  display: block;
  overflow: hidden;
}

.three-renderer :deep(canvas) {
  display: block;
}
</style>
