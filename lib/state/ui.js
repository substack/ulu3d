module.exports = function (state, emitter) {
  emitter.on('pick-mesh', function (name, p) {
    if (p.event.type === 'mousedown') {
      emitter.emit('set-select', name ? [name] : [])
      emitter.emit('frame')
    }
  })
}
