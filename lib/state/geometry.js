var Geometry = require('scene-geometry')
var box = require('../mesh/box.json')
var mat4 = require('gl-mat4')

module.exports = function (state, emitter) {
  state.geometry = {
    solids: new Queue,
    boxes: new Queue,
    solidPlacement: {},
    boxPlacement: {},
    ready: false
  }
  emitter.on('regl', function (regl) {
    var solids = new Geometry({
      createTexture: regl.texture,
      textures: { models: 'mat4' }
    })
    var boxes = new Geometry({
      createTexture: regl.texture,
      attributes: { bcoords: 'vec3' },
      textures: { models: 'mat4' }
    })
    state.geometry.solids.playback(solids)
    state.geometry.boxes.playback(boxes)
    state.geometry.solids = solids
    state.geometry.boxes = boxes
    state.geometry.ready = true
  })
  emitter.on('mouse', function (ev) {
    //
  })
  emitter.once('pre-frame', update)
  emitter.on('post-frame', update)
  function update (ev) {
    var models = state.geometry.solids.data.models
    for (var i = 0; i < models.count; i++) {
      var m = models.data.subarray(i*16,i*16+16)
      var name = state.geometry.solids.getName(i)
      var p = state.geometry.solidPlacement[name]
      mat4.identity(m)
      mat4.translate(m,m,p.translate)
      mat4.scale(m,m,p.scale)
    }
    models.update()
    models = state.geometry.boxes.data.models
    for (var i = 0; i < models.count; i++) {
      var m = models.data.subarray(i*16,i*16+16)
      var name = state.geometry.boxes.getName(i)
      var p = state.geometry.boxPlacement[name]
      mat4.identity(m)
      mat4.translate(m,m,p.translate)
      mat4.scale(m,m,p.scale)
    }
    models.update()
  }

  emitter.on('add-mesh', function (name, mesh, opts) {
    if (!opts) opts = {}
    var scale = opts.scale || [1,1,1]
    var translate = opts.translate || [0,0,0]
    state.geometry.solidPlacement[name] = {
      scale: scale,
      translate: translate
    }
    state.geometry.solids.add(name, mesh)
    var bbox = {
      min: [Infinity,Infinity,Infinity],
      max: [-Infinity,-Infinity,-Infinity]
    }
    for (var i = 0; i < mesh.positions.length; i++) {
      var p = mesh.positions[i]
      bbox.min[0] = Math.min(bbox.min[0],p[0])
      bbox.min[1] = Math.min(bbox.min[1],p[1])
      bbox.min[2] = Math.min(bbox.min[2],p[2])
      bbox.max[0] = Math.max(bbox.max[0],p[0])
      bbox.max[1] = Math.max(bbox.max[1],p[1])
      bbox.max[2] = Math.max(bbox.max[2],p[2])
    }
    var padding = 0.5
    state.geometry.boxPlacement[name] = {
      scale: [
        (bbox.max[0]-bbox.min[0])*scale[0] + padding,
        (bbox.max[1]-bbox.min[1])*scale[1] + padding,
        (bbox.max[2]-bbox.min[2])*scale[2] + padding
      ],
      translate: [
        bbox.min[0]*scale[0] + translate[0] - padding*0.5,
        bbox.min[1]*scale[1] + translate[1] - padding*0.5,
        bbox.min[2]*scale[2] + translate[2] - padding*0.5
      ]
    }
    state.geometry.boxes.add(name, box)

    state.geometry.solids.pack()
    state.geometry.boxes.pack()
    if (state.geometry.ready) emitter.emit('frame')
  })
}

function Queue () {
  this._queue = []
  this._pack = false
}
Queue.prototype.add = function (name, mesh) {
  this._queue.push({ name: name, mesh: mesh })
}
Queue.prototype.pack = function () {
  this._pack = true
}
Queue.prototype.playback = function (q) {
  for (var i = 0; i < this._queue.length; i++) {
    q.add(this._queue[i].name, this._queue[i].mesh)
  }
  if (this._pack) q.pack()
}
