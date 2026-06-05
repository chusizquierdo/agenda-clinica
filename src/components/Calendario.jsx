// src/components/Calendario.jsx
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { PERSONAL_CLINICA } from '../data/config';

function Calendario({ citas, comprobarDisponibilidad, handleActualizarCita, handleEliminarCita, citaSeleccionada, setCitaSeleccionada }) {
  
  const [editPrincipal, setEditPrincipal] = useState('');
  const [editAsistente, setEditAsistente] = useState('Ninguno');

  const handleEventClick = (info) => {
    const props = info.event.extendedProps;
    setCitaSeleccionada({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr.slice(0, 19),
      end: info.event.endStr.slice(0, 19),
      principal: props.principal,
      asistente: props.asistente,
      tratamientoKey: props.tratamientoKey
    });
    setEditPrincipal(props.principal);
    setEditAsistente(props.asistente);
  };

  const handleEventDrop = (dropInfo) => {
    const { event } = dropInfo;
    const props = event.extendedProps;

    const nuevoInicio = new Date(event.startStr);
    const nuevoFin = new Date(event.endStr);

    const principalLibre = comprobarDisponibilidad(nuevoInicio, nuevoFin, props.principal, event.id);
    const asistenteLibre = props.asistente === 'Ninguno' || comprobarDisponibilidad(nuevoInicio, nuevoFin, props.asistente, event.id);

    if (!principalLibre || !asistenteLibre) {
      alert("❌ ¡Movimiento cancelado! El personal asignado tiene un conflicto de horarios en ese hueco.");
      dropInfo.revert();
      return;
    }

    handleActualizarCita(event.id, {
      start: event.startStr.slice(0, 19),
      end: event.endStr.slice(0, 19),
      principal: props.principal,
      asistente: props.asistente,
      tratamientoKey: props.tratamientoKey
    });
  };

  const guardarCambiosModal = () => {
    if (!editPrincipal) return;
    handleActualizarCita(citaSeleccionada.id, {
      ...citaSeleccionada,
      principal: editPrincipal,
      asistente: editAsistente
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 relative">
      <style>{`
        .fc-timegrid-slot { height: 50px !important; }
        .fc-event-main { font-size: 0.9rem !important; padding: 4px !important; cursor: grab; }
        .fc-event-main:active { cursor: grabbing; }
      `}</style>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        locale={esLocale}
        firstDay={1}
        weekends={false}
        slotDuration="00:15:00"
        slotEventOverlap={false}
        events={citas}
        editable={true} 
        selectable={false} // 👈 BLOQUEA que se puedan crear citas verdes vacías haciendo clic en el calendario
        eventClick={handleEventClick} 
        eventDrop={handleEventDrop} 
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
      />

      {/* MODAL FLOTANTE */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-slate-200 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-800 text-lg">Gestionar Cita Seleccionada</h3>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">×</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Especialista Principal</label>
                <select value={editPrincipal} onChange={(e) => {
                  setEditPrincipal(e.target.value);
                  if (e.target.value === editAsistente) setEditAsistente('Ninguno');
                }} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm">
                  {PERSONAL_CLINICA.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Asistente</label>
                <select value={editAsistente} onChange={(e) => setEditAsistente(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm">
                  <option value="Ninguno">Ninguno</option>
                  {PERSONAL_CLINICA.filter(p => p !== editPrincipal).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={guardarCambiosModal} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                Guardar Cambios
              </button>
              <button onClick={() => {
                if (window.confirm("¿Seguro que quieres eliminar esta cita?")) {
                  handleEliminarCita(citaSeleccionada.id);
                }
              }} className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;