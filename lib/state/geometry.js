var box = require('../mesh/box.json')
var mat4 = require('gl-mat4')

module.exports = function (state, emitter) {
  state.geometry = {
    solid: [],
    box: [],
    index: {},
    selected: { box: [], _box: {} }
  }
  emitter.on('mouse', function (ev) {
    //
  })
  emitter.on('add-select', function (name) {
    var ix = state.geometry.index[name]
    if (state.geometry.selected._box[name] === undefined) {
      state.geometry.selected._box[name] = state.geometry.selected.box.length
      state.geometry.selected.box.push(state.geometry.box[ix])
    }
  })
  emitter.on('remove-select', function (name) {
    var ix = state.geometry.selected._box[name]
    if (ix !== undefined) {
      state.geometry.selected.box.splice(ix,1)
      delete state.geometry.selected._box[name]
    }
  })
  emitter.on('set-mesh', setMesh)
  emitter.on('add-mesh', function (name, mesh, opts) {
    if (!opts) opts = {}
    var scale = opts.scale || [1,1,1]
    var translate = opts.translate || [0,0,0]

    state.geometry.index[name] = state.geometry.solid.length
    state.geometry.solid.push({
      positions: mesh.positions,
      cells: mesh.cells,
      scale: scale,
      translate: translate
    })
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
    state.geometry.box.push({
      positions: box.positions,
      cells: box.cells,
      bcoords: box.bcoords,
      padding: 0.5,
      bbox: bbox,
      scale: [1,1,1],
      translate: [0,0,0]
    })
    setMesh(name, opts)
    emitter.emit('frame')
  })

  function setMesh (name, opts) {
    var ix = state.geometry.index[name]
    var box = state.geometry.box[ix]
    var solid = state.geometry.solid[ix]

    var scale = opts.scale || solid.scale
    var translate = opts.translate || solid.translate

    var bbox = box.bbox
    if (opts.scale) {
      solid.scale = opts.scale
      box.scale[0] = (bbox.max[0]-bbox.min[0])*scale[0] + box.padding
      box.scale[1] = (bbox.max[1]-bbox.min[1])*scale[1] + box.padding
      box.scale[2] = (bbox.max[2]-bbox.min[2])*scale[2] + box.padding
    }
    if (opts.translate) {
      solid.translate = opts.translate
      box.translate[0] = bbox.min[0]*scale[0] + translate[0] - box.padding*0.5
      box.translate[1] = bbox.min[1]*scale[1] + translate[1] - box.padding*0.5
      box.translate[2] = bbox.min[2]*scale[2] + translate[2] - box.padding*0.5
    }
  }
}
