import Two from 'https://cdn.skypack.dev/two.js@latest';
import * as circuit_state from './circuit_state.js';

const canvas = document.getElementById('two');

const two = new Two({
  type: Two.Types.svg,
  fullscreen: true,
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

const hands = {
    hour: new Two.Line(100, 100, 200, 200),
    minute: new Two.Line(0, 0, 0, - 50 * 0.8),
    second: new Two.Line(0, 0, 0, - 50 * 0.9)
};

hands.hour.noFill();
hands.hour.stroke = 'blue';
hands.hour.linewidth = 10;
hands.hour.cap = 'round';
two.add(hands.hour);

class Circle {
    constructor({ center, radius, label, logic }) {
        this.center = center;
        this.radius = radius;        
        this.dragging = false;
        this.label = two.makeText(label, center[0], center[1], styles);
        this.label.fill = 'white';
        this.label.translation.set(center[0], center[1] - radius - 2);
        this.logic = logic;
        
        this.drawing_start = false;

        this._shape = new Two.Circle(center[0], center[1], radius, 32);
        this._circle = new Two.Path(this._shape.vertices, true, true);
        this._circle.position.set(center[0],center[1]);
        this._circle.noStroke().fill = 'white';
        two.add(this._circle);        
        
        if (!(logic instanceof circuit_state.SimpleInput)) {
            const [ nob1x, nob1y ] = this.nob1_position();
            this.nob1_shape = new Two.Circle(nob1x, nob1y, radius/3, 32);
            this.nob1_circle = new Two.Path(this.nob1_shape.vertices, true, true);
            this.nob1_circle.position.set(nob1x, nob1y);
            this.nob1_circle.noStroke().fill = 'black';
            two.add(this.nob1_circle);

            const [ nob2x, nob2y ] = this.nob2_position();
            this.nob2_shape = new Two.Circle(nob2x, nob2y, radius/3, 32);
            this.nob2_circle = new Two.Path(this.nob2_shape.vertices, true, true);
            this.nob2_circle.position.set(nob2x, nob2y);
            this.nob2_circle.noStroke().fill = 'black';
            two.add(this.nob2_circle);
        }        

        const [ nob3x, nob3y ] = this.nob2_position();
        this.nob3_shape = new Two.Circle(0, 0, radius/3, 32);
        this.nob3_circle = new Two.Path(this.nob3_shape.vertices, true, true);
        this.nob3_circle.position.set(nob3x, nob3y);
        this.nob3_circle.noStroke().fill = 'black';
        two.add(this.nob3_circle);
    }

    nob1_position() {
        return [this.center[0] - this.radius * Math.cos(Math.PI/6), this.center[1] + this.radius * Math.sin(Math.PI/6)];
    }

    nob2_position() {
        return [this.center[0] - this.radius * Math.cos(Math.PI/6), this.center[1] - this.radius * Math.sin(Math.PI/6)];
    }

    nob3_position() {
        return [this.center[0] + this.radius, this.center[1]];
    }
}

const in1 = new circuit_state.SimpleInput(false, 0.05, 0.05, "INPUT 1");
const in1_circ = make_circ_from_logic(in1);

const in2 = new circuit_state.SimpleInput(false, 0.05, 0.1, "INPUT 2");
const in2_circ = make_circ_from_logic(in2);

const and = new circuit_state.AndGate(
    [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
    0.2, 0.1, "And 1"
);
// const nor1 = new circuit_state.NorGate(
//     [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
//     0.2, 0.1, "NOR 1"
// );
// const nor1_circ = make_circ_from_logic(nor1);
const and_circ = make_circ_from_logic(and);



function make_circ_from_logic(logic) {
    return new Circle({
        center: [Math.floor(two.width * logic.x), Math.floor(two.height * logic.y)],
        radius: Math.floor(logic.radius * two.width),
        logic: logic,
        label: logic.label,
    });
}


const not = new circuit_state.NotGate(
    [new circuit_state.GateConnection(and, 0)],
    0.2, 0.2, "NOT 1"
);

const not_circ = make_circ_from_logic(not);

// const nor2 = new circuit_state.NorGate(
//     [new circuit_state.GateConnection(in1, 0), new circuit_state.GateConnection(in2, 0)],
//     0.2, 0.2, "NOR 2"
// );

// const nor2_circ = make_circ_from_logic(nor2);

// nor1.connectionsIn[0] = new circuit_state.GateConnection(nor2, 0);
// nor2.connectionsIn[1] = new circuit_state.GateConnection(nor1, 0);
// const out = new circuit_state.SimpleOutput(new circuit_state.GateConnection(nor2, 0), 0.6, 0.5, "OUT");
const out = new circuit_state.SimpleOutput(new circuit_state.GateConnection(not, 0), 0.6, 0.5, "OUT");

const out_circ = make_circ_from_logic(out);

// console.log(out.getState());


let circles = [
    in1_circ,
    in2_circ,
    // nor1_circ,
    // nor2_circ,
    and_circ,
    not_circ,
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

        const nob1_position = circ.nob1_position();
        const is_within_nob1 = within([mouse.x, mouse.y], nob1_position, circ.radius/3);
        console.log(nob1_position);
        
        if (is_within_nob1) {
            console.log('here');
            circ.nob1_line = new Two.Line(nob1_position[0], nob1_position[1], mouse.x, mouse.y);
            circ.nob1_line.noFill();
            circ.nob1_line.stroke = 'blue';
            circ.nob1_line.linewidth = 10;
            circ.nob1_line.cap = 'round';
            two.add(circ.nob1_line);
        }

        const nob2_position = circ.nob2_position();
        const is_within_nob2 = within([mouse.x, mouse.y], nob2_position, circ.radius/3);

        const nob3_position = circ.nob3_position();
        const is_within_nob3 = within([mouse.x, mouse.y], nob3_position, circ.radius/3);
    }    
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    circles.forEach(circ => {              
        if (circ.dragging) {
            circ.center = [mouse.x, mouse.y];            
        }

        if (circ.nob1_line) {
            two.remove(circ.nob1_line);
            const nob1_position = circ.nob1_position();
            circ.nob1_line.noFill();
            circ.nob1_line.stroke = 'blue';
            circ.nob1_line.linewidth = 10;
            circ.nob1_line.cap = 'round';
            two.add(circ.nob1_line);
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
