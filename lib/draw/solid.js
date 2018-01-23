var glsl = require('glslify')

module.exports = Solid

function Solid (regl) {
  if (!(this instanceof Solid)) return new Solid(regl)
  this._draw = regl({
    frag: `
      #extension GL_OES_standard_derivatives: enable
      precision highp float;
      varying vec3 vpos;
      void main () {
        vec3 N = normalize(cross(dFdx(vpos),dFdy(vpos)));
        gl_FragColor = vec4(N*0.5+0.5,1);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: read_mat = require('glsl-matrix-texture')
      uniform sampler2D mtex;
      uniform mat4 projection, view;
      uniform vec2 msize;
      attribute vec3 position;
      attribute float id;
      varying vec3 vpos;
      void main () {
        vpos = position;
        mat4 model = read_mat(mtex,id,msize);
        gl_Position = projection * view * model * vec4(vpos,1);
      }
    `,
    uniforms: {
      mtex: regl.prop('modelTexture'),
      msize: regl.prop('modelSize')
    },
    attributes: {
      position: regl.prop('positions'),
      id: regl.prop('ids')
    },
    elements: regl.prop('cells')
  })
}

Solid.prototype.draw = function (state) {
  this._draw(state.meshes.solids.data)
}
