import ThreeRenderer from './components/ThreeRenderer.vue'
import ThreeScene from './components/ThreeScene.vue'
import ThreeCamera from './components/ThreeCamera.vue'
import ThreeMesh from './components/ThreeMesh.vue'
import ThreeGeometry from './components/ThreeGeometry.vue'
import ThreeMaterial from './components/ThreeMaterial.vue'
import ThreeAmbientLight from './components/ThreeAmbientLight.vue'
import ThreeDirectionalLight from './components/ThreeDirectionalLight.vue'

export {
  ThreeRenderer,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeGeometry,
  ThreeMaterial,
  ThreeAmbientLight,
  ThreeDirectionalLight
}

export default {
  install (app) {
    app.component('ThreeRenderer', ThreeRenderer)
    app.component('ThreeScene', ThreeScene)
    app.component('ThreeCamera', ThreeCamera)
    app.component('ThreeMesh', ThreeMesh)
    app.component('ThreeGeometry', ThreeGeometry)
    app.component('ThreeMaterial', ThreeMaterial)
    app.component('ThreeAmbientLight', ThreeAmbientLight)
    app.component('ThreeDirectionalLight', ThreeDirectionalLight)
  }
}
