var mat4 = require('gl-mat4')
var m = new Float32Array(16)

module.exports = function (context, props) {
  mat4.identity(m)
  mat4.rotateX(m, m, props.rotate[0])
  mat4.rotateY(m, m, props.rotate[1])
  mat4.rotateZ(m, m, props.rotate[2])
  return m
}
