var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var tmpv = new Float32Array(3)
var tmpm = new Float32Array(16)

module.exports = function (state, emitter) {
  var objectModes = ['scale','rotate']
  var editModes = ['object','point']
  state.ui = {
    moving: false,
    handling: false,
    moved: false,
    handleMode: 'scale',
    editMode: 'object',
    handleDirection: [0,0],
    buttons: {
      show: false
    }
  }
  emitter.on('selected-item', function (items) {
    if (items.length === 0) {
      state.ui.buttons.show = false
    } else {
      state.ui.buttons.show = true
    }
    emitter.emit('frame')
  })
  emitter.on('pick', function (p) {
    if (p.event.type === 'mousedown' && p.data[0] === 0) {
      state.ui.handleMode = 'scale'
      state.ui.editMode = 'object'
      emitter.emit('set-select-item', [])
      emitter.emit('frame')
    }
  })
  emitter.on('pick-mesh', function (item, p) {
    if (p.event.type === 'mousedown') {
      state.ui.moving = true
      if (item.selected) {
        var n = (objectModes.indexOf(state.ui.handleMode)+1)%objectModes.length
        state.ui.handleMode = objectModes[n]
      }
      emitter.emit('set-select-item', [item.name])
      emitter.emit('frame')
    }
  })
  emitter.on('pick-handle', function (item, p) {
    if (p.event.type === 'mousedown') {
      state.ui.moved = false
      state.ui.handling = true
      state.ui.handleDirection[0] = p.data[2]
      state.ui.handleDirection[1] = p.data[3]
    }
    if (p.event.type === 'mouseup' && !state.ui.moved) {
      var n = (objectModes.indexOf(state.ui.handleMode)+1)%objectModes.length
      state.ui.handleMode = objectModes[n]
      emitter.emit('frame')
    }
  })
  emitter.on('pick-button', function (item, p) {
    if (p.event.type === 'mousedown' && p.data[2] === 0) {
      var n = (editModes.indexOf(state.ui.editMode)+1)%editModes.length
      state.ui.editMode = editModes[n]
      emitter.emit('frame')
    }
  })
  emitter.on('pick-point', function (item, p) {
    if (p.event.type === 'mousedown') {
      state.ui.moving = true
      state.ui.handling = true
    } else if (state.ui.moving && p.event.type === 'mousemove') {
      state.ui.handling = true
    }
  })
  emitter.on('pick-line', function (l, p) {
    console.log('LINE',l, p)
  })
  emitter.on('mouse', function (ev) {
    if (ev.type === 'mouseup') {
      state.ui.moving = false
      state.ui.handling = false
    } else if (state.ui.handling && (ev.buttons&1) && ev.type === 'mousemove') {
      state.ui.moved = true
      state.geometry.selected.items.forEach(function (item) {
        var w = Math.min(state.width, state.height)
        var dx = ev.movementX/w*state.camera.distance
        var dy = -ev.movementY/w*state.camera.distance
        mat4.identity(tmpm)
        //mat4.rotateX(tmpm, tmpm, item.rotate[0])
        mat4.rotateY(tmpm, tmpm, item.rotate[1])
        //mat4.rotateZ(tmpm, tmpm, item.rotate[2])
        tmpv[0] = state.ui.handleDirection[0]*2*dx
        tmpv[1] = state.ui.handleDirection[1]*2*dy
        tmpv[2] = 0
        vec3.transformMat4(tmpv, tmpv, tmpm)

        if (state.ui.handleMode === 'scale') {
          item.scale[0] = Math.max(0, item.scale[0] + tmpv[0])
          item.scale[1] = Math.max(0, item.scale[1] + tmpv[1])
          item.scale[2] = Math.max(0, item.scale[2] + tmpv[2])
        } else if (state.ui.handleMode === 'rotate') {
          item.rotate[0] -= dy
          item.rotate[1] += dx
        }
      })
      emitter.emit('frame')
    } else if (state.ui.moving && (ev.buttons&1) && ev.type === 'mousemove') {
      state.geometry.selected.items.forEach(function (item) {
        var w = Math.min(state.width, state.height)
        var dx = ev.movementX/w*state.camera.distance*2
        var dy = ev.movementY/w*state.camera.distance*2
        item.translate[0] += dx
        item.translate[1] -= dy
      })
      emitter.emit('frame')
    }
  })
}
