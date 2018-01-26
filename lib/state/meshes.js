var meshGroup = require('mesh-groups')
var box = require('../mesh/box.json')
var mat4 = require('gl-mat4')

module.exports = function (state, emitter) {
  state.meshes = {
    solid: [],
    box: [],
    queue: []
  }
  emitter.on('add-mesh', function (name, mesh) {
    if (state.meshes.queue) {
      state.meshes.queue.push({ name: name, mesh: mesh })
      emitter.emit('frame')
    } else {
      add(name, mesh)
    }
  })
  emitter.on('regl', function (regl) {
    state.regl = regl
    state.meshes.solid = meshGroup({
      texture: regl.texture,
      attributes: [ 'normals[3]' ]
    })
    state.meshes.box = meshGroup({
      texture: regl.texture,
      attributes: [ 'bcoords[3]' ]
    })
    for (var i = 0; i < state.meshes.queue.length; i++) {
      var q = state.meshes.queue[i]
      add(q.name, q.mesh)
    }
    state.meshes.queue = null
  })
  emitter.once('pre-frame', update)
  emitter.on('post-frame', update)
  function update () {
    state.meshes.solid.update()
    state.meshes.box.update()
  }
  function add (name, mesh) {
    state.meshes.solid.add(name, mesh)
    var bbox = {
      min: [Infinity,Infinity,Infinity],
      max: [-Infinity,-Infinity,-Infinity]
    }
    for (var i = 0; i < mesh.positions.length; i++) {
      var p = mesh.positions[i]
      bbox.min[0] = Math.min(bbox.min[0], p[0])
      bbox.min[1] = Math.min(bbox.min[1], p[1])
      bbox.min[2] = Math.min(bbox.min[2], p[2])
      bbox.max[0] = Math.max(bbox.max[0], p[0])
      bbox.max[1] = Math.max(bbox.max[1], p[1])
      bbox.max[2] = Math.max(bbox.max[2], p[2])
    }
    var padding = 0.5
    var scale = [
      bbox.max[0]-bbox.min[0] + padding,
      bbox.max[1]-bbox.min[1] + padding,
      bbox.max[2]-bbox.min[2] + padding
    ]
    var translate = [
      bbox.min[0] - padding*0.5,
      bbox.min[1] - padding*0.5,
      bbox.min[2] - padding*0.5
    ]

    state.meshes.box.add(name, Object.assign({ model: boxModel }, box))
    state.meshes.solid.pack()
    state.meshes.box.pack()
  
    function boxModel (m) {
      mesh.model(m)
      mat4.translate(m,m,translate)
      mat4.scale(m,m,scale)
    }
  }
}
