var mat4 = require('gl-mat4')
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
      uniform vec3 translate, scale, boxMin, boxMax;
      void main () {
        vpos = position*2.0-1.0;
        gl_Position = projection * view
          * (model * vec4(vpos*scale*(boxMax-boxMin),1) + vec4(translate,0));
      }
    `,
    uniforms: {
      model: require('../model.js'),
      id: regl.prop('id'),
      translate: regl.prop('translate'),
      scale: regl.prop('scale'),
      boxMin: regl.prop('bbox.min'),
      boxMax: regl.prop('bbox.max')
    },
    attributes: {
      position: regl.prop('positions')
    },
    elements: regl.prop('cells')
  }
  this._draw = regl(drawOpts)
  this._pick = regl(Object.assign({}, drawOpts, {
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
  this._draw(state.geometry.items)
}

Solid.prototype.pick = function (state) {
  this._pick(state.geometry.items)
}
