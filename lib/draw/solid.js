var glsl = require('glslify')
module.exports = Solid

function Solid (regl) {
  if (!(this instanceof Solid)) return new Solid(regl)
  var model = new Float32Array(16)
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
      uniform mat4 projection, view;
      attribute vec3 position;
      uniform sampler2D modelTexture;
      attribute float id;
      uniform vec2 modelSize;
      varying vec3 vpos;
      void main () {
        vpos = position;
        mat4 model = read_mat(modelTexture,id,modelSize);
        gl_Position = projection * view * model * vec4(vpos,1);
      }
    `,
    uniforms: {
      modelTexture: regl.prop('models.texture'),
      modelSize: regl.prop('models.size')
    },
    attributes: {
      position: regl.prop('positions.data'),
      id: regl.prop('ids.data')
    },
    elements: regl.prop('elements.data')
  })
}

Solid.prototype.draw = function (state) {
  this._draw(state.geometry.solids.data)
}
