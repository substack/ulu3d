var box = require('../mesh/box.json')
var mat4 = require('gl-mat4')
var bcoords = require('../bcoords.js')

module.exports = function (state, emitter) {
  state.geometry = {
    items: [],
    nameToIndex: {},
    selected: {
      names: [],
      items: [],
      points: []
    }
  }
  emitter.on('mouse', function (ev) {
    //
  })
  emitter.on('add-select-item', function (name) {
    var items = state.geometry.items
    var items = state.geometry.items
    var ix = state.geometry.nameToIndex[name]
    var item = items[ix]
    item.selected = true
    state.geometry.selected.items.push(item)
    state.geometry.selected.names.push(name)
    emitter.emit('selected-item', state.geometry.selected.items)
  })
  emitter.on('set-select-item', function (names) {
    var items = state.geometry.items
    state.geometry.selected.items = []
    names.forEach(function (name) {
      var ix = state.geometry.nameToIndex[name]
      var item = state.geometry.items[ix]
      item.selected = true
      state.geometry.selected.items.push(item)
    })
    state.geometry.selected.names = names
    emitter.emit('selected-item', state.geometry.selected.items)
  })
  emitter.on('remove-select-item', function (name) {
    var ix = state.geometry.nameToIndex[name]
    var items = state.geometry.items
    var item = items[ix]
    items.splice(ix,1)

    var ix = state.geometry.selected.names.indexOf(name)
    if (ix >= 0) {
      state.geometry.selected.names.splice(ix,1)
      state.geometry.selected.items.splice(ix,1)
    }
    emitter.emit('selected-item', state.geometry.selected.items)
  })
  emitter.on('pick', function (p) {
    var items = state.geometry.items
    if (p.data[0] === 1) { // object
      emitter.emit('pick-mesh', state.geometry.items[p.data[1]], p)
    } else if (p.data[0] === 2) { // handle
      emitter.emit('pick-handle', state.geometry.items[p.data[1]], p)
    } else if (p.data[0] === 3) { // button
      emitter.emit('pick-button', state.geometry.items[p.data[1]], p)
    } else if (p.data[0] === 4) { // line
      emitter.emit('pick-line', state.geometry.items[p.data[1]], p)
    } else if (p.data[0] === 5) { // point
      emitter.emit('pick-point', state.geometry.items[p.data[1]], p)
    }
  })
  emitter.on('set-mesh', setMesh)
  emitter.on('add-mesh', function (name, mesh, opts) {
    if (!opts) opts = {}
    var scale = opts.scale || [1,1,1]
    var translate = opts.translate || [0,0,0]
    var rotate = opts.rotate || [0,0,0]

    var id = state.geometry.items.length
    state.geometry.nameToIndex[name] = id
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
    var positions = []
    for (var i = 0; i < mesh.positions.length; i++) {
      positions.push([
        (mesh.positions[i][0]-bbox.min[0])/(bbox.max[0]-bbox.min[0]),
        (mesh.positions[i][1]-bbox.min[1])/(bbox.max[1]-bbox.min[1]),
        (mesh.positions[i][2]-bbox.min[2])/(bbox.max[2]-bbox.min[2])
      ])
    }
    var nmesh = bcoords(mesh.cells, positions)
    state.geometry.items.push({
      id: id,
      name: name,
      positions: nmesh.positions,
      cells: nmesh.cells,
      bcoords: nmesh.bcoords,
      bbox: bbox,
      scale: scale,
      translate: translate,
      rotate: rotate
    })
    emitter.emit('frame')
  })

  function setMesh (name, opts) {
    var items = state.geometry.items
    var item = null
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === name) {
        item = items[i]
        break
      }
    }
    if (!item) return

    var scale = opts.scale || item.scale
    var translate = opts.translate || item.translate
    var rotate = opts.rotate || item.rotate

    item.scale[0] = scale[0]
    item.scale[1] = scale[1]
    item.scale[2] = scale[2]
    item.translate[0] = translate[0]
    item.translate[1] = translate[1]
    item.translate[2] = translate[2]
    item.rotate[0] = rotate[0]
    item.rotate[1] = rotate[1]
    item.rotate[2] = rotate[2]
  }
}
