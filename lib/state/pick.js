module.exports = function (state, emitter) {
  var regl = null
  var fb = null
  var usingFB
  emitter.on('regl', function (r) {
    regl = r
    fb = regl.framebuffer({
      colorFormat: 'rgba',
      colorType: 'float32',
      width: state.width,
      height: state.height
    })
    usingFB = regl({ framebuffer: fb })
  })
  emitter.on('resize', function (width, height) {
    if (fb) fb.resize(width, height)
  })
  emitter.on('mouse', function (ev) {
    if (!regl) return
    fb.use(function () {
      regl.poll()
      regl.clear({
        color: [0,0,0,0],
        depth: true,
        framebuffer: fb
      })
      var calls = state.frame.calls, len = calls.length
      usingFB(function () {
        state.frame.defs(function () {
          for (var i = 0; i < len; i++) {
            var c = calls[i]
            if (typeof c.prePick === 'function') c.prePick(state)
          }
          for (var i = 0; i < len; i++) {
            var c = calls[i]
            if (typeof c.pick === 'function') c.pick(state)
          }
          for (var i = 0; i < len; i++) {
            var c = calls[i]
            if (typeof c.postPick === 'function') c.postPick(state)
          }
        })
      })
      var x = Math.max(0, Math.min(state.width-1, ev.offsetX))
      var y = Math.max(0, Math.min(state.height-1, state.height - ev.offsetY))
      var data = regl.read({
        framebuffer: fb,
        x: x,
        y: y,
        width: 1,
        height: 1
      })
      emitter.emit('pick', { data: data, event: ev })
    })
  })
}
