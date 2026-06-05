// src/components/Calendario.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { DURACION_TRATAMIENTOS } from '../data/config';

function Calendario({ 
  citas, 
  personalList, // Lista de especialistas recibida desde App.jsx
  comprobarDisponibilidad, 
  handleActualizarCita, 
  handleEliminarCita,
  citaSeleccionada,
  setCitaSeleccionada 
}) {

  // Estado para saber qué filtro está activo ('Todos' por defecto)
  const [filtroEspecialista, setFiltroEspecialista] = useState('Todos');

  // Estados internos del Formulario Flotante de Edición
  const [editPaciente, setEditPaciente] = useState('');
  const [editHora, setEditHora] = useState('');
  const [editTratamiento, setEditTratamiento] = useState('revision');
  const [editPrincipal, setEditPrincipal] = useState('');
  const [editAsistente, setEditAsistente] = useState('Ninguno');
  const [errorModal, setErrorModal] = useState('');

  // Al abrir la cita, cargamos todos sus valores actuales en los inputs
  useEffect(() => {
    if (citaSeleccionada) {
      const props = citaSeleccionada.extendedProps;
      const horaInicioStr = citaSeleccionada.start.split('T')[1].slice(0, 5);

      setEditPaciente(props.paciente || '');
      setEditHora(horaInicioStr);
      setEditTratamiento(props.tratamientoKey || 'revision');
      setEditPrincipal(props.principal || '');
      setEditAsistente(props.asistente || 'Ninguno');
      setErrorModal('');
    }
  }, [citaSeleccionada]);

  useEffect(() => {
    if (editPrincipal && editPrincipal === editAsistente) {
      setEditAsistente('Ninguno');
    }
  }, [editPrincipal]);

  const handleEventClick = (info) => {
    setCitaSeleccionada({
      id: info.event.id,
      start: info.event.startStr,
      end: info.event.endStr,
      extendedProps: info.event.extendedProps
    });
  };

  const handleEventDropOrResize = (info) => {
    const { event } = info;
    const props = event.extendedProps;

    const inicioDate = new Date(event.startStr);
    const finDate = new Date(event.endStr);

    if (!comprobarDisponibilidad(inicioDate, finDate, props.principal, event.id)) {
      alert(`❌ Movimiento denegado: ${props.principal} está ocupada.`);
      info.revert();
      return;
    }

    if (props.asistente !== 'Ninguno' && !comprobarDisponibilidad(inicioDate, finDate, props.asistente, event.id)) {
      alert(`❌ Movimiento denegado: El asistente (${props.asistente}) está ocupado.`);
      info.revert();
      return;
    }

    handleActualizarCita(event.id, {
      start: event.startStr,
      end: event.endStr
    });
  };

  const GuardarCambiosModal = (e) => {
    e.preventDefault();
    setErrorModal('');

    if (!editPrincipal) {
      setErrorModal('⚠️ Debes seleccionar un Especialista Principal.');
      return;
    }

    const fechaDia = citaSeleccionada.start.split('T')[0];
    const infoTratamiento = DURACION_TRATAMIENTOS[editTratamiento];
    
    const dummyInicio = new Date(`${fechaDia}T${editHora}:00`);
    const dummyFin = new Date(dummyInicio.getTime() + infoTratamiento.minutos * 60000);

    if (!comprobarDisponibilidad(dummyInicio, dummyFin, editPrincipal, citaSeleccionada.id)) {
      setErrorModal(`❌ Conflicto: ${editPrincipal} ya está ocupada en ese horario.`);
      return;
    }

    if (editAsistente !== 'Ninguno' && !comprobarDisponibilidad(dummyInicio, dummyFin, editAsistente, citaSeleccionada.id)) {
      setErrorModal(`❌ Conflicto: El asistente (${editAsistente}) está ocupado.`);
      return;
    }

    handleActualizarCita(citaSeleccionada.id, {
      horaInicioManual: editHora,
      treatmentKey: editTratamiento,
      principal: editPrincipal,
      asistente: editAsistente,
      paciente: editPaciente
    });
  };

  // 👥 FILTRADO EN TIEMPO REAL: Decidimos qué citas se mandan a la pantalla
  const citasFiltradas = citas.filter(cita => {
    if (filtroEspecialista === 'Todos') return true;
    
    const equipo = cita.extendedProps?.personalInvolucrado || [];
    return equipo.includes(filtroEspecialista);
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
      
      {/* BARRA SUPERIOR DE FILTROS EN TIEMPO REAL */}
      <div className="mb-4 bg-slate-100 p-2 rounded-xl flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase px-2">Filtrar Agenda:</span>
        
        <button
          onClick={() => setFiltroEspecialista('Todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filtroEspecialista === 'Todos'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-200'
          }`}
        >
          👁️ Ver Todo
        </button>

        {personalList.map(nombre => (
          <button
            key={nombre}
            onClick={() => setFiltroEspecialista(nombre)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtroEspecialista === nombre
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            👤 {nombre}
          </button>
        ))}
      </div>

      <style>{`
        .fc-v-event {
          padding: 6px 8px !important;
          border-radius: 6px !important;
          border: none !important;
        }
        .fc-event-title {
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          white-space: normal !important; 
          line-height: 1.2 !important;
        }
        .fc-timegrid-slot {
          height: 3.5rem !important;
        }
      `}</style>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate={new Date().toISOString().split('T')[0]} 
        locale={esLocale}
        events={citasFiltradas} // 👈 Pasamos únicamente las citas filtradas
        editable={true}
        selectable={false}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
        slotDuration="00:15:00"
        expandRows={true}
        aspectRatio={1.1}
        eventClick={handleEventClick}
        eventDrop={handleEventDropOrResize}
        eventResize={handleEventDropOrResize}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
      />

      {/* MODAL DE EDICIÓN FLOTANTE */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-300 overflow-hidden">
            
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider">✏️ Editar Ficha de la Cita</h3>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={GuardarCambiosModal} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label>
                <input 
                  type="text" 
                  value={editPaciente} 
                  onChange={(e) => setEditPaciente(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora de Inicio</label>
                <input 
                  type="time" 
                  value={editHora} 
                  onChange={(e) => setEditHora(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tratamiento</label>
                <select 
                  value={editTratamiento} 
                  onChange={(e) => setEditTratamiento(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium"
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
                  value={editPrincipal} 
                  onChange={(e) => setEditPrincipal(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium"
                >
                  <option value="">-- Selecciona --</option>
                  {personalList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asistente</label>
                <select 
                  value={editAsistente} 
                  onChange={(e) => setEditAsistente(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium"
                >
                  <option value="Ninguno">Ninguno (Va sola)</option>
                  {personalList.filter(p => p !== editPrincipal).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {errorModal && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded-lg text-xs font-medium">
                  {errorModal}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleEliminarCita(citaSeleccionada.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Eliminar Cita
                </button>
                <button
                  type="button"
                  onClick={() => setCitaSeleccionada(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Aplicar Cambios
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;