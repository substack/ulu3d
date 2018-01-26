var mat4 = require('gl-mat4')

module.exports = function (state, emitter) {
  if (!state.uniforms) state.uniforms = {}
  state.camera = {
    projection: new Float32Array(16),
    view: new Float32Array(16),
    eye: Float32Array.from([0,2,5]),
    center: Float32Array.from([0,0,0]),
    up: Float32Array.from([0,1,0]),
    fov: Math.PI/2,
    zNear: 0.1,
    zFar: 1000,
    screen: new Float32Array(2)
  }
  state.uniforms.screen = function (context) {
    state.camera.screen[0] = context.viewportWidth
    state.camera.screen[1] = context.viewportHeight
    return state.camera.screen
  }
  state.uniforms.projection = function (context) {
    var m = state.camera.projection
    var aspect = context.viewportWidth / context.viewportHeight
    return mat4.perspective(m, state.camera.fov, aspect,
      state.camera.zNear, state.camera.zFar)
  }
  state.uniforms.view = function () {
    return mat4.lookAt(state.camera.view,
      state.camera.eye, state.camera.center, state.camera.up)
  }
}
