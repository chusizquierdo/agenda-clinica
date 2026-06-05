// src/components/Formulario.jsx
import React from 'react';
import { PERSONAL_CLINICA } from '../data/config';

function Formulario({
  fecha, setFecha,
  hora, setHora,
  tratamiento, setTratamiento,
  principal, setPrincipal,
  asistente, setAsistente,
  paciente, setPaciente,
  observaciones, setObservaciones, // 📝 Recibido de App.jsx
  error,
  advertencia,
  handleCrearCita
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">
        📅 Agendar Nueva Cita
      </h2>

      <form onSubmit={handleCrearCita} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Paciente</label>
          <input
            type="text"
            value={paciente}
            onChange={(e) => setPaciente(e.target.value)}
            placeholder="Ej. Juan Pérez Gómez"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora de Inicio</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Tratamiento</label>
          <select
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700"
          >
            <option value="revision">Revisión General (20 min)</option>
            <option value="limpieza">Limpieza Dental (30 min)</option>
            <option value="ortodoncia">Ajuste Ortodoncia (45 min)</option>
            <option value="cirugia">Cirugía / Implante (2 horas)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialista Principal</label>
          <select
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700"
            required
          >
            <option value="">-- Selecciona Especialista --</option>
            {PERSONAL_CLINICA.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asistente / Auxiliar</label>
          <select
            value={asistente}
            onChange={(e) => setAsistente(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700"
          >
            <option value="Ninguno">Ninguno (Va sola)</option>
            {PERSONAL_CLINICA.filter(p => p !== principal).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 📝 NUEVO CAMPO: OBSERVACIONES CLINICAS */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Observaciones <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Anotaciones importantes de la cita..."
            rows="3"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 font-medium resize-none placeholder:text-slate-400 text-slate-700"
          />
        </div>

        {advertencia && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-lg text-xs font-medium leading-relaxed">
            {advertencia}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
        >
          📅 Confirmar Cita
        </button>
      </form>
    </div>
  );
}

export default Formulario;