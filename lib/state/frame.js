var idlecb = window.requestIdleCallback || function (f) { setTimeout(f,0) }

module.exports = function (state, emitter) {
  if (!state.uniforms) state.uniforms = {}
  state.frame = {
    defs: null,
    bg: [0.4,0.35,0.35,1],
    drawing: false,
    regl: null,
    modules: [],
    calls: []
  }
  emitter.on('frame', function () {
    if (state.frame.drawing === false) {
      state.frame.drawing = true
      window.requestAnimationFrame(frame)
    }
  })
  window.addEventListener('resize', newFrame)
  function newFrame () { emitter.emit('frame') }

  function frame () {
    if (!state.frame.regl) return
    state.frame.regl.poll()
    state.frame.regl.clear({ color: state.frame.bg, depth: true })
    state.frame.drawing = false
    emitter.emit('pre-frame')
    var calls = state.frame.calls, len = calls.length
    state.frame.defs(function () {
      for (var i = 0; i < len; i++) {
        var c = calls[i]
        if (typeof c.preDraw === 'function') c.preDraw(state)
      }
      for (var i = 0; i < len; i++) {
        var c = calls[i]
        if (typeof c.draw === 'function') c.draw(state)
      }
      for (var i = 0; i < len; i++) {
        var c = calls[i]
        if (typeof c.postDraw === 'function') c.postDraw(state)
      }
    })
    emitter.emit('post-frame')
  }
  emitter.on('draw-module', function (f) {
    state.frame.modules.push(f)
    if (state.frame.regl) state.frame.calls.push(f(state.frame.regl))
  })
  emitter.on('regl', function (regl) {
    state.frame.regl = regl
    state.frame.defs = regl({ uniforms: state.uniforms })
    state.frame.modules.forEach(function (f) {
      state.frame.calls.push(f(regl))
    })
    idlecb(function () { emitter.emit('frame') })
  })
}
