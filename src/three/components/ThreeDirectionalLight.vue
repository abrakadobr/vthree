<template>
  <slot />
</template>

<script setup>
import * as THREE from 'three'
import {
  inject,
  onBeforeUnmount,
  onMounted,
  watch
} from 'vue'
import { ThreeObject3DParentKey } from '../keys'
import { applyVec3, createColor } from '../utils'

const props = defineProps({
  color: { type: [String, Number], default: '#ffffff' },
  intensity: { type: Number, default: 1 },
  position: { type: [Array, Object], default: () => [0, 10, 0] },
  castShadow: { type: Boolean, default: false }
})

const emit = defineEmits(['ready'])

const parent = inject(ThreeObject3DParentKey, null)
if (!parent) {
  throw new Error('[vthree] ThreeDirectionalLight must be used inside ThreeScene')
}

const light = new THREE.DirectionalLight(createColor(props.color), props.intensity)

watch(() => props.color, (value) => light.color.set(value))
watch(() => props.intensity, (value) => { light.intensity = value })
watch(() => props.position, (value) => applyVec3(light.position, value), { deep: true })
watch(() => props.castShadow, (value) => { light.castShadow = value })

onMounted(() => {
  light.castShadow = props.castShadow
  applyVec3(light.position, props.position)
  parent.add(light)
  emit('ready', light)
})

onBeforeUnmount(() => {
  parent.remove(light)
})
</script>
