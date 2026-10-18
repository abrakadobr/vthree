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
  ThreeObject3DParentKey,
  ThreeRendererContextKey,
  ThreeSceneKey
} from '../keys'
import { createColor } from '../utils'

const props = defineProps({
  background: { type: [String, Number], default: null },
  fog: { type: Object, default: null }
})

const emit = defineEmits(['ready'])

const context = inject(ThreeRendererContextKey, null)
if (!context) {
  throw new Error('[vthree] ThreeScene must be used inside ThreeRenderer')
}

const scene = new THREE.Scene()

function applyBackground () {
  scene.background = props.background != null ? createColor(props.background) : null
}

function applyFog () {
  if (props.fog) {
    if (!scene.fog) {
      scene.fog = new THREE.Fog(
        createColor(props.fog.color ?? 0xffffff),
        props.fog.near ?? 1,
        props.fog.far ?? 100
      )
    } else {
      scene.fog.color.set(props.fog.color ?? 0xffffff)
      scene.fog.near = props.fog.near ?? scene.fog.near
      scene.fog.far = props.fog.far ?? scene.fog.far
    }
  } else if (scene.fog) {
    scene.fog = null
  }
}

watch(() => props.background, applyBackground)
watch(() => props.fog, applyFog, { deep: true })

provide(ThreeSceneKey, scene)
provide(ThreeObject3DParentKey, scene)

onMounted(() => {
  applyBackground()
  applyFog()
  context.scene = scene
  emit('ready', scene)
})

onBeforeUnmount(() => {
  if (context.scene === scene) {
    context.scene = null
  }
})
</script>
