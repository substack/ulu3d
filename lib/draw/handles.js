var glsl = require('glslify')
var mat4 = require('gl-mat4')
var box = require('../mesh/box.json')
module.exports = Handles

var modes = { scale: 0, rotate: 1 }

var tmpm = new Float32Array(16)

function Handles (regl) {
  if (!(this instanceof Handles)) return new Handles(regl)
  var self = this
  this._handleMode = modes.scale
  var model = new Float32Array(16)
  var drawOpts = {
    frag: `
      precision highp float;
      varying vec3 vpos;
      uniform float handleMode;
      void main () {
        vec4 scale = vec4(1,0.5,0.5,1);
        vec4 rotate = vec4(0.7,0.2,1,1);
        gl_FragColor = mix(scale,rotate,handleMode);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: read_mat = require('glsl-matrix-texture')
      uniform mat4 projection, view, model;
      attribute vec3 position;
      varying vec3 vpos;
      uniform vec3 translate, scale, boxMin, boxMax;
      void main () {
        vpos = position*2.0-1.0;
        gl_PointSize = 16.0;
        vec3 s = scale*(boxMax-boxMin) + 0.5;
        gl_Position = projection * view
          * (model * vec4(vpos*s,1) + vec4(translate,0));
      }
    `,
    uniforms: {
      model: require('../model.js'),
      id: regl.prop('id'),
      translate: regl.prop('translate'),
      scale: regl.prop('scale'),
      boxMin: regl.prop('bbox.min'),
      boxMax: regl.prop('bbox.max'),
      handleMode: function (context, props) {
        return self._handleMode
      }
    },
    attributes: {
      position: box.positions
    },
    primitive: 'points',
    count: box.positions.length
  }
  this._draw = regl(drawOpts)
  this._pick = regl(Object.assign({}, drawOpts, {
    frag: `
      precision highp float;
      uniform float id;
      varying vec3 vpos;
      void main () {
        gl_FragColor = vec4(2,id,vpos.x*2.0-1.0,vpos.y*2.0-1.0);
      }
    `,
    blend: { enable: false }
  }))
}

Handles.prototype.postDraw = function (state) {
  this._handleMode = modes[state.ui.handleMode]
  this._draw(state.geometry.selected.items)
}

Handles.prototype.postPick = function (state) {
  this._pick(state.geometry.selected.items)
}
