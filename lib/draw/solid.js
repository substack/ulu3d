var mat4 = require('gl-mat4')
var tmpm = new Float32Array(16)

var glsl = require('glslify')
module.exports = Solid

function Solid (regl) {
  if (!(this instanceof Solid)) return new Solid(regl)
  var model = new Float32Array(16)
  var drawOpts = {
    frag: `
      #extension GL_OES_standard_derivatives: enable
      precision highp float;
      varying vec3 vpos;
      void main () {
        vec3 N = normalize(cross(dFdx(vpos),dFdy(vpos)));
        gl_FragColor = vec4(N*0.5+0.5,1);
      }
    `,
    vert: `
      precision highp float;
      uniform mat4 projection, view, model;
      attribute vec3 position;
      varying vec3 vpos;
      void main () {
        vpos = position;
        gl_Position = projection * view * model * vec4(vpos,1);
      }
    `,
    uniforms: {
      model: function (context, props) {
        mat4.identity(tmpm)
        mat4.translate(tmpm, tmpm, props.translate)
        mat4.scale(tmpm, tmpm, props.scale)
        return tmpm
      },
      id: regl.prop('id')
    },
    attributes: {
      position: regl.prop('positions')
    },
    elements: regl.prop('cells')
  }
  this._draw = regl(drawOpts)
  this._pick = regl(Object.assign(drawOpts, {
    frag: `
      precision highp float;
      uniform float id;
      void main () {
        gl_FragColor = vec4(1,id,0,0);
      }
    `
  }))
}

Solid.prototype.draw = function (state) {
  this._draw(state.geometry.solid)
}

Solid.prototype.pick = function (state) {
  this._pick(state.geometry.solid)
}
