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

export class CircuitState {
    constructor(things) {
        console.assert(things instanceof Set);
        for (const thing of things) {
            console.assert(thing instanceof VisibleThing);
        }
        this.things = things;
    }

    deepCopy() {
        const newCopy = new Set();
        for (const thing of this.things) {
            newCopy.add(thing.deepCopy());
        }
        return new CircuitState(newCopy);
    }
}

export class SimpleGate extends VisibleThing {
    constructor(connectionsIn, x, y, label) {
        super(x, y, 0.05, label);
        console.assert(connectionsIn instanceof Array);
        for (const conn of connectionsIn) {
            console.assert(conn instanceof GateConnection);
        }
        this.connectionsIn = connectionsIn;
        this.lastState = null;
    }

    getState(visited= []) {
        const boolInputs = [];
        for (const conn of this.connectionsIn) {
            if (visited.includes(conn.gateOrInput) || this === conn.gateOrInput) {
                if (conn.gateOrInput instanceof SimpleGate && conn.gateOrInput.lastState !== null) {
                    boolInputs.push(conn.gateOrInput.lastState[conn.index]);
                } else {
                    boolInputs.push(Math.random() < 0.5);
                }
            } else {
                boolInputs.push(conn.gateOrInput.getState([...visited, conn.gateOrInput])[conn.index]);
            }
        }
        const newState = this.getStateHelper(boolInputs);
        this.lastState = newState;
        return newState;
    }

    getStateHelper(inputs) {        
        for (const input of inputs) {
            console.assert(typeof input === "boolean");
        }
    }

    deepCopy(visited = {}) {
        const newConnectionsIn = [];
        for (const conn of this.connectionsIn) {
            if (conn in visited) {
                newConnectionsIn.push(visited[conn]);
            } else {
                const newCopy = conn.deepCopy();
                newConnectionsIn.push(newCopy);
                visited[conn] = newCopy;
            }
        }
        return new this.constructor(newConnectionsIn, this.x, this.y, this.label);
    }
}

export class SimpleInput extends VisibleThing {
    constructor(initialState, x, y, label) {
        super(x, y, 0.025, label);
        console.assert(typeof initialState === "boolean");
        this.state = initialState;
    }

    getState(visited = []) {
        return [this.state];
    }

    deepCopy(visited = {}) {
        return new SimpleInput(this.state, this.x, this.y, this.label);
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
            return [this.connection.gateOrInput.getState()[this.connection.index]];
        }
    }

    deepCopy(visited = {}) {
        if (this.connection === null) {
            return new SimpleOutput(null, this.x, this.y, this.label);
        } else if (this.connection in visited) {
            return visited[this.connection];
        } else {
            const newCopy = this.connection.deepCopy(visited);
            visited[this.connection] = newCopy;
            return newCopy;
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
        console.assert(inputs instanceof Array);
        if (inputs.length < 2)  return [false];
        else return [inputs[0] && inputs[1]];
    }
}

export class OrGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        console.assert(inputs instanceof Array);
        if (inputs.length < 2)  return [false];
        else return [inputs[0] || inputs[1]];
    }
}

export class NotGate extends SimpleGate {
    getStateHelper(inputs) {        
        super.getStateHelper(inputs);
        console.assert(inputs instanceof Array);
        if (inputs.length < 1) return [false];
        else return [!inputs[0]];
    }
}

export class NorGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        console.assert(inputs instanceof Array);
        if (inputs.length < 2) return [false]
        else return [!inputs[0] && !inputs[1]];
    }
}

export function exampleUsage() {
    const in1 = new SimpleInput(false, 0.05, 0.05, "SET");
    const in2 = new SimpleInput(false, 0.05, 0.1, "RESET");
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
    const out1 = new SimpleOutput(new GateConnection(nor1, 0), 0.6, 0.5, "Q");
    const out2 = new SimpleOutput(new GateConnection(nor2, 0), 0.6, 0.7, "NOT Q")
}
