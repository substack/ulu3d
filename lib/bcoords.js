module.exports = function (cells, positions) {
  var mesh = { positions: [], cells: [], bcoords: [] }
  for (var i = 0; i < cells.length; i++) {
    var c = cells[i]
    var p0 = positions[c[0]]
    var p1 = positions[c[1]]
    var p2 = positions[c[2]]
    var k = mesh.positions.length
    mesh.cells.push([k+0,k+1,k+2])
    mesh.positions.push(p0,p1,p2)
    mesh.bcoords.push([1,0,0],[0,1,0],[0,0,1])
  }
  return mesh
}
