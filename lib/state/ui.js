module.exports = function (state, emitter) {
  var modes = ['scale','rotate']
  state.ui = {
    moving: false,
    handling: false,
    handleMode: 'scale',
    handleDirection: [0,0]
  }
  emitter.on('pick', function (p) {
    if (p.event.type === 'mousedown' && p.data[0] !== 1 && p.data[0] !== 2) {
      emitter.emit('set-select', [])
      emitter.emit('frame')
      state.ui.handleMode = 'scale'
    }
  })
  emitter.on('pick-mesh', function (name, p) {
    if (p.event.type === 'mousedown') {
      state.ui.moving = true
      if (state.geometry.selected.names[0] === name) {
        var n = (modes.indexOf(state.ui.handleMode)+1)%modes.length
        state.ui.handleMode = modes[n]
      }
      emitter.emit('set-select', [name])
      emitter.emit('frame')
    }
  })
  emitter.on('pick-handle', function (name, p) {
    if (p.event.type === 'mousedown') {
      state.ui.handling = true
      state.ui.handleDirection[0] = p.data[2]
      state.ui.handleDirection[1] = p.data[3]
    }
  })
  emitter.on('mouse', function (ev) {
    if (ev.type === 'mouseup') {
      state.ui.moving = false
      state.ui.handling = false
    } else if (state.ui.handling && (ev.buttons&1) && ev.type === 'mousemove') {
      state.geometry.selected.solid.forEach(function (solid) {
        var w = Math.min(state.width, state.height)
        var dx = ev.movementX/w*state.camera.distance*2
          * state.ui.handleDirection[0]
        var dy = ev.movementY/w*state.camera.distance*2
          * state.ui.handleDirection[1]
        var scale = [
          solid.scale[0] + dx*2,
          solid.scale[1] - dy*2,
          solid.scale[2]
        ]
        emitter.emit('set-mesh', solid.name, { scale: scale })
      })
      emitter.emit('frame')
    } else if (state.ui.moving && (ev.buttons&1) && ev.type === 'mousemove') {
      state.geometry.selected.solid.forEach(function (solid) {
        var w = Math.min(state.width, state.height)
        var dx = ev.movementX/w*state.camera.distance*2
        var dy = ev.movementY/w*state.camera.distance*2
        var tr = [
          solid.translate[0] + dx,
          solid.translate[1] - dy,
          solid.translate[2]
        ]
        emitter.emit('set-mesh', solid.name, { translate: tr })
      })
      emitter.emit('frame')
    }
  })
}
