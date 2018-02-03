module.exports = function (state, emitter) {
  emitter.on('pick-mesh', function (name, p) {
    if (p.event.type === 'mousedown') {
      emitter.emit('set-select', name ? [name] : [])
      emitter.emit('frame')
    }
  })
  emitter.on('mouse', function (ev) {
    if (ev.type === 'mousemove' && (ev.buttons & 1)) {
      state.geometry.selected.solid.forEach(function (solid) {
        var w = Math.max(state.width, state.height)
        var tr = [
          solid.translate[0]
            + ev.movementX/w*state.camera.distance*2,
          solid.translate[1]
            - ev.movementY/w*state.camera.distance*2,
          solid.translate[2]
        ]
        emitter.emit('set-mesh', solid.name, {
          translate: tr
        })
      })
      emitter.emit('frame')
    }
  })
}
