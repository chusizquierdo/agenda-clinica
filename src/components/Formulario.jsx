// src/components/Formulario.jsx
import React from 'react';
import { DURACION_TRATAMIENTOS } from '../data/config';

function Formulario({
  fecha, setFecha,
  hora, setHora,
  tratamiento, setTratamiento,
  principal, setPrincipal,
  asistente, setAsistente,
  paciente, setPaciente,
  observaciones, setObservaciones,
  error,
  advertencia,
  handleCrearCita,
  personalList = [] 
}) {

  // Filtro definitivo para Especialistas (ahora tolera 'medico' y 'médico')
  const especialistas = personalList.filter(p => {
    const r = (p.rol || p.role || '').toLowerCase().trim();
    return (
      r === 'especialista' || 
      r === 'odontólogo' || 
      r === 'odontologo' || 
      r === 'doctora' || 
      r === 'doctor' ||
      r === 'odontóloga' ||
      r === 'odontologa' ||
      r === 'medico' ||
      r === 'médico'
    );
  });

  // Filtro definitivo para Asistentes y Enfermería
  const asistentesYHigienistas = personalList.filter(p => {
    const r = (p.rol || p.role || '').toLowerCase().trim();
    return (
      r === 'asistente' || 
      r === 'higienista' || 
      r === 'enfermera' || 
      r === 'enfermero' ||
      r === 'asistenta'
    );
  });

  const controlarCambioFecha = (e) => {
    const fechaSeleccionada = e.target.value;
    if (!fechaSeleccionada) return;

    const partes = fechaSeleccionada.split('-');
    const objetoFecha = new Date(partes[0], partes[1] - 1, partes[2]);
    const diaDeLaSemana = objetoFecha.getDay();

    if (diaDeLaSemana === 0 || diaDeLaSemana === 6) {
      alert('⚠️ Fines de semana cerrados. Por favor, selecciona una fecha de Lunes a Viernes.');
      
      const hoy = new Date();
      const diaHoy = hoy.getDay();
      if (diaHoy === 6) hoy.setDate(hoy.getDate() + 2);
      if (diaHoy === 0) hoy.setDate(hoy.getDate() + 1);
      
      setFecha(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`);
    } else {
      setFecha(fechaSeleccionada);
    }
  };

  return (
    <form onSubmit={handleCrearCita} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
        🗓️ Programar Nueva Cita
      </h2>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">{error}</div>}
      {advertencia && <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs">{advertencia}</div>}

      {/* Paciente */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Paciente</label>
        <input
          type="text"
          required
          value={paciente}
          onChange={(e) => setPaciente(e.target.value)}
          placeholder="Ej: Juan Pérez Gómez"
          className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Fecha</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={controlarCambioFecha}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Hora de Inicio</label>
          <input
            type="time"
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Tratamiento */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Tratamiento / Servicio</label>
        <select
          value={tratamiento}
          onChange={(e) => setTratamiento(e.target.value)}
          className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
        >
          {Object.entries(DURACION_TRATAMIENTOS).map(([key, info]) => (
            <option key={key} value={key}>{info.nombre} ({info.minutos} min)</option>
          ))}
        </select>
      </div>

      {/* Especialista Principal */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Especialista Principal</label>
        <select
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          required
          className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">-- Selecciona un Especialista --</option>
          {especialistas.map(esp => {
            const nombreCompleto = `${esp.nombre} ${esp.apellido || ''}`.trim();
            return (
              <option key={esp.id} value={nombreCompleto}>
                {nombreCompleto} ({esp.rol || esp.role || 'Especialista'})
              </option>
            );
          })}
        </select>
      </div>

      {/* Asistente / Gabinete */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Asistente Asignado (Opcional)</label>
        <select
          value={asistente}
          onChange={(e) => setAsistente(e.target.value)}
          className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
        >
          <option value="Ninguno">Ninguno</option>
          {asistentesYHigienistas.map(asi => {
            const nombreCompleto = `${asi.nombre} ${asi.apellido || ''}`.trim();
            return (
              <option key={asi.id} value={nombreCompleto} disabled={nombreCompleto === principal}>
                {nombreCompleto} ({asi.rol || asi.role || 'Asistente'})
              </option>
            );
          })}
        </select>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Notas / Observaciones Médicas</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Alergias, especificaciones del estado o del historial..."
          rows="2"
          className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all uppercase tracking-wider"
      >
        Añadir Cita al Calendario
      </button>
    </form>
  );
}

export default Formulario;