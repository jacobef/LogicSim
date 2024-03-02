import Two from 'https://cdn.skypack.dev/two.js@latest';
import * as circuit_state from './circuit_state.js';

const canvas = document.getElementById('two');

const two = new Two({
  type: Two.Types.svg,
  fullscreen: false,
  autostart: true
}).appendTo(canvas);

two.renderer.domElement.style.background = '#fcb215';

const CANVAS_CENTER_X = two.width / 2;
console.log(CANVAS_CENTER_X);
const CANVAS_CENTER_Y = two.height / 2;
console.log(CANVAS_CENTER_Y);
var mouse = new Two.Vector(CANVAS_CENTER_X, CANVAS_CENTER_Y);
// var radius = 50;

// var shape = new Two.Circle(0, 0, radius, 32);

// var rectangle = two.makeRectangle(two.width / 2, two.height / 2, 300, 300);
// rectangle.fill = 'rgb(234, 60, 50)';
// rectangle.linewidth = 10;

// var ball = new Two.Path(shape.vertices, true, true);
// ball.position.set(CANVAS_CENTER_X, CANVAS_CENTER_Y);
// ball.noStroke().fill = 'white';

// two.add(ball);
// console.log(ball);
// var circle_objects = [ball];

class Circle {
    constructor({ center, radius, label }) {
        this.center = center;
        this.radius = radius;
        this.on = false;
        this.dragging = false;
        this.label = label;

        this._shape = new Two.Circle(center[0], center[1], radius, 32);
        this._circle = new Two.Path(this._shape.vertices, true, true);
        this._circle.position.set(center[0],center[1]);
        this._circle.noStroke().fill = 'white';
        two.add(this._circle);
    }
}

const in1 = new circuit_state.SimpleInput(false, 0.05, 0.05, "INPUT 1");

console.log(Math.floor(two.width * in1.x));
console.log(Math.floor(two.height * in1.y));
const my_circ = new Circle({
    center: [Math.floor(two.width * in1.x), Math.floor(two.height * in1.y)],
    radius: Math.floor(in1.radius * two.width),
});


const in2 = new circuit_state.SimpleInput(false, 0.05, 0.1, "INPUT 2");
const nor1 = new circuit_state.NorGate(
    [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
    0.2, 0.1, "NOR 1"
);
const nor2 = new circuit_state.NorGate(
    [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
    0.2, 0.2, "NOR 2"
);
nor1.connectionsIn[0] = new circuit_state.GateConnection(nor2, 0);
nor2.connectionsIn[1] = new circuit_state.GateConnection(nor1, 0);
const out = new circuit_state.SimpleOutput(new circuit_state.GateConnection(nor2, 0), 0.6, 0.5, "OUT");

console.log(out.getState());


let circles = [
    my_circ,
    // new Circle({
    //     center: [CANVAS_CENTER_X, CANVAS_CENTER_Y],
    //     radius: 30,        
    // }),
    // new Circle({
    //     center: [CANVAS_CENTER_X + 100, CANVAS_CENTER_Y + 200],
    //     radius: 30,
    // }),
    // new Circle({
    //     center: [CANVAS_CENTER_X + 200, CANVAS_CENTER_Y + 200],
    //     radius: 30,
    // }),
    // new Circle({
    //     center: [CANVAS_CENTER_X, CANVAS_CENTER_Y + 200],
    //     radius: 30,
    // }),
    // new Circle({
    //     center: [CANVAS_CENTER_X - 100, CANVAS_CENTER_Y + 200],
    //     radius: 30,
    // }),
];

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    for (const circ of circles) {
        let is_within = within([mouse.x, mouse.y], [circ.center[0], circ.center[1]], circ.radius);        
        if (is_within) {            
            circ.dragging = true;
            break;
        }
    }    
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    circles.forEach(circ => {              
        if (circ.dragging) {
            circ.center = [mouse.x, mouse.y];
        }
    });    
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    circles.forEach(circ => {
        // console.log(circ);
        // console.log(mouse.x, mouse.y, circ.center, circ.radius);
        let is_within = within([mouse.x, mouse.y], [circ.center[0], circ.center[1]], circ.radius);
        // console.log(is_within);        
        if (is_within) {
            circ.on = !circ.on;
        }

        circ.dragging = false;
    });
});

circles.forEach(circ => {
    circ._circle.position.set(circ.center[0], circ.center[1]);
    circ._circle.noStroke().fill = circ.on ? 'red' : 'white';
});

two.bind('update', function() {    
    circles.forEach(circ => {
        circ._circle.position.set(circ.center[0], circ.center[1]);
        circ._circle.noStroke().fill = circ.on ? 'red' : 'white';
    });
});

const styles = {
    family: 'proxima-nova, sans-serif',
    size: 50,
    leading: 50,
    weight: 900
};

const text = two.makeText('hello Joshua', two.width / 3, two.height / 2, styles);
text.fill = 'white';
text.translation.set(two.width / 2 + 100, two.height / 2);

function within(point, circle_center, radius) {
    return distance(point, circle_center) < radius;
}

function distance(a, b) {
    let i = 0;
    return Math.sqrt(a.reduce((acc, el) => {
        acc += (el - b[i])**2;
        i += 1;
        return acc;
    }, 0));
}
