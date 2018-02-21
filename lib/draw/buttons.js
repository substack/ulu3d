var glsl = require('glslify')
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')

var modes = { scale: 0, rotate: 1 }
var tmpm = new Float32Array(16)
var tmpv = new Float32Array(3)

var box = { positions: [], normals: [], angles: [] }
var N = 4
for (var i = 0; i < N; i++) {
  var theta = i/N*2*Math.PI + Math.PI/4
  var x = Math.cos(theta)*0.5+0.5
  var z = Math.sin(theta)*0.5+0.5
  var Nxyz = [
    Math.cos(theta),
    0,
    Math.sin(theta)
  ]
  var Ny = 4
  for (var y = 0; y < Ny; y++) {
    box.positions.push([x,y/(Ny-1)*0.6+0.2,z])
    box.angles.push(theta)
    box.normals.push(Nxyz)
  }
}

module.exports = Buttons

function Buttons (regl) {
  if (!(this instanceof Buttons)) return new Buttons(regl)
  var self = this
  this._handleMode = modes.scale
  var model = new Float32Array(16)
  var screen = new Float32Array(2)
  var drawOpts = {
    frag: `
      precision highp float;
      varying vec3 vpos;
      varying float vangle;
      uniform float handleMode;
      uniform vec3 rotate;
      float PI = ${Math.PI};
      void main () {
        if (mod((vangle-rotate.y)/PI*0.5+0.125,1.0) > 0.25) discard;
        vec4 scale = vec4(1,0.5,0.5,1);
        vec4 rotate = vec4(0.7,0.2,1,1);
        gl_FragColor = mix(scale,rotate,handleMode);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: read_mat = require('glsl-matrix-texture')
      uniform mat4 projection, view, model;
      attribute vec3 position, normal;
      attribute float angle;
      uniform vec2 screen;
      varying vec3 vpos;
      varying float vangle;
      uniform vec3 translate, scale, boxMin, boxMax;
      uniform vec3 rotate;
      float PI = ${Math.PI};
      void main () {
        vpos = position*2.0-1.0;
        vangle = angle;
        gl_PointSize = 32.0;
        vec3 s = scale*(boxMax-boxMin) + 1.0;
        gl_Position = projection * view
          * (model * vec4(vpos*s + normal*s*0.5,1) + vec4(translate,0));
        float d = (gl_PointSize + 10.0)/screen.x;
        gl_Position.x = clamp(-1.0+d,+1.0-d,gl_Position.x);
        gl_Position.y = clamp(-1.0+d,+1.0-d,gl_Position.y);
      }
    `,
    uniforms: {
      model: function (context, props) {
        mat4.identity(model)
        //mat4.rotateX(model, model, props.rotate[0])
        mat4.rotateY(model, model, props.rotate[1])
        //mat4.rotateZ(model, model, props.rotate[2])
        return model
      },
      screen: function (context) {
        screen[0] = context.viewportWidth
        screen[1] = context.viewportHeight
        return screen
      },
      id: regl.prop('id'),
      translate: regl.prop('translate'),
      rotate: regl.prop('rotate'),
      scale: regl.prop('scale'),
      boxMin: regl.prop('bbox.min'),
      boxMax: regl.prop('bbox.max'),
      handleMode: function (context, props) {
        return self._handleMode
      }
    },
    attributes: {
      position: box.positions,
      normal: box.normals,
      angle: box.angles
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

Buttons.prototype.postDraw = function (state) {
  this._handleMode = modes[state.ui.handleMode]
  this._draw(state.geometry.selected.items)
}

Buttons.prototype.pick = function (state) {
  this._pick(state.geometry.selected.items)
}
