import React, { useState, useEffect } from 'react';
import { Eye, Shield, Lock, Calculator, ArrowLeft } from 'lucide-react';

export default function StealthCalculator({
  onUnlock,
  secretPin = '1234',
  decoyPin = '9999',
  onExitStealth
}) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [recentInputSequence, setRecentInputSequence] = useState('');
  const [showHintModal, setShowHintModal] = useState(false);

  // Handle keyboard inputs like a real calculator
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key } = e;
      if (/^[0-9]$/.test(key)) {
        inputDigit(key);
      } else if (key === '.') {
        inputDot();
      } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        performEqual();
      } else if (key === '+') {
        performOperation('+');
      } else if (key === '-') {
        performOperation('-');
      } else if (key === '*' || key === 'x') {
        performOperation('×');
      } else if (key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
      } else if (key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const inputDigit = (digit) => {
    setRecentInputSequence(prev => (prev + digit).slice(-10));

    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setRecentInputSequence('');
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (val !== 0) {
      setDisplay(String(-val));
    }
  };

  const inputPercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const performOperation = (nextOp) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const calculate = (prev, next, op) => {
    switch (op) {
      case '+': return prev + next;
      case '-': return prev - next;
      case '×': return prev * next;
      case '÷': return next === 0 ? 'Error' : prev / next;
      default: return next;
    }
  };

  const performEqual = () => {
    const cleanDisplay = display.trim();

    // Check Secret Unlock PIN
    if (cleanDisplay === secretPin || recentInputSequence.endsWith(secretPin)) {
      if (onUnlock) onUnlock(false); // Normal vault
      return;
    }

    // Check Duress / Decoy PIN (opens empty clean mode)
    if (cleanDisplay === decoyPin || recentInputSequence.endsWith(decoyPin)) {
      if (onUnlock) onUnlock(true); // Decoy mode
      return;
    }

    // Standard calculator equality
    if (!operation || prevValue === null) return;
    const inputValue = parseFloat(display);
    const result = calculate(prevValue, inputValue, operation);
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white font-sans select-none p-4">
      
      {/* Top Camouflage Bar (Looks like innocent system bar) */}
      <div className="w-full max-w-sm flex items-center justify-between px-3 py-2 text-xs text-neutral-500 mb-2">
        <span className="font-mono">Standard Calculator</span>
        <button
          onClick={() => setShowHintModal(true)}
          className="text-[10px] text-neutral-600 hover:text-neutral-400 underline transition cursor-pointer"
          title="Secret Bubble Camouflage Guide"
        >
          Help
        </button>
      </div>

      {/* Calculator Body */}
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
        
        {/* Output Display Screen */}
        <div className="h-28 flex flex-col justify-end items-end px-3 pb-2 border-b border-neutral-900">
          <div className="text-xs text-neutral-500 font-mono tracking-widest h-4">
            {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
          </div>
          <div className="text-4xl sm:text-5xl font-light tracking-tight text-white truncate max-w-full font-mono">
            {display}
          </div>
        </div>

        {/* Calculator Keypad Grid */}
        <div className="grid grid-cols-4 gap-3 text-lg font-medium">
          
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition active:scale-95 font-semibold"
          >
            {display === '0' ? 'AC' : 'C'}
          </button>
          <button
            onClick={toggleSign}
            className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition active:scale-95"
          >
            ±
          </button>
          <button
            onClick={inputPercent}
            className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition active:scale-95"
          >
            %
          </button>
          <button
            onClick={() => performOperation('÷')}
            className={`h-14 rounded-2xl font-bold transition active:scale-95 ${
              operation === '÷' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputDigit(7)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            7
          </button>
          <button
            onClick={() => inputDigit(8)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            8
          </button>
          <button
            onClick={() => inputDigit(9)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            9
          </button>
          <button
            onClick={() => performOperation('×')}
            className={`h-14 rounded-2xl font-bold transition active:scale-95 ${
              operation === '×' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputDigit(4)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            4
          </button>
          <button
            onClick={() => inputDigit(5)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            5
          </button>
          <button
            onClick={() => inputDigit(6)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            6
          </button>
          <button
            onClick={() => performOperation('-')}
            className={`h-14 rounded-2xl font-bold transition active:scale-95 ${
              operation === '-' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
            }`}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputDigit(1)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            1
          </button>
          <button
            onClick={() => inputDigit(2)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            2
          </button>
          <button
            onClick={() => inputDigit(3)}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            3
          </button>
          <button
            onClick={() => performOperation('+')}
            className={`h-14 rounded-2xl font-bold transition active:scale-95 ${
              operation === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 hover:bg-orange-400 text-white'
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputDigit(0)}
            className="col-span-2 h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95 flex items-center justify-start px-6"
          >
            0
          </button>
          <button
            onClick={inputDot}
            className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition active:scale-95"
          >
            .
          </button>
          <button
            onClick={performEqual}
            className="h-14 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition active:scale-95 shadow-lg shadow-orange-500/20"
          >
            =
          </button>

        </div>

      </div>

      {/* Secret Hint Dialog (Shows only when user clicks help) */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Stealth Camouflage Mode</span>
            </div>
            <div className="text-xs text-neutral-300 space-y-2">
              <p>This screen is a decoy calculator disguise to protect your privacy.</p>
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] space-y-1">
                <p>🔓 <strong>Secret PIN:</strong> Type <span className="text-amber-400">{secretPin}</span> then press <span className="text-orange-400">=</span></p>
                <p>🛡️ <strong>Decoy PIN:</strong> Type <span className="text-cyan-400">{decoyPin}</span> then press <span className="text-orange-400">=</span> (opens clean empty decoy)</p>
              </div>
            </div>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-semibold text-white transition"
            >
              Back to Calculator
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
