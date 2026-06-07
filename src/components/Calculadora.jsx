// src/components/Calculadora.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Copy, Delete } from 'lucide-react';

function Calculadora() {
  const [mostrarCalc, setMostrarCalc] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [calcResultado, setCalcResultado] = useState('');
  const [copiado, setCopiado] = useState(false);
  const calcRef = useRef(null);

  // Cerrar el pop-over al hacer clic fuera
  useEffect(() => {
    function handleClickFuera(event) {
      if (calcRef.current && !calcRef.current.contains(event.target)) {
        setMostrarCalc(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // ⌨️ ESCUCHAR EL TECLADO FÍSICO (Solo cuando la calculadora está abierta)
  useEffect(() => {
    if (!mostrarCalc) return;

    const manejarTeclado = (e) => {
      // Números y puntos decimales
      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        e.preventDefault();
        setCalcInput(prev => prev + e.key);
      }
      // Operadores matemáticos básicos
      else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault();
        // Guardamos visualmente '×' y '÷' para que quede más elegante en pantalla
        const mapeoOperadores = { '*': '×', '/': '÷', '+': '+', '-': '-' };
        setCalcInput(prev => prev + mapeoOperadores[e.key]);
      }
      // Enter para calcular el resultado
      else if (e.key === 'Enter') {
        e.preventDefault();
        handleCalcCalcular();
      }
      // Backspace (Retroceso) para borrar el último carácter
      else if (e.key === 'Backspace') {
        e.preventDefault();
        setCalcInput(prev => prev.slice(0, -1));
      }
      // Escape para limpiar toda la pantalla (Tecla C)
      else if (e.key === 'Escape') {
        e.preventDefault();
        handleCalcClear();
      }
    };

    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [mostrarCalc, calcInput]); // Escuchamos los cambios de estado para evaluar con datos frescos

  const handleCalcBtn = (valor) => {
    setCalcInput(prev => prev + valor);
  };

  const handleCalcClear = () => {
    setCalcInput('');
    setCalcResultado('');
    setCopiado(false);
  };

  const handleCalcDelete = () => {
    setCalcInput(prev => prev.slice(0, -1));
  };

  const handleCalcCalcular = () => {
    try {
      if (!calcInput.trim()) return;
      const expresionLimpia = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
      const res = new Function(`return (${expresionLimpia})`)();
      setCalcResultado(String(Number(res).toFixed(2).replace(/\.00$/, '')));
    } catch (err) {
      setCalcResultado('Error');
    }
  };

  const handleCopiarResultado = () => {
    const valorACopiar = calcResultado || calcInput;
    if (!valorACopiar || valorACopiar === 'Error') return;
    navigator.clipboard.writeText(valorACopiar);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div ref={calcRef} className="relative inline-block">
      {/* Botón de la Cabecera */}
      <button
        onClick={() => setMostrarCalc(!mostrarCalc)}
        className={`font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border shadow-sm transition-all ${
          mostrarCalc 
            ? 'bg-slate-100 text-blue-600 border-blue-200 ring-2 ring-blue-500/10' 
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Calculator size={16} className={mostrarCalc ? "text-blue-600" : "text-slate-500"} />
        Calculadora
      </button>

      {/* Ventana Flotante DESPLEGABLE MAXI (w-80) */}
      {mostrarCalc && (
        <div className="absolute right-0 top-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xl z-50 w-80 animate-fadeIn">
          
          {/* Pantalla Digital */}
          <div className="bg-slate-900 p-4 rounded-xl mb-4 text-right font-mono shadow-inner border border-slate-800">
            <div className="text-xs text-slate-400 h-5 truncate tracking-wide">{calcInput || '0'}</div>
            <div className="text-2xl font-bold text-emerald-400 h-9 mt-1 truncate tracking-wider">
              {calcResultado ? `= ${calcResultado}` : ''}
            </div>
          </div>

          {/* Botonera Interactiva */}
          <div className="grid grid-cols-4 gap-2 text-base font-bold">
            <button type="button" onClick={handleCalcClear} className="p-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl shadow-sm transition-all duration-150 active:scale-95" title="Tecla Escape">C</button>
            <button type="button" onClick={handleCalcDelete} className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl shadow-sm flex items-center justify-center transition-all duration-150 active:scale-95" title="Tecla Retroceso"><Delete size={18} /></button>
            <button type="button" onClick={() => handleCalcBtn('÷')} className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl shadow-sm transition-all duration-150 active:scale-95">/</button>
            <button type="button" onClick={() => handleCalcBtn('×')} className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl shadow-sm transition-all duration-150 active:scale-95">*</button>

            <button type="button" onClick={() => handleCalcBtn('7')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">7</button>
            <button type="button" onClick={() => handleCalcBtn('8')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">8</button>
            <button type="button" onClick={() => handleCalcBtn('9')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">9</button>
            <button type="button" onClick={() => handleCalcBtn('-')} className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl shadow-sm transition-all duration-150 active:scale-95">-</button>

            <button type="button" onClick={() => handleCalcBtn('4')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">4</button>
            <button type="button" onClick={() => handleCalcBtn('5')} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">5</button>
            <button type="button" onClick={() => handleCalcBtn('6')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">6</button>
            <button type="button" onClick={() => handleCalcBtn('+')} className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl shadow-sm transition-all duration-150 active:scale-95">+</button>

            <button type="button" onClick={() => handleCalcBtn('1')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">1</button>
            <button type="button" onClick={() => handleCalcBtn('2')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">2</button>
            <button type="button" onClick={() => handleCalcBtn('3')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">3</button>
            <button type="button" onClick={handleCalcCalcular} className="row-span-2 p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center text-xl transition-all duration-150 active:scale-95" title="Tecla Enter">=</button>

            <button type="button" onClick={() => handleCalcBtn('0')} className="col-span-2 p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">0</button>
            <button type="button" onClick={() => handleCalcBtn('.')} className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-all duration-150 active:scale-95">.</button>
          </div>

          {/* Botón de Copiado */}
          <button
            type="button"
            onClick={handleCopiarResultado}
            disabled={!calcInput && !calcResultado}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-40 active:scale-[0.98]"
          >
            <Copy size={14} />
            {copiado ? '¡Copiado al portapapeles!' : 'Copiar total para notas'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Calculadora;