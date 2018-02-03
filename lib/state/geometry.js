var box = require('../mesh/box.json')
var mat4 = require('gl-mat4')

module.exports = function (state, emitter) {
  state.geometry = {
    solid: [],
    box: []
  }
  emitter.on('mouse', function (ev) {
    //
  })
  emitter.on('add-mesh', function (name, mesh, opts) {
    if (!opts) opts = {}
    var scale = opts.scale || [1,1,1]
    var translate = opts.translate || [0,0,0]

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
    var padding = 0.5
    state.geometry.box.push({
      positions: box.positions,
      cells: box.cells,
      bcoords: box.bcoords,
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
    })
    emitter.emit('frame')
  })
}
