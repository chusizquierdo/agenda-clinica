// src/components/Formulario.jsx
import React from 'react';
import { PERSONAL_CLINICA } from '../data/config';

function Formulario({
  fecha, setFecha,
  hora, setHora,
  tratamiento, setTratamiento,
  principal, setPrincipal,
  asistente, setAsistente,
  paciente, setPaciente, // Recibido desde App.jsx
  error,
  advertencia,
  handleCrearCita
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h2 className="text-lg font-bold text-slate-700 mb-4">Configurar Cita</h2>
      
      <form onSubmit={handleCrearCita} className="space-y-4">
        
        {/* NUEVO CAMPO: NOMBRE DEL PACIENTE */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre del Paciente</label>
          <input 
            type="text" 
            placeholder="Ej. Juan Pérez" 
            value={paciente} 
            onChange={(e) => setPaciente(e.target.value)} 
            className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 font-medium"
            required // Obligatorio para evitar citas anónimas por descuido
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hora de Inicio</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Tratamiento</label>
          <select value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm">
            <option value="revision">Revisión General (20 min)</option>
            <option value="limpieza">Limpieza Dental (30 min)</option>
            <option value="ortodoncia">Ajuste Ortodoncia (45 min)</option>
            <option value="cirugia">Cirugía / Implante (2 horas)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">¿Quién lo realiza? (Principal)</label>
          <select value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm">
            <option value="">-- Selecciona Especialista --</option>
            {PERSONAL_CLINICA.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">¿Necesita asistencia?</label>
          <select value={asistente} onChange={(e) => setAsistente(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm">
            <option value="Ninguno">Ninguno (Va sola)</option>
            {PERSONAL_CLINICA.filter(p => p !== principal).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {advertencia && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs font-medium leading-relaxed">
            {advertencia}
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-lg text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors mt-2">
          Validar y Guardar Cita
        </button>
      </form>
    </div>
  );
}

export default Formulario;