import Two from 'https://cdn.skypack.dev/two.js@latest';

var two = new Two({
  type: Two.Types.svg,
  fullscreen: true,
  autostart: true
}).appendTo(document.body);

two.renderer.domElement.style.background = '#fcb215';
two.renderer.domElement.style.cursor = 'none';

var cx = two.width / 2;
var cy = two.height / 2;
var delta = new Two.Vector();
var mouse = new Two.Vector(cx, cy);
var drag = 0.33;
var radius = 50;

var shape = new Two.Circle(0, 0, radius, 32);

var shadow = new Two.Path(shape.vertices, true, true);
shadow.position.set(cx, cy);
shadow.noStroke().fill = 'rgba(0, 0, 0, 0.2)';
shadow.offset = new Two.Vector(- radius / 2, radius * 2);
shadow.scale = 1.2;

var ball = new Two.Path(shape.vertices, true, true);
ball.position.set(cx, cy);
ball.noStroke().fill = 'white';

for (var i = 0; i < ball.vertices.length; i++) {
  var v = ball.vertices[i];
  v.origin = v.clone();
}

two.add(shadow, ball);

window.addEventListener('mousemove', function(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
  shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
}, false);

window.addEventListener('touchstart', function() {
  e.preventDefault();
  return false;
}, false);

window.addEventListener('touchmove', function(e) {
  e.preventDefault();
  var touch = e.changedTouches[0];
  mouse.x = touch.pageX;
  mouse.y = touch.pageY;
  shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
  shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
  return false;
}, false);

two.bind('update', function() {

  delta.copy(mouse).subSelf(ball.translation);
  
  for (var i = 0; i < ball.vertices.length; i++) {

    var v = ball.vertices[i];
    var dist = v.origin.distanceTo(delta);
    var pct = dist / radius;

    var x = delta.x * pct;
    var y = delta.y * pct;

    var destx = v.origin.x - x;
    var desty = v.origin.y - y;

    v.x += (destx - v.x) * drag;
    v.y += (desty - v.y) * drag;

    shadow.vertices[i].copy(v);

  }

  ball.translation.addSelf(delta);

  shadow.translation.copy(ball.translation);
  shadow.translation.addSelf(shadow.offset);
  
});
