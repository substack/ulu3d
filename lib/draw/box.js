var glsl = require('glslify')
var mat4 = require('gl-mat4')
var box = require('../mesh/box.json')

module.exports = Box

var tmpm = new Float32Array(16)

function Box (regl) {
  if (!(this instanceof Box)) return new Box(regl)
  var model = new Float32Array(16)
  this._draw = regl({
    frag: `
      #extension GL_OES_standard_derivatives: enable
      precision highp float;
      varying vec3 vpos, vbcoord;
      void main () {
        vec3 N = normalize(cross(dFdx(vpos),dFdy(vpos)));
        vec3 bc = smoothstep(vec3(0.0), fwidth(vbcoord)*3.5, vbcoord);
        float b = 1.0-min(bc.x,min(bc.y,bc.z));
        gl_FragColor = vec4(vec3(b)*(N*0.5+0.5),b);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: read_mat = require('glsl-matrix-texture')
      uniform mat4 projection, view, model;
      attribute vec3 position, bcoord;
      varying vec3 vpos, vbcoord;
      uniform vec3 translate, scale, boxMin, boxMax;
      void main () {
        vpos = position*2.0-1.0;
        vbcoord = bcoord;
        vec3 s = scale*(boxMax-boxMin) + 0.5;
        gl_Position = projection * view
          * (model * vec4(vpos*s,1) + vec4(translate,0));
      }
    `,
    uniforms: {
      model: require('../model.js'),
      translate: regl.prop('translate'),
      scale: regl.prop('scale'),
      boxMin: regl.prop('bbox.min'),
      boxMax: regl.prop('bbox.max')
    },
    attributes: {
      position: box.positions,
      bcoord: box.bcoords
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false },
    elements: box.cells
  })
}

Box.prototype.postDraw = function (state) {
  if (state.ui.editMode === 'object') {
    this._draw(state.geometry.selected.items)
  }
}
