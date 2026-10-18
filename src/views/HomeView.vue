<template>
  <div class="home">
    <ThreeRenderer shadows>
      <ThreeScene background="#12121c">
        <ThreeAmbientLight :intensity="0.35" />
        <ThreeDirectionalLight :position="[5, 8, 5]" :intensity="1.2" />

        <ThreeCamera :position="[4, 3, 6]" :look-at="[0, 0.5, 0]" />

        <!-- примитив: геометрия + материал из слотов -->
        <ThreeMesh
          :position="[0, 1, 0]"
          :rotation="cubeRotation"
          cast-shadow
          receive-shadow
        >
          <ThreeGeometry type="box" :params="{ width: 1.4, height: 1.4, depth: 1.4 }" />
          <ThreeMaterial
            type="standard"
            color="#6c9eff"
            :metalness="0.3"
            :roughness="0.35"
          />
        </ThreeMesh>

        <!-- 1. загрузка из GLB (blob-URL из экспортёра, без внешних файлов) -->
        <ThreeMesh
          v-if="glbUrl"
          :src="glbUrl"
          :position="[-2.4, 0.7, 1]"
          :scale="0.8"
          cast-shadow
          receive-shadow
        />

        <!-- 2. клонирование заранее созданного THREE.Mesh -->
        <ThreeMesh
          :mesh="sourceMesh"
          :position="[2.4, 0.7, 1]"
          :rotation="cloneRotation"
          cast-shadow
          receive-shadow
        />

        <ThreeMesh :position="[0, 0, 0]" :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
          <ThreeGeometry type="plane" :params="{ width: 30, height: 30 }" />
          <ThreeMaterial type="standard" color="#1e1e2e" :roughness="1" />
        </ThreeMesh>
      </ThreeScene>
    </ThreeRenderer>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ThreeRenderer,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeGeometry,
  ThreeMaterial,
  ThreeAmbientLight,
  ThreeDirectionalLight
} from '@/three'

const sourceMesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.55, 0.18, 128, 16),
  new THREE.MeshStandardMaterial({ color: '#c9a0ff', roughness: 0.35, metalness: 0.45 })
)

const glbUrl = ref(null)
const cubeRotation = ref([0, 0, 0])
const cloneRotation = ref([0, 0, 0])
let frameId = 0

async function exportGlb () {
  const exporter = new GLTFExporter()
  const buffer = await exporter.parseAsync(sourceMesh, { binary: true })
  glbUrl.value = URL.createObjectURL(new Blob([buffer], { type: 'model/gltf-binary' }))
}

function tick () {
  frameId = requestAnimationFrame(tick)
  cubeRotation.value = [cubeRotation.value[0] + 0.004, cubeRotation.value[1] + 0.01, 0]
  cloneRotation.value = [0, cloneRotation.value[1] + 0.008, 0]
}

onMounted(() => {
  exportGlb()
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  if (glbUrl.value) URL.revokeObjectURL(glbUrl.value)
})
</script>

<style scoped>
.home {
  position: fixed;
  inset: 0;
  background: #12121c;
}
</style>
