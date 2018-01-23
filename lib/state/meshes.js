var meshGroup = require('mesh-groups')

module.exports = function (state, emitter) {
  state.meshes = {
    solids: [],
    boxes: [],
    queue: []
  }
  emitter.on('add-mesh', function (name, mesh) {
    if (state.meshes.queue) {
      state.meshes.queue.push({ name: name, mesh: mesh })
    } else state.meshes.solids.add(name, mesh)
  })
  emitter.on('regl', function (regl) {
    state.regl = regl
    state.meshes.solids = meshGroup({ texture: regl.texture })
    state.meshes.boxes = meshGroup({ texture: regl.texture })
    for (var i = 0; i < state.meshes.queue.length; i++) {
      var q = state.meshes.queue[i]
      state.meshes.solids.add(q.name, q.mesh)
    }
    state.meshes.queue = null
  })
  emitter.once('pre-frame', update)
  emitter.on('post-frame', update)
  function update () {
    state.meshes.solids.update()
    state.meshes.boxes.update()
  }
}
