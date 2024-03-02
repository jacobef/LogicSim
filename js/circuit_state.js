class SimpleGate {
    constructor(connectionsIn) {
        console.assert(connectionsIn instanceof Array)
        for (const conn of connectionsIn) {
            console.assert(conn instanceof GateConnection);
        }
        this.connectionsIn = connectionsIn;
    }

    getState(visited= []) {
        const bool_inputs = []
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

class SimpleInput {
    constructor(initialState) {
        console.assert(typeof initialState === "boolean");
        this.state = initialState;
    }

    getState() {
        return [this.state];
    }
}

class SimpleOutput {
    constructor(initialState) {
        this.state = initialState;
    }
}

class GateConnection {
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

class AndGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 2);
        return [inputs[0] && inputs[1]];
    }
}

class OrGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 2);
        return [inputs[0] || inputs[1]];
    }
}

class NotGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 1);
        return [!inputs[0]];
    }
}

class NorGate extends SimpleGate {
    getStateHelper(inputs) {
        super.getStateHelper(inputs);
        checkArr(inputs, 2);
        return [!inputs[0] && !inputs[1]];
    }
}

function exampleUsage() {
    const in1 = new SimpleInput(false);
    const in2 = new SimpleInput(false);
    const nor1 = new NorGate(
        [new GateConnection(in1, 0), new GateConnection(in2, 0)]
    );
    const nor2 = new NorGate(
        [new GateConnection(in1, 0), new GateConnection(in2, 0)]
    );
    nor1.connectionsIn[0] = new GateConnection(nor2, 0);
    nor2.connectionsIn[1] = new GateConnection(nor1, 0);

    console.log(nor1.getState());
}
