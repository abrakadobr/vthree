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
import { createColor } from '../utils'

const props = defineProps({
  color: { type: [String, Number], default: '#ffffff' },
  intensity: { type: Number, default: 1 }
})

const emit = defineEmits(['ready'])

const parent = inject(ThreeObject3DParentKey, null)
if (!parent) {
  throw new Error('[vthree] ThreeAmbientLight must be used inside ThreeScene')
}

const light = new THREE.AmbientLight(createColor(props.color), props.intensity)

watch(() => props.color, (value) => light.color.set(value))
watch(() => props.intensity, (value) => { light.intensity = value })

onMounted(() => {
  parent.add(light)
  emit('ready', light)
})

onBeforeUnmount(() => {
  parent.remove(light)
})
</script>
