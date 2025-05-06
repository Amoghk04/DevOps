import React, { useEffect, useRef, useState } from "react";

const canvasStyle = {
    marginTop: "20px",
    backgroundColor: "#111",
    backgroundImage: `
    linear-gradient(0deg, #222 1px, transparent 1px),
    linear-gradient(90deg, #222 1px, transparent 1px)
  `,
    backgroundSize: "40px 40px",
    border: "1px solid #0ff"
};

const buttonStyle = {
    margin: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#111",
    color: "#0ff",
    border: "1px solid #0ff",
    cursor: "pointer",
    transition: "background-color 0.3s, color 0.3s"
};

export default function LogicGatePuzzle() {
    const canvasRef = useRef(null);
    const [answer, setAnswer] = useState("");
    const [circuit, setCircuit] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const gates = ["AND", "OR", "NOT"];

        const randomBool = () => (Math.random() < 0.5 ? 0 : 1);
        const getRandomGate = () => gates[Math.floor(Math.random() * gates.length)];

        const evaluateGate = (type, inputs) => {
            if (type === "AND") return inputs[0] & inputs[1];
            if (type === "OR") return inputs[0] | inputs[1];
            if (type === "NOT") return inputs[0] ^ 1;
        };

        const generateGate = (id, possibleInputs) => {
            const type = getRandomGate();
            let ins;
            if (type === "NOT") {
                ins = [possibleInputs[Math.floor(Math.random() * possibleInputs.length)]]; // One input for NOT
            } else {
                const a = possibleInputs[Math.floor(Math.random() * possibleInputs.length)];
                let b;
                do {
                    b = possibleInputs[Math.floor(Math.random() * possibleInputs.length)];
                } while (b === a); // Ensure two different inputs for AND/OR
                ins = [a, b];
            }
            return { id, type, ins };
        };

        const generateCircuit = () => {
            while (true) {
                const inputs = { A: randomBool(), B: randomBool(), C: randomBool() };

                const layer1 = ["G1", "G2", "G3"].map(id => generateGate(id, ["A", "B", "C"]));
                const layer2 = ["G4", "G5", "G6"].map(id => generateGate(id, layer1.map(g => g.id)));
                const layer3 = ["G7", "G8", "G9"].map(id => generateGate(id, layer2.map(g => g.id)));

                const allGates = [...layer1, ...layer2, ...layer3];
                const usedInputs = new Set();
                const usedGateOutputs = new Set();

                allGates.forEach(g => g.ins.forEach(input => usedInputs.add(input)));
                const allInputsUsed = ["A", "B", "C"].every(k => usedInputs.has(k));

                [...layer2, ...layer3].forEach(g => {
                    g.ins.forEach(input => {
                        if (input.startsWith("G")) usedGateOutputs.add(input);
                    });
                });

                const allLayer1Used = layer1.every(g => usedGateOutputs.has(g.id));
                const allLayer2Used = layer2.every(g => usedGateOutputs.has(g.id));
                const allGatesUsed = allLayer1Used && allLayer2Used;

                if (allInputsUsed && allGatesUsed) {
                    const values = { ...inputs };
                    [...layer1, ...layer2, ...layer3].forEach(g => {
                        values[g.id] = evaluateGate(g.type, g.ins.map(i => values[i]));
                    });
                    const outputs = layer3.map(g => values[g.id]);
                    return { inputs, layer1, layer2, layer3, outputs };
                }
            }
        };

        const drawGate = (ctx, x, y, gate) => {
            ctx.strokeStyle = "#0ff";
            ctx.fillStyle = "#222";

            if (gate.type === "AND") {
                const width = 60;
                const height = 40;
                const radius = height / 2;

                ctx.beginPath();
                ctx.moveTo(x - width / 2, y - height / 2);
                ctx.lineTo(x + width / 2 - radius, y - height / 2);
                ctx.arc(x + width / 2 - radius, y, radius, -Math.PI / 2, Math.PI / 2);
                ctx.lineTo(x - width / 2, y + height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (gate.type === "OR") {
                const width = 60;
                const height = 40;

                ctx.beginPath();
                ctx.moveTo(x - width / 2, y - height / 2);
                ctx.quadraticCurveTo(x, y - height / 2, x + width / 2, y);
                ctx.quadraticCurveTo(x, y + height / 2, x - width / 2, y + height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (gate.type === "NOT") {
                ctx.beginPath();
                ctx.moveTo(x - 20, y - 20);
                ctx.lineTo(x + 20, y);
                ctx.lineTo(x - 20, y + 20);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + 25, y, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = "#0ff";
            ctx.fillText(gate.id, x - 10, y - 25);
        };

        const drawCircle = (ctx, x, y, value, op) => {
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI); // Draw a circle with radius 10
            if(op === "input") {
                ctx.fillStyle = value == 1 ? "#0f0" : "#f00"; // Green for 1, red for 0
            }
            else {
                ctx.fillStyle = "white"; // Green for 1, red for 0
            }
            ctx.fill();
            ctx.stroke();
        };

        const drawCircuit = (circuit) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "14px monospace";
            ctx.lineWidth = 2;

            const positions = {};

            // Display only input values as 0 or 1, and draw circles
            ["A", "B", "C"].forEach((key, i) => {
                positions[key] = { x: 120, y: 100 + i * 150 };
                drawCircle(ctx, 140, positions[key].y, circuit.inputs[key], "input"); // Draw circle for input
            });

            const positionLayer = (layer, xStart) => {
                layer.forEach((g, i) => {
                    positions[g.id] = { x: xStart, y: 100 + i * 150 };
                    drawGate(ctx, positions[g.id].x, positions[g.id].y, g);
                });
            };

            positionLayer(circuit.layer1, 400);
            positionLayer(circuit.layer2, 700);
            positionLayer(circuit.layer3, 1000);

            const drawConnections = (layer) => {
                layer.forEach((g) => {
                    g.ins.forEach((input) => {
                        const from = positions[input];
                        const to = positions[g.id];
                        ctx.beginPath();
                        ctx.moveTo(from.x + 30, from.y);
                        ctx.lineTo(to.x - 30, to.y);
                        ctx.stroke();
                    });
                });
            };

            drawConnections(circuit.layer1);
            drawConnections(circuit.layer2);
            drawConnections(circuit.layer3);

            // Only draw output circles, no text
            circuit.outputs.forEach((val, i) => {
                const outputY = 100 + i * 150;
                drawCircle(ctx, 1130, outputY, val, "output"); // Draw circle for output
            });

            // Connect the final gates (layer3) to the outputs with lines
            circuit.layer3.forEach((g, i) => {
                const gatePos = positions[g.id];
                const outputPos = { x: 1150, y: 100 + i * 150 }; // Corresponding output position
                ctx.beginPath();
                ctx.moveTo(gatePos.x + 30, gatePos.y); // Start from the final gate
                ctx.lineTo(outputPos.x - 30, outputPos.y); // Connect to the output
                ctx.stroke();
            });
        };

        const c = generateCircuit();
        drawCircuit(c);
        setCircuit(c);
    }, []);

    const revealAnswer = () => {
        if (circuit) {
            setAnswer("Final Output: " + circuit.outputs.join(" "));
        }
    };

    return (
        <div style={{ background: "#0a0a0a", color: "#0ff", fontFamily: "monospace", textAlign: "center" }}>
            <canvas ref={canvasRef} width="1200" height="500" style={canvasStyle}></canvas>
            <br />
            <button onClick={revealAnswer} style={buttonStyle}>Reveal Answer</button>
            <div>{answer}</div>
        </div>
    );
}
