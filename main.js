var app = {
  state: {},
  emitter: require('nanobus')()
}
require('./lib/state/frame.js')(app.state, app.emitter)
require('./lib/state/camera.js')(app.state, app.emitter)
require('./lib/state/geometry.js')(app.state, app.emitter)
require('./lib/state/pick.js')(app.state, app.emitter)
require('./lib/state/ui.js')(app.state, app.emitter)

var canvas = document.createElement('canvas')
document.body.appendChild(onresize(canvas))
window.addEventListener('resize', onresize)
function onresize () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'absolute'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.top = '0px'
  canvas.style.left = '0px'
  app.state.width = window.innerWidth
  app.state.height = window.innerHeight
  app.emitter.emit('resize', app.state.width, app.state.height)
  return canvas
}

var regl = require('regl')({
  canvas: canvas,
  extensions: [
    'oes_standard_derivatives',
    'oes_element_index_uint',
    'oes_texture_float'
  ]
})
var camera = require('regl-camera')(regl, { distance: 150 })

app.emitter.emit('draw-module', require('./lib/draw/solid.js'))
app.emitter.emit('draw-module', require('./lib/draw/box.js'))
app.emitter.emit('draw-module', require('./lib/draw/handles.js'))

canvas.addEventListener('mousedown', onmouse)
canvas.addEventListener('mouseup', onmouse)
canvas.addEventListener('mouseclick', onmouse)
canvas.addEventListener('mousemove', onmouse)

function onmouse (ev) {
  app.emitter.emit('mouse', ev)
}

app.emitter.emit('add-mesh', 'camera0', require('./lib/mesh/camera.json'), {
  scale: [1,2,1], translate: [-1,0,0]
})
app.emitter.emit('add-mesh', 'camera1', require('./lib/mesh/camera.json'), {
  scale: [0.5,0.5,0.5], translate: [0,3,0]
})
app.emitter.emit('add-mesh', 'camera2', require('./lib/mesh/camera.json'), {
  scale: [1,1,1], translate: [2,-1,0]
})

app.emitter.emit('regl', regl)
