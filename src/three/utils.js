import * as THREE from 'three'

export function applyVec3 (target, value) {
  if (value == null) return
  if (Array.isArray(value)) {
    target.set(value[0] ?? target.x, value[1] ?? target.y, value[2] ?? target.z)
  } else if (typeof value === 'object') {
    target.set(
      value.x ?? target.x,
      value.y ?? target.y,
      value.z ?? target.z
    )
  }
}

export function createColor (value) {
  return new THREE.Color(value)
}
