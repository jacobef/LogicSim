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
const styles = {
    family: 'proxima-nova, sans-serif',
    size: 10,
    leading: 50,
    weight: 900
};

class Circle {
    constructor({ center, radius, label, logic }) {
        this.center = center;
        this.radius = radius;        
        this.dragging = false;
        this.label = two.makeText(label, center[0], center[1], styles);
        this.label.fill = 'white';
        this.label.translation.set(center[0], center[1] - radius - 2);
        this.logic = logic;

        this._shape = new Two.Circle(center[0], center[1], radius, 32);
        this._circle = new Two.Path(this._shape.vertices, true, true);
        this._circle.position.set(center[0],center[1]);
        this._circle.noStroke().fill = 'white';
        two.add(this._circle);        
        
        if (!(logic instanceof circuit_state.SimpleInput)) {            
            this.nob1_shape = new Two.Circle(center[0] - radius * Math.cos(Math.PI/6), center[1] + radius * Math.sin(Math.PI/6), radius/3, 32);
            this.nob1_circle = new Two.Path(this.nob1_shape.vertices, true, true);
            this.nob1_circle.position.set(center[0] - radius * Math.cos(Math.PI/6), center[1] + radius * Math.sin(Math.PI/6));
            this.nob1_circle.noStroke().fill = 'black';
            two.add(this.nob1_circle);

            this.nob2_shape = new Two.Circle(center[0] - radius * Math.cos(Math.PI/6), center[1] - radius * Math.sin(Math.PI/6), radius/3, 32);
            this.nob2_circle = new Two.Path(this.nob2_shape.vertices, true, true);
            this.nob2_circle.position.set(center[0] - radius * Math.cos(Math.PI/6), center[1] - radius * Math.sin(Math.PI/6));
            this.nob2_circle.noStroke().fill = 'black';
            two.add(this.nob2_circle);
        }        

        this.nob3_shape = new Two.Circle(0, 0, radius/3, 32);
        this.nob3_circle = new Two.Path(this.nob3_shape.vertices, true, true);
        this.nob3_circle.position.set(center[0] + radius, center[1]);
        this.nob3_circle.noStroke().fill = 'black';
        two.add(this.nob3_circle);
    }
}

const in1 = new circuit_state.SimpleInput(false, 0.05, 0.05, "INPUT 1");
const in1_circ = make_circ_from_logic(in1);

const in2 = new circuit_state.SimpleInput(false, 0.05, 0.1, "INPUT 2");
const in2_circ = make_circ_from_logic(in2);

const nor1 = new circuit_state.NorGate(
    [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
    0.2, 0.1, "NOR 1"
);
const nor1_circ = make_circ_from_logic(nor1);

function make_circ_from_logic(logic) {
    return new Circle({
        center: [Math.floor(two.width * logic.x), Math.floor(two.height * logic.y)],
        radius: Math.floor(logic.radius * two.width),
        logic: logic,
        label: logic.label,
    });
}




const nor2 = new circuit_state.NorGate(
    [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
    0.2, 0.2, "NOR 2"
);

const nor2_circ = make_circ_from_logic(nor2);

nor1.connectionsIn[0] = new circuit_state.GateConnection(nor2, 0);
nor2.connectionsIn[1] = new circuit_state.GateConnection(nor1, 0);
const out = new circuit_state.SimpleOutput(new circuit_state.GateConnection(nor2, 0), 0.6, 0.5, "OUT");

const out_circ = make_circ_from_logic(out);

// console.log(out.getState());


let circles = [
    in1_circ,
    in2_circ,
    nor1_circ,
    nor2_circ,
    out_circ,    
];

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    for (const circ of circles) {
        let is_within = within([mouse.x, mouse.y], circ.center, circ.radius);        
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
        if (is_within && circ.logic instanceof circuit_state.SimpleInput) {
            circ.logic.state = !circ.logic.state;
        }
        
        if (circ.logic instanceof circuit_state.SimpleOutput) {
            circ.logic.getState();
        }

        circ.dragging = false;
    });
});

// circles.forEach(circ => {
//     circ._circle.position.set(circ.center[0], circ.center[1]);
//     circ._circle.noStroke().fill = circ.logic.getState() ? 'red' : 'white';
// });

two.bind('update', function() {    
    circles.forEach(circ => {        
        circ._circle.position.set(circ.center[0], circ.center[1]);
        circ._circle.noStroke().fill = circ.logic.getState()[0] ? 'red' : 'white';

        circ.label.translation.set(circ.center[0], circ.center[1] - circ.radius - 2);
        
        if (circ.logic instanceof circuit_state.SimpleInput) {    
            console.log(circ.logic.state);
            console.log(circ.logic.getState());
        }

        if (!(circ.logic instanceof circuit_state.SimpleInput)) {            
            circ.nob1_circle.position.set(circ.center[0] - circ.radius * Math.cos(Math.PI/6), circ.center[1] + circ.radius * Math.sin(Math.PI/6));
            circ.nob2_circle.position.set(circ.center[0] - circ.radius * Math.cos(Math.PI/6), circ.center[1] - circ.radius * Math.sin(Math.PI/6));
        }        
        circ.nob3_circle.position.set(circ.center[0] + circ.radius, circ.center[1]);
    });
});

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
