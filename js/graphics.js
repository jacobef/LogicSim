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

const styles = {
    family: 'proxima-nova, sans-serif',
    size: 10,
    leading: 50,
    weight: 900
};


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

        this.is_drawing = false;
    }    

    position() {
        switch (this.knob_num) {
        case 1:
            return [Math.floor(this.parent_circle.center[0] - this.parent_circle.radius * Math.cos(Math.PI/6)), Math.floor(this.parent_circle.center[1] + this.parent_circle.radius * Math.sin(Math.PI/6))];
            break;
        case 2:
            return [Math.floor(this.parent_circle.center[0] - this.parent_circle.radius * Math.cos(Math.PI/6)), Math.floor(this.parent_circle.center[1] - this.parent_circle.radius * Math.sin(Math.PI/6))];
            break;
        case 3:
            return [Math.floor(this.parent_circle.center[0] + this.parent_circle.radius), Math.floor(this.parent_circle.center[1])];
            break;
        }
    }

    update() {
        const [ x, y ] = this.position();
        this._circle.position.set(x,y);
        
        if (this.is_drawing) {
            if (this.line) {
                two.remove(this.line);
            }            

            const [ x, y ] = this.position(); 
            
            this.line = new Two.Line(x, y, mouse.x, mouse.y);
            this.line.noFill();
            this.line.stroke = 'blue';
            this.linewidth = 80;
            this.line.cap = 'round';
            two.add(this.line);
        } else if ((this.parent_circle.dragging && this.connection_input) || (this.connection_input && this.connection_input.parent_circle.dragging)) {
            if (this.line) {
                two.remove(this.line);
            }

            const [ x, y ] = this.position();

            const [ x_connected, y_connected ] = this.connection_input.position();
            
            this.line = new Two.Line(x, y, x_connected, y_connected);
            this.line.noFill();
            this.line.stroke = 'blue';
            this.linewidth = 80;
            this.line.cap = 'round';
            two.add(this.line);
        }
    }
}

class Circle {
    constructor({ center, radius, labelText, logic }) {
        this.center = center;
        this.radius = radius;        
        this.dragging = false;
        this.labelText = labelText;
        this.label = two.makeText(labelText, center[0], center[1], styles);
        this.label.fill = 'white';
        this.label.translation.set(center[0], center[1] - radius - 2);
        this.logic = logic;

        this._shape = new Two.Circle(center[0], center[1], radius, 32);
        this._circle = new Two.Path(this._shape.vertices, true, true);
        this._circle.position.set(center[0],center[1]);
        this._circle.noStroke().fill = 'white';
        two.add(this._circle);
        this.input_knobs = [];                        

        if ((logic instanceof circuit_state.NotGate) || (logic instanceof circuit_state.SimpleOutput)) {
            this.input_knobs[0] = new Knob(this, 1);
        } else if (!(logic instanceof circuit_state.SimpleInput)) {
            this.input_knobs[0] = new Knob(this, 1);
            this.input_knobs[1] = new Knob(this, 2);
        }

        this.output_knob = new Knob(this, 3);        
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

    update() {
        this._circle.position.set(this.center[0], this.center[1]);
        this._circle.noStroke().fill = this.logic.getState()[0] ? 'red' : 'white';
        this.label.translation.set(this.center[0], this.center[1] - this.radius - 2);

        if (!(this.logic instanceof circuit_state.SimpleInput)) {
            this.input_knobs.forEach(knob => {
                const [ x, y ] = knob.position();
                knob._circle.position.set(x,y);
            });            
        }
        this.output_knob.update();        
    }
}

class MenuCircle extends Circle {
    constructor({ center, radius, logic, labelText }) {
        super({ center, radius, logic, labelText });

        this.original_center = center;
    }
}

function make_circ_from_logic(logic) {
    return new Circle({
        center: [Math.floor(two.width * logic.x), Math.floor(two.height * logic.y)],
        radius: Math.floor(logic.radius * two.width),
        logic: logic,
        labelText: logic.label,
    });
}

function make_circ_from_menu_circ(menu_circ) {
    return new Circle({
        center: menu_circ.center,
        radius: menu_circ.radius,
        logic: menu_circ.logic.deepCopy(),
        labelText: menu_circ.labelText,
    });
}

function make_menu_circ_from_logic(logic) {
    return new MenuCircle({
        center: [Math.floor(two.width * logic.x), Math.floor(two.height * logic.y)],
        radius: Math.floor(logic.radius * two.width),
        logic: logic,
        labelText: logic.label,        
    });
}

// const in1 = new circuit_state.SimpleInput(false, 0.05, 0.05, "INPUT 1");
// const in1_circ = make_circ_from_logic(in1);
// const in2 = new circuit_state.SimpleInput(false, 0.05, 0.1, "INPUT 2");
// const in2_circ = make_circ_from_logic(in2);
// const and = new circuit_state.AndGate(
//     [],
//     0.2, 0.1, "And 1"
// );

// const and_circ = make_circ_from_logic(and);
// const not = new circuit_state.NotGate(    
//     [],
//     0.2, 0.2, "NOT 1"
// );
// const not_circ = make_circ_from_logic(not);
// const out = new circuit_state.SimpleOutput(null, 0.6, 0.5, "OUT");
// const out_circ = make_circ_from_logic(out);

let circles = [
    // in1_circ,
    // in2_circ,
    // and_circ,
    // not_circ,
    // out_circ,    
];

const menu_circles = [
    make_menu_circ_from_logic(new circuit_state.SimpleInput(false, 0.05, 0.95, "INPUT")),
    make_menu_circ_from_logic(new circuit_state.AndGate(    
        [],
        0.2, 0.95, "AND"
    )),
    make_menu_circ_from_logic(new circuit_state.NotGate(    
        [],
        0.4, 0.95, "NOT"
    )),
    make_menu_circ_from_logic(new circuit_state.SimpleOutput(null, 0.6, 0.95, "OUT")),
    make_menu_circ_from_logic(new circuit_state.NorGate([], 0.8, 0.95, "NOR")),
];

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    for (const circ of circles.concat(menu_circles)) {
        let is_within = within([mouse.x, mouse.y], circ.center, circ.radius);        
        if (is_within) {            
            circ.dragging = true;            
            break;
        }
        
        is_within = within([mouse.x, mouse.y], circ.output_knob.position(), circ.output_knob.radius);
        if (is_within) {
            const [ x, y ] = circ.output_knob.position();
            if (circ.output_knob.line) {                
                two.remove(circ.output_knob.line);
                console.log(circ.output_knob.connection_input.parent_circle.logic);
            }
            circ.output_knob.line = new Two.Line(x, y, mouse.x, mouse.y);
            circ.output_knob.is_drawing = true;
        }  
    }
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    circles.concat(menu_circles).forEach(circ => {              
        if (circ.dragging) {
            circ.center = [mouse.x, mouse.y];
        }                          
    });    
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    for (const menu_circ of menu_circles) {
        if (menu_circ.dragging) {
            circles.push(make_circ_from_menu_circ(menu_circ));
            menu_circ.dragging = false;
            menu_circ.center = menu_circ.original_center;
        }
    }    

    const input_knobs = circles.reduce((acc, circ) => acc.concat(circ.input_knobs), []);
    let connected_output_knobs = [];
    for (const input_knob of input_knobs) {        
        const is_within = within([mouse.x, mouse.y], input_knob.position(), input_knob.radius);

        if (is_within) {
            const circle_connecting_from = circles.find(circ => circ.output_knob.is_drawing);
            connected_output_knobs.push(circle_connecting_from.output_knob);
            console.log(circle_connecting_from);
            
            if (input_knob.parent_circle.logic instanceof circuit_state.SimpleOutput) {
                input_knob.parent_circle.logic.connection = new circuit_state.GateConnection(circle_connecting_from.logic, 0);                
            } else if (input_knob.parent_circle.logic instanceof circuit_state.SimpleInput) {
                // do nothing
            } else if (input_knob.parent_circle.logic instanceof circuit_state.SimpleGate) {                            
                input_knob.parent_circle.logic.connectionsIn.push(new circuit_state.GateConnection(circle_connecting_from.logic, 0));
            }
            
            circle_connecting_from.output_knob.connection_input = input_knob;
            circle_connecting_from.output_knob.is_drawing = false;
        }
    }
    
    circles.forEach((circ, k) => {
        let is_within = within([mouse.x, mouse.y], [circ.center[0], circ.center[1]], circ.radius);
        
        if (is_within && circ.logic instanceof circuit_state.SimpleInput) {
            circ.logic.state = !circ.logic.state;
        }                       

        // if (!connected_output_knobs.includes(circ.output_knob) && !circ.dragging & !) {
        //     console.log('here');
        //     circ.output_knob.is_drawing = false;
        //     two.remove(circ.output_knob.line);
        //     circ.output_knob.line = null;
        // }

        circ.dragging = false;
    });    
});

two.bind('update', function() {    
    circles.concat(menu_circles).forEach(circ => {        
        circ.update();
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
