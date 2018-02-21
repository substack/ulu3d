var mat4 = require('gl-mat4')
var glsl = require('glslify')
module.exports = Point

function Point (regl) {
  if (!(this instanceof Point)) return new Point(regl)
  var model = new Float32Array(16)
  var drawLineOpts = {
    frag: `
      #extension GL_OES_standard_derivatives: enable
      precision highp float;
      varying vec3 vpos, vbcoord;
      void main () {
        vec3 N = normalize(cross(dFdx(vpos),dFdy(vpos)));
        vec3 vb = smoothstep(vec3(0), fwidth(vbcoord)*1.5, vbcoord);
        float b = 1.0 - min(min(vb.x,vb.y),vb.z);
        gl_FragColor = vec4(mix(vec3(0),N*0.5+0.5,b),b);
      }
    `,
    vert: `
      precision highp float;
      uniform mat4 projection, view, model;
      attribute vec3 position, bcoord;
      varying vec3 vpos, vbcoord;
      uniform vec3 translate, scale, boxMin, boxMax;
      void main () {
        vbcoord = bcoord;
        vpos = position*2.0-1.0;
        gl_PointSize = 16.0;
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
      position: regl.prop('positions'),
      bcoord: regl.prop('bcoords')
    },
    depth: { mask: false },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    elements: regl.prop('cells')
  }
  this._drawLine = regl(drawLineOpts)
  this._pickLine = regl(Object.assign({}, drawLineOpts, {
    frag: `
      precision highp float;
      uniform float id;
      void main () {
        gl_FragColor = vec4(4,id,0,0);
      }
    `,
    blend: { enable: false }
  }))
  var drawPointOpts = Object.assign({}, drawLineOpts, {
    frag: `
      precision highp float;
      varying vec3 vpos, vbcoord;
      void main () {
        float x = smoothstep(0.5,0.6,
          max(abs(gl_PointCoord.x*2.0-1.0),
            abs(gl_PointCoord.y*2.0-1.0)));
        gl_FragColor = vec4(x,0,x,x);
      }
    `,
    primitive: 'points',
    count: function (context, props) {
      return props.positions.length
    }
  })
  this._drawPoint = regl(drawPointOpts)
  this._pickPoint = regl(Object.assign({}, drawPointOpts, {
    frag: `
      precision highp float;
      uniform float id;
      void main () {
        gl_FragColor = vec4(5,id,0,0);
      }
    `,
    blend: { enable: false }
  }))
}

Point.prototype.draw = function (state) {
  if (state.ui.editMode === 'point') {
    this._drawLine(state.geometry.items)
    this._drawPoint(state.geometry.items)
  }
}

Point.prototype.pick = function (state) {
  if (state.ui.editMode === 'point') {
    this._pickLine(state.geometry.items)
  }
}
