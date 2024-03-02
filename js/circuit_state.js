

export class VisibleThing {
    constructor(x, y, radius, label) {
        console.assert(0 <= x && x <= 1);
        this.x = x;
        console.assert(0 <= y && y <= 1);
        this.y = y;
        console.assert(0 <= radius && radius <= 1);
        this.radius = radius;
        console.assert(typeof label === "string");
        this.label = label;
    }
}

export class SimpleGate extends VisibleThing {
    constructor(connectionsIn, x, y, label) {
        super(x, y, 0.05, label);
        console.assert(connectionsIn instanceof Array)
        for (const conn of connectionsIn) {
            console.assert(conn instanceof GateConnection);
        }
        this.connectionsIn = connectionsIn;
    }

    getState(visited= []) {
        const bool_inputs = [];
        for (const conn of this.connectionsIn) {
            console.log(conn.gateOrInput);
            if (visited.includes(conn.gateOrInput) || this === conn.gateOrInput) {
                bool_inputs.push(Math.random() < 0.5);
            } else {
                console.log(visited);
                bool_inputs.push(conn.gateOrInput.getState([...visited, conn.gateOrInput])[conn.index]);
            }
        }
        return this.getStateHelper(bool_inputs);
    }
    getStateHelper(inputs) {
        for (const input of inputs) {
            console.assert(typeof input === "boolean");
        }
    }
}

export class SimpleInput extends VisibleThing {
    constructor(initialState, x, y, label) {
        super(x, y, 0.025, label);
        console.assert(typeof initialState === "boolean");
        this.state = initialState;
    }

    getState() {
        return [this.state];
    }
}

export class SimpleOutput extends VisibleThing {
    constructor(connection, x, y, label) {
        super(x, y, 0.025, label);
        console.assert(connection instanceof GateConnection || connection === null);
        this.connection = connection;
    }
    getState() {
        if (this.connection === null) {
            return [false];
        } else {
            return this.connection.gateOrInput.getState()[this.connection.index];
        }
    }
}

export class GateConnection {
    constructor(gateOrInput, index) {
        console.assert(typeof gateOrInput.getState === "function");
        this.gateOrInput = gateOrInput;
        console.assert(Number.isInteger(index));
        this.index = index;
    }
}

function checkArr(inputs, requiredLength) {
    console.assert(inputs instanceof Array);
    console.assert(inputs.length === requiredLength);
}

export class AndGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 2);
        return [inputs[0] && inputs[1]];
    }
}

export class OrGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 2);
        return [inputs[0] || inputs[1]];
    }
}

export class NotGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 1);
        return [!inputs[0]];
    }
}

export class NorGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 2);
        return [!inputs[0] && !inputs[1]];
    }
}

function exampleUsage() {
    const in1 = new SimpleInput(false, 0.05, 0.05, "INPUT 1");
    const in2 = new SimpleInput(false, 0.05, 0.1, "INPUT 2");
    const nor1 = new NorGate(
        [new GateConnection(in1, 0), new GateConnection(in2, 0)],
        0.2, 0.1, "NOR 1"
    );
    const nor2 = new NorGate(
        [new GateConnection(in1, 0), new GateConnection(in2, 0)],
        0.2, 0.2, "NOR 2"
    );
    nor1.connectionsIn[0] = new GateConnection(nor2, 0);
    nor2.connectionsIn[1] = new GateConnection(nor1, 0);
    const out = new SimpleOutput(new GateConnection(nor2, 0), 0.6, 0.5, "OUT");

    console.log(out.getState());
}
