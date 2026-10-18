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
  type: { type: String, default: 'box' },
  params: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['created'])

const host = inject(ThreeMeshHostKey, null)
if (!host) {
  throw new Error('[vthree] ThreeGeometry must be used inside ThreeMesh')
}

const factories = {
  box: (p) => new THREE.BoxGeometry(
    p.width ?? 1, p.height ?? 1, p.depth ?? 1,
    p.widthSegments ?? 1, p.heightSegments ?? 1, p.depthSegments ?? 1
  ),
  sphere: (p) => new THREE.SphereGeometry(
    p.radius ?? 0.5, p.widthSegments ?? 32, p.heightSegments ?? 16,
    p.phiStart ?? 0, p.phiLength ?? Math.PI * 2,
    p.thetaStart ?? 0, p.thetaLength ?? Math.PI
  ),
  plane: (p) => new THREE.PlaneGeometry(
    p.width ?? 1, p.height ?? 1, p.widthSegments ?? 1, p.heightSegments ?? 1
  ),
  circle: (p) => new THREE.CircleGeometry(
    p.radius ?? 0.5, p.segments ?? 32,
    p.thetaStart ?? 0, p.thetaLength ?? Math.PI * 2
  ),
  cylinder: (p) => new THREE.CylinderGeometry(
    p.radiusTop ?? 0.5, p.radiusBottom ?? 0.5, p.height ?? 1,
    p.radialSegments ?? 32, p.heightSegments ?? 1,
    p.openEnded ?? false, p.thetaStart ?? 0, p.thetaLength ?? Math.PI * 2
  ),
  cone: (p) => new THREE.ConeGeometry(
    p.radius ?? 0.5, p.height ?? 1, p.radialSegments ?? 32, p.heightSegments ?? 1,
    p.openEnded ?? false, p.thetaStart ?? 0, p.thetaLength ?? Math.PI * 2
  ),
  torus: (p) => new THREE.TorusGeometry(
    p.radius ?? 0.5, p.tube ?? 0.2, p.radialSegments ?? 12, p.tubularSegments ?? 48
  )
}

let geometry = null

function apply () {
  const factory = factories[props.type]
  if (!factory) {
    console.warn(`[vthree] Unknown geometry type "${props.type}"`)
    return
  }
  geometry = factory(props.params || {})
  host.setGeometry(geometry)
  emit('created', geometry)
}

function recreate () {
  if (geometry) {
    host.clearGeometry(geometry)
    geometry.dispose()
    geometry = null
  }
  apply()
}

watch(() => props.type, recreate)
watch(() => props.params, recreate, { deep: true })

onMounted(apply)

onBeforeUnmount(() => {
  if (geometry) {
    host.clearGeometry(geometry)
    geometry.dispose()
    geometry = null
  }
})
</script>
