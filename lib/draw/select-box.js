var glsl = require('glslify')

module.exports = Box

function Box (regl) {
  if (!(this instanceof Box)) return new Box(regl)
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
      uniform sampler2D mtex;
      uniform mat4 projection, view;
      uniform vec2 msize;
      attribute vec3 position, bcoord;
      attribute float id;
      varying vec3 vpos, vbcoord;
      void main () {
        vpos = position;
        vbcoord = bcoord;
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
      bcoord: regl.prop('bcoords'),
      id: regl.prop('ids')
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false },
    elements: regl.prop('cells'),
    count: regl.prop('count')
  })
}

Box.prototype.postDraw = function (state) {
  this._draw(state.meshes.box.data)
}
