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
import { ThreeMeshHostKey } from '../keys'

const props = defineProps({
  type: { type: String, default: 'standard' },
  color: { type: [String, Number], default: '#ffffff' },
  emissive: { type: [String, Number], default: null },
  metalness: { type: Number, default: null },
  roughness: { type: Number, default: null },
  shininess: { type: Number, default: null },
  opacity: { type: Number, default: 1 },
  transparent: { type: Boolean, default: false },
  wireframe: { type: Boolean, default: false },
  flatShading: { type: Boolean, default: false },
  side: { type: String, default: 'front', validator: (v) => ['front', 'back', 'double'].includes(v) }
})

const emit = defineEmits(['created'])

const host = inject(ThreeMeshHostKey, null)
if (!host) {
  throw new Error('[vthree] ThreeMaterial must be used inside ThreeMesh')
}

const materialTypes = {
  basic: THREE.MeshBasicMaterial,
  standard: THREE.MeshStandardMaterial,
  physical: THREE.MeshPhysicalMaterial,
  phong: THREE.MeshPhongMaterial,
  normal: THREE.MeshNormalMaterial,
  depth: THREE.MeshDepthMaterial
}

const sides = {
  front: THREE.FrontSide,
  back: THREE.BackSide,
  double: THREE.DoubleSide
}

let material = null

function applyProps () {
  if (!material) return
  if ('color' in material && props.color != null) material.color.set(props.color)
  if ('emissive' in material && props.emissive != null) material.emissive.set(props.emissive)
  if ('metalness' in material && props.metalness != null) material.metalness = props.metalness
  if ('roughness' in material && props.roughness != null) material.roughness = props.roughness
  if ('shininess' in material && props.shininess != null) material.shininess = props.shininess
  if ('opacity' in material) material.opacity = props.opacity
  if ('transparent' in material) material.transparent = props.transparent
  if ('wireframe' in material) material.wireframe = props.wireframe
  if ('flatShading' in material) material.flatShading = props.flatShading
  if ('side' in material) material.side = sides[props.side] ?? THREE.FrontSide
  material.needsUpdate = true
}

function apply () {
  const MaterialClass = materialTypes[props.type]
  if (!MaterialClass) {
    console.warn(`[vthree] Unknown material type "${props.type}"`)
    return
  }
  material = new MaterialClass()
  applyProps()
  host.setMaterial(material)
  emit('created', material)
}

function recreate () {
  if (material) {
    host.clearMaterial(material)
    material.dispose()
    material = null
  }
  apply()
}

watch(() => props.type, recreate)
watch(
  () => [
    props.color,
    props.emissive,
    props.metalness,
    props.roughness,
    props.shininess,
    props.opacity,
    props.transparent,
    props.wireframe,
    props.flatShading,
    props.side
  ],
  applyProps
)

onMounted(apply)

onBeforeUnmount(() => {
  if (material) {
    host.clearMaterial(material)
    material.dispose()
    material = null
  }
})
</script>
