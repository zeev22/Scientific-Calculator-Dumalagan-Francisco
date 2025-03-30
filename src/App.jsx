"use client";

import { useState } from "react";
import "./App.css";

export default function Calculator() {
  const [displayMode, setDisplayMode] = useState("decimal");
  const [angleMode, setAngleMode] = useState("deg");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [memory, setMemory] = useState(0);
  const [secondMode, setSecondMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Iterative factorial to avoid stack overflow for large numbers
  const factorial = (n) => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) {
      result *= i;
      // Prevent overflow by capping at a reasonable limit
      if (result > Number.MAX_SAFE_INTEGER) return Infinity;
    }
    return result;
  };

  const handleDisplayModeChange = (newMode) => setDisplayMode(newMode);
  const handleAngleModeChange = (newMode) => setAngleMode(newMode);
  const toggleSecondMode = () => setSecondMode(!secondMode);
  const toggleHistory = () => setShowHistory(!showHistory);

  const handleClick = (value) => {
    if (value === "=") {
      try {
        // Step 1: Parse the expression for special handling of '%'
        let expression = input;

        // Handle '%' as modulo when between two numbers (e.g., "10 % 3")
        // Use a regex to find patterns like "number % number"
        expression = expression.replace(
          /(\d+\.?\d*)\s*%\s*(\d+\.?\d*)/g,
          "($1 % $2)"
        );

        // Handle '%' as percentage when it's a suffix (e.g., "5%")
        expression = expression.replace(
          /(\d+\.?\d*)%/g,
          "($1 / 100)"
        );

        // Step 2: Replace mathematical functions and constants
        expression = expression
          .replace(/sin\(/g, `Math.sin(${angleMode === "deg" ? "Math.PI/180*" : ""}`)
          .replace(/cos\(/g, `Math.cos(${angleMode === "deg" ? "Math.PI/180*" : ""}`)
          .replace(/tan\(/g, `Math.tan(${angleMode === "deg" ? "Math.PI/180*" : ""}`)
          .replace(/asin\(/g, `${angleMode === "deg" ? "180/Math.PI*" : ""}Math.asin(`)
          .replace(/acos\(/g, `${angleMode === "deg" ? "180/Math.PI*" : ""}Math.acos(`)
          .replace(/atan\(/g, `${angleMode === "deg" ? "180/Math.PI*" : ""}Math.atan(`)
          .replace(/log\(/g, "Math.log10(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/√\(/g, "Math.sqrt(")
          .replace(/∛\(/g, "Math.cbrt(")
          .replace(/floor\(/g, "Math.floor(")
          .replace(/ceil\(/g, "Math.ceil(")
          .replace(/abs\(/g, "Math.abs(")
          .replace(/\^/g, "**")
          .replace(/π/g, "Math.PI")
          .replace(/e/g, "Math.E")
          .replace(/M/g, memory)
          .replace(/(\d+)!/g, (_, num) => factorial(parseInt(num)));

        // Step 3: Evaluate the expression
        const evalResult = Function(`'use strict'; return (${expression})`)();

        // Step 4: Format the result based on display mode
        let formattedResult = evalResult;
        if (displayMode === "binary") {
          formattedResult = Math.floor(evalResult).toString(2);
        } else if (displayMode === "hex") {
          formattedResult = Math.floor(evalResult).toString(16).toUpperCase();
        } else {
          // For decimal, round to avoid floating-point precision issues
          formattedResult = Number.isFinite(evalResult)
            ? Number(evalResult.toFixed(10))
            : evalResult;
        }

        setResult(formattedResult.toString());
        setHistory([{ expression: input, result: formattedResult }, ...history.slice(0, 9)]);
      } catch (error) {
        setResult("Error");
      }
    } else if (value === "AC") {
      setInput("");
      setResult("");
    } else if (value === "⌫") {
      setInput(input.slice(0, -1));
    } else if (value === "Ans") {
      setInput(input + result);
    } else if (value === "M+") {
      const current = parseFloat(result) || 0;
      setMemory(memory + current);
    } else if (value === "M-") {
      const current = parseFloat(result) || 0;
      setMemory(memory - current);
    } else if (value === "MR") {
      setInput(input + "M");
    } else if (value === "MC") {
      setMemory(0);
    } else if (value === "x²") {
      setInput(input + "^2");
    } else if (value === "xʸ") {
      setInput(input + "^");
    } else {
      setInput(input + value);
    }
  };

  const basicButtons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "(", ")", "π", "e",
    "^", "%", "!", "Ans"
  ];

  const primaryScientificButtons = [
    "sin(", "cos(", "tan(", "log(",
    "ln(", "√(", "x²", "xʸ"
  ];

  const secondaryScientificButtons = [
    "asin(", "acos(", "atan(", "floor(",
    "ceil(", "abs(", "∛(", "exp("
  ];

  const clearButtons = ["AC", "⌫"];
  const memoryButtons = ["M+", "M-", "MC", "MR"];

  return (
    <div className="app">
      <div className="aurora"></div>

      <div className={`calculator ${showHistory ? "history-open" : ""}`}>
        <div className="calculator-header">
          <h1 className="calculator-title">Scientific Calculator</h1>
          <button className="history-toggle" onClick={toggleHistory}>
            {showHistory ? "Hide History" : "Show History"}
          </button>
        </div>

        <div className="display-settings">
          <div className="mode-group">
            <div className="display-mode">
              {["decimal", "binary", "hex"].map((mode) => (
                <button
                  key={mode}
                  className={displayMode === mode ? "active" : ""}
                  onClick={() => handleDisplayModeChange(mode)}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="angle-mode">
              {["deg", "rad"].map((mode) => (
                <button
                  key={mode}
                  className={angleMode === mode ? "active" : ""}
                  onClick={() => handleAngleModeChange(mode)}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="memory-display">
            M: {displayMode === "decimal"
              ? memory.toFixed(2)
              : displayMode === "binary"
              ? Math.floor(memory).toString(2)
              : Math.floor(memory).toString(16).toUpperCase()}
          </div>
        </div>

        <div className="display">
          <div className="input">{input}</div>
          <div className="result">{result}</div>
        </div>

        <div className="buttons-grid">
          <div className="main-buttons">
            <div className="basic-buttons">
              {basicButtons.map((btn) => (
                <button
                  key={btn}
                  className={
                    btn.match(/[0-9.]/) ? "number-btn" :
                    btn === "=" ? "equals-btn" :
                    btn === "Ans" ? "ans-btn" :
                    "operation-btn"
                  }
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="scientific-buttons">
              {(secondMode ? secondaryScientificButtons : primaryScientificButtons).map((btn) => (
                <button
                  key={btn}
                  className="function-btn"
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="side-buttons">
            <div className="clear-buttons">
              {clearButtons.map((btn) => (
                <button
                  key={btn}
                  className={btn === "AC" ? "clear-btn" : "delete-btn"}
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          
            <div className="memory-buttons">
              {memoryButtons.map((btn) => (
                <button
                  key={btn}
                  className="memory-btn"
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
            <button
              className={`second-btn ${secondMode ? "active" : ""}`}
              onClick={toggleSecondMode}
            >
              2nd
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="history-panel">
            <h3>History</h3>
            <div className="history-items">
              {history.length ? history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                </div>
              )) : <div className="no-history">No history yet</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}