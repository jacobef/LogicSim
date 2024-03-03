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

class Knob {
    constructor(parent_circle, knob_num) {
        this.parent_circle = parent_circle;
        this.radius = Math.floor(this.parent_circle.radius/3);
        this.knob_num = knob_num;
        this._shape = new Two.Circle(0,0, parent_circle.radius/3, 32);
        this._circle = new Two.Path(this._shape.vertices, true, true);
        const [ x, y ] = this.position();
        this._circle.position.set(x,y);
        this._circle.noStroke().fill = 'black';
        two.add(this._circle);
    }    

    position() {
        switch (this.knob_num) {
        case 1:
            return [this.parent_circle.center[0] - this.parent_circle.radius * Math.cos(Math.PI/6), this.parent_circle.center[1] + this.parent_circle.radius * Math.sin(Math.PI/6)];
            break;
        case 2:
            return [this.parent_circle.center[0] - this.parent_circle.radius * Math.cos(Math.PI/6), this.parent_circle.center[1] - this.parent_circle.radius * Math.sin(Math.PI/6)];
            break;
        case 3:
            return [this.parent_circle.center[0] + this.parent_circle.radius, this.parent_circle.center[1]];
            break;
        }
    }
}

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
        this.input_knobs = [];        
        
        if (!(logic instanceof circuit_state.SimpleInput)) {
            this.input_knobs[0] = new Knob(this, 1);
            this.input_knobs[1] = new Knob(this, 2);
            // const [ nob1x, nob1y ] = this.nob1_position();
            // this.nob1_shape = new Two.Circle(nob1x, nob1y, radius/3, 32);
            // this.nob1_circle = new Two.Path(this.nob1_shape.vertices, true, true);
            // this.nob1_circle.position.set(nob1x, nob1y);
            // this.nob1_circle.noStroke().fill = 'black';
            // two.add(this.nob1_circle);

            // const [ nob2x, nob2y ] = this.nob2_position();
            // this.nob2_shape = new Two.Circle(nob2x, nob2y, radius/3, 32);
            // this.nob2_circle = new Two.Path(this.nob2_shape.vertices, true, true);
            // this.nob2_circle.position.set(nob2x, nob2y);
            // this.nob2_circle.noStroke().fill = 'black';
            // two.add(this.nob2_circle);
        }        

        this.output_knob = new Knob(this, 3);
        // const [ nob3x, nob3y ] = this.nob2_position();
        // this.nob3_shape = new Two.Circle(0, 0, radius/3, 32);
        // this.nob3_circle = new Two.Path(this.nob3_shape.vertices, true, true);
        // this.nob3_circle.position.set(nob3x, nob3y);
        // this.nob3_circle.noStroke().fill = 'black';
        // two.add(this.nob3_circle);
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
        
        circ.input_knobs.concat([circ.output_knob]).forEach(knob => {            
            const is_within = within([mouse.x, mouse.y], knob.position(), knob.radius);
            if (is_within) {
                const [ x, y ] = knob.position();
                knob.line = new Two.Line(x, y, mouse.x, mouse.y);
            }
        });                
    }    
});

// const hands = {
//     hour: new Two.Line(100, 100, 200, 200),
//     minute: new Two.Line(0, 0, 0, - 50 * 0.8),
//     second: new Two.Line(0, 0, 0, - 50 * 0.9)
// };

// hands.hour.noFill();
// hands.hour.stroke = 'blue';
// hands.hour.linewidth = 10;
// hands.hour.cap = 'round';
// two.add(hands.hour);

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    circles.forEach(circ => {              
        if (circ.dragging) {
            circ.center = [mouse.x, mouse.y];            
        }

        circ.input_knobs.concat([circ.output_knob]).forEach(knob => {
            
            if (knob.line) {
                two.remove(knob.line);                    

                const [ x, y ] = knob.position(); 
                
                knob.line = new Two.Line(x, y, mouse.x, mouse.y);
                knob.line.noFill();
                knob.line.stroke = 'blue';
                knob.linewidth = 20;
                knob.line.cap = 'round';
                two.add(knob.line);
            }
        });                
    });    
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    circles.forEach(circ => {
        circ.input_knobs.concat([circ.output_knob]).forEach((knob,i) => {            
            if (knob.line) {
                // get other knobs
                const other_knobs = circ.input_knobs.concat([circ.output_knob]).filter((knob, j) => {
                    return j != i;
                });

                if (other_knobs.some(other_knob => {                    
                    let is_within = within([mouse.x, mouse.y], other_knob.position(), knob.radius);
                    if (is_within) {
                        if (other_knob.parent_circle.logic instanceof circuit_state.SimpleOutput) {
                            
                        }
                    }
                })) 
                
                two.remove(knob.line);
                knob.line = null;                
            }
        });
        
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
            circ.input_knobs.forEach(knob => {
                const [ x, y ] = knob.position();
                knob._circle.position.set(x,y);
            });            
        }
        const [ x, y ] = circ.output_knob.position();
        circ.output_knob._circle.position.set(x,y);        
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
