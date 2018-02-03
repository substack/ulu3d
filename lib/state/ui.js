module.exports = function (state, emitter) {
  state.ui = {
    moving: false,
    handling: false,
    handleMode: 'resize'
  }
  emitter.on('pick', function (p) {
    if (p.event.type === 'mousedown' && p.data[0] !== 1 && p.data[0] !== 2) {
      emitter.emit('set-select', [])
      emitter.emit('frame')
    }
  })
  emitter.on('pick-mesh', function (name, p) {
    if (p.event.type === 'mousedown') {
      state.ui.moving = true
      emitter.emit('set-select', [name])
      emitter.emit('frame')
    }
  })
  emitter.on('pick-handle', function (name, p) {
    if (p.event.type === 'mousedown') {
      state.ui.handling = true
    }
  })
  emitter.on('mouse', function (ev) {
    if (ev.type === 'mouseup') {
      state.ui.moving = false
      state.ui.handling = false
    } else if (state.ui.handling && (ev.buttons&1) && ev.type === 'mousemove') {
      state.geometry.selected.solid.forEach(function (solid) {
        var w = Math.max(state.width, state.height)
        var scale = [
          solid.scale[0]
            + ev.movementX/w*state.camera.distance*2,
          solid.scale[1]
            - ev.movementY/w*state.camera.distance*2,
          solid.scale[2]
        ]
        emitter.emit('set-mesh', solid.name, { scale: scale })
      })
      emitter.emit('frame')
    } else if (state.ui.moving && (ev.buttons&1) && ev.type === 'mousemove') {
      state.geometry.selected.solid.forEach(function (solid) {
        var w = Math.max(state.width, state.height)
        var tr = [
          solid.translate[0]
            + ev.movementX/w*state.camera.distance*2,
          solid.translate[1]
            - ev.movementY/w*state.camera.distance*2,
          solid.translate[2]
        ]
        emitter.emit('set-mesh', solid.name, { translate: tr })
      })
      emitter.emit('frame')
    }
  })
}
