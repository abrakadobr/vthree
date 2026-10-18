<template>
  <slot />
</template>

<script setup>
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import {
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch
} from 'vue'
import {
  ThreeMeshHostKey,
  ThreeObject3DParentKey
} from '../keys'
import { applyVec3 } from '../utils'

const gltfLoader = new GLTFLoader()

const props = defineProps({
  src: { type: String, default: null },
  mesh: { type: Object, default: null },
  position: { type: [Array, Object], default: null },
  rotation: { type: [Array, Object], default: null },
  scale: { type: [Array, Object, Number], default: null },
  visible: { type: Boolean, default: true },
  castShadow: { type: Boolean, default: false },
  receiveShadow: { type: Boolean, default: false },
  name: { type: String, default: '' }
})

const emit = defineEmits(['ready', 'load-start', 'loaded', 'error'])

const loading = ref(false)

const parent = inject(ThreeObject3DParentKey, null)
if (!parent) {
  throw new Error('[vthree] ThreeMesh must be used inside ThreeScene or another object')
}

const container = new THREE.Group()

let defaultGeometry = null
let defaultMaterial = null
let defaultMesh = null
let meshClone = null
let glbContent = null
let ownedGlb = null
let content = null
let loadToken = 0

function ensureDefaultMesh () {
  if (!defaultMesh) {
    defaultGeometry = new THREE.BoxGeometry(1, 1, 1)
    defaultMaterial = new THREE.MeshStandardMaterial({ color: '#cccccc' })
    defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial)
    defaultMesh.castShadow = props.castShadow
    defaultMesh.receiveShadow = props.receiveShadow
  }
  return defaultMesh
}

function desiredContent () {
  if (props.src) return glbContent
  if (props.mesh) return meshClone
  return ensureDefaultMesh()
}

function applyShadowProps (object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = props.castShadow
      child.receiveShadow = props.receiveShadow
    }
  })
}

function applyContent () {
  const next = desiredContent()
  if (next === content) return
  if (content) container.remove(content)
  content = next
  if (content) {
    applyShadowProps(content)
    container.add(content)
  }
}

function disposeDeep (object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (!child.material) return
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && value.isTexture) value.dispose()
      })
      material.dispose()
    })
  })
}

function discardGlb () {
  if (ownedGlb) {
    disposeDeep(ownedGlb)
    ownedGlb = null
  }
}

async function loadSrc (src) {
  const token = ++loadToken
  loading.value = true
  emit('load-start', src)
  try {
    const gltf = await gltfLoader.loadAsync(src)
    if (token !== loadToken) {
      disposeDeep(gltf.scene)
      return
    }
    ownedGlb = gltf.scene
    glbContent = gltf.scene
    applyContent()
    emit('loaded', gltf)
  } catch (error) {
    if (token === loadToken) emit('error', error)
  } finally {
    if (token === loadToken) loading.value = false
  }
}

watch(() => props.src, () => {
  glbContent = null
  applyContent()
  discardGlb()
  if (props.src) loadSrc(props.src)
}, { immediate: true })

watch(() => props.mesh, (source) => {
  if (source && !source.isObject3D) {
    console.warn('[vthree] ThreeMesh "mesh" prop must be a THREE.Object3D')
  }
  meshClone = source && source.isObject3D ? source.clone() : null
  applyContent()
}, { immediate: true })

watch(() => props.position, (value) => applyVec3(container.position, value), { deep: true })
watch(() => props.rotation, (value) => applyVec3(container.rotation, value), { deep: true })
watch(() => props.scale, (value) => {
  if (value == null) return
  if (typeof value === 'number') {
    container.scale.setScalar(value)
  } else {
    applyVec3(container.scale, value)
  }
}, { deep: true })
watch(() => props.visible, (value) => { container.visible = value })
watch(() => props.name, (value) => { container.name = value })
watch(() => [props.castShadow, props.receiveShadow], () => {
  if (content) applyShadowProps(content)
})

const host = {
  get object () { return container },
  setGeometry (geometry) {
    ensureDefaultMesh().geometry = geometry
  },
  clearGeometry (geometry) {
    if (defaultMesh && defaultMesh.geometry === geometry) {
      defaultMesh.geometry = defaultGeometry
    }
  },
  setMaterial (material) {
    ensureDefaultMesh().material = material
  },
  clearMaterial (material) {
    if (defaultMesh && defaultMesh.material === material) {
      defaultMesh.material = defaultMaterial
    }
  }
}

provide(ThreeObject3DParentKey, container)
provide(ThreeMeshHostKey, host)

defineExpose({ container, loading })

onMounted(() => {
  applyContent()
  container.name = props.name
  container.visible = props.visible
  applyVec3(container.position, props.position)
  if (props.rotation) applyVec3(container.rotation, props.rotation)
  if (props.scale != null) {
    if (typeof props.scale === 'number') {
      container.scale.setScalar(props.scale)
    } else {
      applyVec3(container.scale, props.scale)
    }
  }
  parent.add(container)
  emit('ready', container)
})

onBeforeUnmount(() => {
  loadToken++
  if (content) container.remove(content)
  content = null
  discardGlb()
  meshClone = null
  if (defaultGeometry) defaultGeometry.dispose()
  if (defaultMaterial) defaultMaterial.dispose()
  parent.remove(container)
})
</script>
