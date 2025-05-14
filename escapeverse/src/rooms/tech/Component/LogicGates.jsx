import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../../../rooms/GameProvider";

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

// Final code button style with more prominent appearance
const finalCodeButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#111",
    color: "#fff",
    border: "2px solid #0ff",
    padding: "15px 30px",
    fontSize: "18px",
    fontWeight: "bold",
    boxShadow: "0 0 15px #0ff",
    marginTop: "20px"
};

const finalCodeDisplayStyle = {
    marginTop: "30px",
    padding: "20px",
    border: "2px solid #0ff",
    borderRadius: "5px",
    backgroundColor: "#111",
    display: "inline-block",
    boxShadow: "0 0 20px #0ff"
};

const gates = ["AND", "OR", "NOT"];

const evaluateGate = (type, inputs) => {
    if (type === "AND") return inputs[0] & inputs[1];
    if (type === "OR") return inputs[0] | inputs[1];
    if (type === "NOT") return inputs[0] ^ 1;
};

const generateGate = (id, possibleInputs) => {
    const type = getRandomGate();
    let ins;
    if (type === "NOT") {
        ins = [possibleInputs[Math.floor(Math.random() * possibleInputs.length)]];
    } else {
        const a = possibleInputs[Math.floor(Math.random() * possibleInputs.length)];
        let b;
        do {
            b = possibleInputs[Math.floor(Math.random() * possibleInputs.length)];
        } while (b === a);
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

export { generateCircuit }

const randomBool = () => (Math.random() < 0.5 ? 0 : 1);
const getRandomGate = () => gates[Math.floor(Math.random() * gates.length)];

export default function LogicGatePuzzle({ circuit: providedCircuit, gateNumber }) {
    const canvasRef = useRef(null);
    const [answer, setAnswer] = useState("");
    const [circuit, setCircuit] = useState(null);
    const [userOutputs, setUserOutputs] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [showFinalCode, setShowFinalCode] = useState(false);
    const {
        gateActiveStates,
        setGateActiveState,
        gateOutputStates,
        saveGateOutputs,
        setLightCode,
    } = useGame();
    const outputPositionsRef = useRef([]);
    const { playGateSolveSound } = useGame();
    
    // Check if all gates are solved
    const allGatesSolved = React.useMemo(() => {
        if (!gateActiveStates) return false;

        // Assuming we have gates 1, 2, and 3
        return gateActiveStates["1"] && gateActiveStates["2"] && gateActiveStates["3"] && gateActiveStates["4"];
    }, [gateActiveStates]);

    const binaryToHex = (binaryStr) => {
        // Pad the binary string to multiple of 4
        const padded = binaryStr.padStart(Math.ceil(binaryStr.length / 4) * 4, '0');

        // Convert to hexadecimal
        let hexStr = '';
        for (let i = 0; i < padded.length; i += 4) {
            const chunk = padded.substr(i, 4);
            const decimal = parseInt(chunk, 2);
            hexStr += decimal.toString(16).toUpperCase();
        }

        setLightCode(hexStr); // Save the hex code to lightCode state
        console.log("Light Code:", hexStr); // Log the hex code for debugging
        return hexStr;
    };

    useEffect(() => {
        // Load the saved state if available, otherwise initialize with -1s
        if (providedCircuit) {
            const savedOutputs = gateOutputStates?.[gateNumber];
            const initialOutputs = savedOutputs || Array(providedCircuit.outputs.length).fill(-1);
            setUserOutputs(initialOutputs);
            setCircuit(providedCircuit);

            // Check if this gate is already completed
            if (gateActiveStates?.[gateNumber]) {
                setSuccessMessage("Gate is connected and fixed!");
            }
        }
    }, [providedCircuit, gateNumber, gateOutputStates, gateActiveStates]);

    useEffect(() => {
        if (!canvasRef.current || !circuit) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

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
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            if (op === "input") {
                ctx.fillStyle = value === 1 ? "#0f0" : "#f00";
            } else {
                // For outputs, use white for -1, green for 1, red for 0
                ctx.fillStyle = value === -1 ? "white" : (value === 1 ? "#0f0" : "#f00");
            }
            ctx.fill();
            ctx.stroke();
        };

        const drawCircuit = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "14px monospace";
            ctx.lineWidth = 2;

            const positions = {};

            ["A", "B", "C"].forEach((key, i) => {
                positions[key] = { x: 120, y: 100 + i * 150 };
                drawCircle(ctx, 140, positions[key].y, circuit.inputs[key], "input");
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

            // Reset output positions
            outputPositionsRef.current = [];

            // Draw outputs based on userOutputs state
            userOutputs.forEach((val, i) => {
                const outputY = 100 + i * 150;
                drawCircle(ctx, 1130, outputY, val, "output");
                outputPositionsRef.current.push({ x: 1130, y: outputY, index: i });
            });

            circuit.layer3.forEach((g, i) => {
                const gatePos = positions[g.id];
                const outputPos = { x: 1150, y: 100 + i * 150 };
                ctx.beginPath();
                ctx.moveTo(gatePos.x + 30, gatePos.y);
                ctx.lineTo(outputPos.x - 30, outputPos.y);
                ctx.stroke();
            });
        };

        drawCircuit();

        const handleClick = (e) => {
            // If gate is already solved, don't allow changes
            if (gateActiveStates?.[gateNumber]) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (let { x: cx, y: cy, index } of outputPositionsRef.current) {
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= 100) {
                    const newOutputs = [...userOutputs];
                    // Toggle between -1, 0, and 1
                    newOutputs[index] = newOutputs[index] === -1 ? 1 : (newOutputs[index] === 1 ? 0 : 1);

                    // Save the updated outputs to game state
                    saveGateOutputs(gateNumber, newOutputs);
                    setUserOutputs(newOutputs);
                    break;
                }
            }
        };

        canvas.addEventListener("click", handleClick);
        return () => canvas.removeEventListener("click", handleClick);
    }, [circuit, userOutputs, gateNumber, saveGateOutputs]);

    // Draw circuit when userOutputs change or gate active state changes
    useEffect(() => {
        if (circuit && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            // Redraw the circuit with updated outputs
            const drawCircle = (ctx, x, y, value, op) => {
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, 2 * Math.PI);
                if (op === "input") {
                    ctx.fillStyle = value === 1 ? "#0f0" : "#f00";
                } else {
                    ctx.fillStyle = value === -1 ? "white" : (value === 1 ? "#0f0" : "#f00");
                }
                ctx.fill();
                ctx.stroke();

                // If this is an output and the gate is solved, add a lock indicator
                if (op === "output" && gateActiveStates?.[gateNumber]) {
                    ctx.beginPath();
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 1;
                    // Draw a small lock symbol
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(x - 2, y - 4, 4, 8);
                }
            };

            // Update just the output circles
            userOutputs.forEach((val, i) => {
                const outputY = 100 + i * 150;
                drawCircle(ctx, 1130, outputY, val, "output");
            });
        }
    }, [userOutputs, circuit, gateActiveStates, gateNumber]);

    // Function to generate wall1_code from all gate outputs
    const generateWallCode = () => {
        // Get all the active gate numbers (sorted to ensure consistent order)
        const activeGateNumbers = Object.keys(gateActiveStates || {})
            .filter(gate => gateActiveStates[gate])
            .sort();

        // Combine all outputs from active gates into a single string
        let code = '';
        activeGateNumbers.forEach(gate => {
            const outputs = gateOutputStates[gate];
            if (outputs) {
                // Convert outputs to binary digits and append to code
                outputs.forEach(output => {
                    // Only include 0 and 1 values, skip any -1 (unselected)
                    if (output !== -1) {
                        code += output;
                    }
                });
            }
        });

        return code;
    };

    const checkAnswer = () => {
        if (circuit && !gateActiveStates?.[gateNumber]) {
            const isCorrect = userOutputs.every((output, index) => output === circuit.outputs[index]);
            setSuccessMessage(isCorrect ? "Gate is connected and fixed!" : "Not quite right, try again!");

            if (isCorrect) {
                playGateSolveSound();
                // Set this specific gate as active
                setGateActiveState(gateNumber, true);
                // Make sure to save the correct outputs
                saveGateOutputs(gateNumber, userOutputs);

                
            }
        }
    };

    // Function to display the final wall code
    const showFinalWallCode = () => {
        setShowFinalCode(true);
    };

    // Get the complete final code in gate order
    const getFinalCode = () => {
        // Get gates in order: 1, 2, 3
        const orderedGateNumbers = ["1", "2", "3", "4"];
        let finalCode = '';

        orderedGateNumbers.forEach(gate => {
            const outputs = gateOutputStates[gate];
            if (outputs) {
                outputs.forEach(output => {
                    if (output !== -1) {
                        finalCode += output;
                    }
                });
            }
        });

        return finalCode;
    };

    const revealAnswer = () => {
        if (circuit && !gateActiveStates?.[gateNumber]) {
            setAnswer("Correct Output: " + circuit.outputs.join(" "));
        }
    };
    
    return (
        <div style={{ background: "#0a0a0a", color: "#0ff", fontFamily: "monospace", textAlign: "center" }}>
            <canvas ref={canvasRef} width="1200" height="500" style={canvasStyle}></canvas>
            <br />
            
            {/*<button
                onClick={revealAnswer}
                style={{
                    ...buttonStyle,
                    opacity: gateActiveStates?.[gateNumber] ? 0.5 : 1,
                    cursor: gateActiveStates?.[gateNumber] ? "not-allowed" : "pointer"
                }}
                disabled={gateActiveStates?.[gateNumber]}
            >
                Reveal Answer
            </button>
            */}
            <button
                onClick={checkAnswer}
                style={{
                    ...buttonStyle,
                    opacity: gateActiveStates?.[gateNumber] ? 0.5 : 1,
                    cursor: gateActiveStates?.[gateNumber] ? "not-allowed" : "pointer"
                }}
                disabled={gateActiveStates?.[gateNumber]}
            >
                Check Solution
            </button>
            <div>{answer}</div>
            {gateActiveStates && gateActiveStates[gateNumber] ? (
                <div style={{ color: "#0f0", marginTop: "10px" }}>
                    Gate is connected and fixed!
                </div>
            ) : (
                <div style={{ color: successMessage ? (successMessage.includes("Not quite") ? "#f00" : "#0f0") : "" }}>
                    {successMessage}
                </div>
            )}

            {/* Final Code Button - only show when all gates are solved */}
            {allGatesSolved && !showFinalCode && (
                <div style={{ marginTop: "30px" }}>
                    <button
                        onClick={showFinalWallCode}
                        style={finalCodeButtonStyle}
                    >
                        REVEAL FINAL WALL CODE
                    </button>
                </div>
            )}

            {/* Final Code Display - only show after button is clicked */}
            {showFinalCode && allGatesSolved && (
                <div style={finalCodeDisplayStyle}>
                    <div style={{ fontSize: "18px", color: "#0ff", marginBottom: "10px" }}>
                        FINAL WALL CODE:
                    </div>
                    <div style={{
                        fontSize: "32px",
                        letterSpacing: "8px",
                        fontWeight: "bold",
                        color: "#fff",
                        textShadow: "0 0 10px #0ff"
                    }}>
                        {getFinalCode()}
                    </div>
                    <div style={{
                        fontSize: "24px",
                        letterSpacing: "6px",
                        fontWeight: "bold",
                        color: "#0ff",
                        marginTop: "15px",
                        textShadow: "0 0 8px #0ff"
                    }}>
                        HEX: {binaryToHex(getFinalCode())}
                    </div>
                </div>
            )}
        </div>
    );
}