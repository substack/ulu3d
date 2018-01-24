var regl = require('regl')({
  extensions: [
    'oes_standard_derivatives', 'oes_element_index_uint',
    'oes_texture_float'
  ]
})
var camera = require('regl-camera')(regl, { distance: 150 })
var app = {
  state: {},
  emitter: require('nanobus')()
}
require('./lib/state/frame.js')(app.state, app.emitter)
require('./lib/state/camera.js')(app.state, app.emitter)
require('./lib/state/meshes.js')(app.state, app.emitter)

app.emitter.emit('draw-module', require('./lib/draw/solid.js'))

var mat4 = require('gl-mat4')
app.emitter.emit('add-mesh', 'camera', Object.assign({
  model: function (m) {
    mat4.identity(m)
    mat4.rotateY(m,m,performance.now()*0.001)
    return m
  }
}, require('./lib/mesh/cool.json')))

app.emitter.emit('regl', regl)

app.emitter.on('post-frame', function () {
  app.emitter.emit('frame')
})
