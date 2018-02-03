var glsl = require('glslify')
var mat4 = require('gl-mat4')
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
      void main () {
        vpos = position;
        vbcoord = bcoord;
        gl_Position = projection * view * model * vec4(vpos,1);
      }
    `,
    uniforms: {
      model: function (context, props) {
        mat4.identity(tmpm)
        mat4.translate(tmpm, tmpm, props.translate)
        mat4.scale(tmpm, tmpm, props.scale)
        return tmpm
      }
    },
    attributes: {
      position: regl.prop('positions'),
      bcoord: regl.prop('bcoords')
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false },
    elements: regl.prop('cells')
  })
}

Box.prototype.postDraw = function (state) {
  this._draw(state.geometry.box)
}
