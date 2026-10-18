<template>
  <slot />
</template>

<script setup>
import * as THREE from 'three'
import {
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  watch
} from 'vue'
import {
  ThreeCameraKey,
  ThreeObject3DParentKey,
  ThreeRendererContextKey
} from '../keys'
import { applyVec3 } from '../utils'

const props = defineProps({
  position: { type: [Array, Object], default: () => [0, 0, 5] },
  lookAt: { type: [Array, Object], default: null },
  fov: { type: Number, default: 50 },
  near: { type: Number, default: 0.1 },
  far: { type: Number, default: 2000 },
  up: { type: [Array, Object], default: null }
})

const emit = defineEmits(['ready'])

const context = inject(ThreeRendererContextKey, null)
const parent = inject(ThreeObject3DParentKey, null)
if (!context) {
  throw new Error('[vthree] ThreeCamera must be used inside ThreeRenderer/ThreeScene')
}
if (!parent) {
  throw new Error('[vthree] ThreeCamera must be used inside ThreeScene')
}

const camera = new THREE.PerspectiveCamera(props.fov, 1, props.near, props.far)
applyVec3(camera.position, props.position)
if (props.up) applyVec3(camera.up, props.up)

function applyLookAt () {
  if (props.lookAt) {
    const target = Array.isArray(props.lookAt)
      ? new THREE.Vector3(...props.lookAt)
      : new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z)
    camera.lookAt(target)
  }
}

let stopRenderHook = null

watch(() => props.position, (value) => applyVec3(camera.position, value), { deep: true })
watch(() => props.up, (value) => applyVec3(camera.up, value), { deep: true })
watch(() => props.lookAt, applyLookAt, { deep: true })
watch(() => props.fov, (value) => {
  camera.fov = value
  camera.updateProjectionMatrix()
})
watch(() => props.near, (value) => {
  camera.near = value
  camera.updateProjectionMatrix()
})
watch(() => props.far, (value) => {
  camera.far = value
  camera.updateProjectionMatrix()
})

provide(ThreeCameraKey, camera)

onMounted(() => {
  parent.add(camera)
  applyLookAt()
  const { width, height } = context.getSize()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  stopRenderHook = context.onBeforeRender(() => {
    const size = context.getSize()
    const aspect = size.width / size.height
    if (camera.aspect !== aspect) {
      camera.aspect = aspect
      camera.updateProjectionMatrix()
    }
  })
  context.camera = camera
  emit('ready', camera)
})

onBeforeUnmount(() => {
  stopRenderHook?.()
  if (context.camera === camera) {
    context.camera = null
  }
  parent.remove(camera)
})
</script>
