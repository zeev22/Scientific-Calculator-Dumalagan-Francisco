"use client";

import { useState } from "react";
import "./App.css";

export default function Calculator() {
  // State declarations
  const [displayMode, setDisplayMode] = useState("decimal");
  const [angleMode, setAngleMode] = useState("deg");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [memory, setMemory] = useState(0);
  const [secondMode, setSecondMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Button definitions
  const basicButtons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "(", ")", "π", "e",
    "^", "%", "!", "Ans"
  ];

  const scientificFunctions = {
    primary: [
      { label: "sin(", value: "sin(", fn: (x) => angleMode === "deg" ? Math.sin(x * Math.PI / 180) : Math.sin(x) },
      { label: "cos(", value: "cos(", fn: (x) => angleMode === "deg" ? Math.cos(x * Math.PI / 180) : Math.cos(x) },
      { label: "tan(", value: "tan(", fn: (x) => angleMode === "deg" ? Math.tan(x * Math.PI / 180) : Math.tan(x) },
      { label: "log(", value: "log(", fn: (x) => Math.log10(x) },
      { label: "ln(", value: "ln(", fn: (x) => Math.log(x) },
      { label: "√(", value: "√(", fn: (x) => Math.sqrt(x) },
      { label: "x²", value: "^2", fn: (x) => x ** 2 },
      { label: "xʸ", value: "^", fn: (x, y) => x ** y }
    ],
    secondary: [
      { label: "asin(", value: "asin(", fn: (x) => angleMode === "deg" ? Math.asin(x) * 180 / Math.PI : Math.asin(x) },
      { label: "acos(", value: "acos(", fn: (x) => angleMode === "deg" ? Math.acos(x) * 180 / Math.PI : Math.acos(x) },
      { label: "atan(", value: "atan(", fn: (x) => angleMode === "deg" ? Math.atan(x) * 180 / Math.PI : Math.atan(x) },
      { label: "floor(", value: "floor(", fn: (x) => Math.floor(x) },
      { label: "ceil(", value: "ceil(", fn: (x) => Math.ceil(x) },
      { label: "abs(", value: "abs(", fn: (x) => Math.abs(x) },
      { label: "∛(", value: "∛(", fn: (x) => Math.cbrt(x) },
      { label: "exp(", value: "exp(", fn: (x) => Math.exp(x) }
    ]
  };

  const clearButtons = ["AC", "⌫"];
  const memoryButtons = ["M+", "M-", "MC", "MR"];

  // Helper functions
  const factorial = (n) => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) {
      result *= i;
      if (result > Number.MAX_SAFE_INTEGER) return Infinity;
    }
    return result;
  };

  // Event handlers
  const handleDisplayModeChange = (newMode) => setDisplayMode(newMode);
  const handleAngleModeChange = (newMode) => setAngleMode(newMode);
  const toggleSecondMode = () => setSecondMode(!secondMode);
  const toggleHistory = () => setShowHistory(!showHistory);

  const handleClick = (value) => {
    if (value === "=") {
      try {
        if (!input.trim()) {
          setResult("Error: Empty expression");
          return;
        }

        let expression = input;

        // Handle percentage operations
        expression = expression.replace(
          /(\d+\.?\d*)\s*([+-])\s*(\d+\.?\d*)%/g,
          (match, num1, operator, num2) => {
            const percentageValue = (parseFloat(num2) / 100) * parseFloat(num1);
            return operator === "+" ? `(${num1} + ${percentageValue})` : `(${num1} - ${percentageValue})`;
          }
        );

        // Handle standalone percentage
        expression = expression.replace(
          /(\d+\.?\d*)%/g,
          "($1 / 100)"
        );

        // Handle modulo
        expression = expression.replace(
          /(\d+\.?\d*)\s*%\s*(\d+\.?\d*)/g,
          "($1 % $2)"
        );

        // Replace mathematical functions and constants
        expression = expression
          .replace(/log\(/g, "Math.log10(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/√\(/g, "Math.sqrt(")
          .replace(/∛\(/g, "Math.cbrt(")
          .replace(/floor\(/g, "Math.floor(")
          .replace(/ceil\(/g, "Math.ceil(")
          .replace(/abs\(/g, "Math.abs(")
          .replace(/exp\(/g, "Math.exp(")
          .replace(/\^/g, "**")
          .replace(/π/g, "Math.PI")
          .replace(/e/g, "Math.E")
          .replace(/M/g, memory)
          .replace(/(\d+)!/g, (_, num) => factorial(parseInt(num)));

        // Handle trigonometric functions with angle mode conversion
        const trigFunctions = ["sin", "cos", "tan", "asin", "acos", "atan"];
        trigFunctions.forEach((func) => {
          const regex = new RegExp(`${func}\\(([^()]+)\\)`, "g");
          expression = expression.replace(regex, (match, arg) => {
            if (func.startsWith("a")) {
              return angleMode === "deg" 
                ? `(Math.${func}(${arg}) * 180 / Math.PI)` 
                : `Math.${func}(${arg})`;
            } else {
              return angleMode === "deg" 
                ? `Math.${func}((${arg}) * Math.PI / 180)` 
                : `Math.${func}(${arg})`;
            }
          });
        });

        // Validate parentheses
        const openParens = (expression.match(/\(/g) || []).length;
        const closeParens = (expression.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          throw new Error("Mismatched parentheses");
        }

        // Evaluate the expression
        const evalResult = Function(`'use strict'; return (${expression})`)();

        // Format the result
        let formattedResult;
        if (!Number.isFinite(evalResult)) {
          formattedResult = evalResult.toString();
        } else if (displayMode === "binary") {
          formattedResult = Math.floor(evalResult).toString(2);
        } else if (displayMode === "hex") {
          formattedResult = Math.floor(evalResult).toString(16).toUpperCase();
        } else {
          formattedResult = Number(evalResult.toFixed(10));
        }

        setResult(formattedResult.toString());
        setHistory([{ expression: input, result: formattedResult }, ...history.slice(0, 9)]);
      } catch (error) {
        setResult(`Error: ${error.message || "Invalid expression"}`);
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
    } else {
      setInput(input + value);
    }
  };

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
              {(secondMode ? scientificFunctions.secondary : scientificFunctions.primary).map((func) => (
                <button
                  key={func.value}
                  className="function-btn"
                  onClick={() => handleClick(func.value)}
                >
                  {func.label}
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