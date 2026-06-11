// src/components/Calendario.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { DURACION_TRATAMIENTOS } from '../data/config';

function Calendario({ 
  citas, 
  fechaActual, 
  personalList, 
  comprobarDisponibilidad, 
  handleActualizarCita, 
  handleEliminarCita,
  citaSeleccionada,
  setCitaSeleccionada 
}) {

  const [filtrosEspecialistas, setFiltrosEspecialistas] = useState(['Todos']);

  const [editPaciente, setEditPaciente] = useState('');
  const [editHora, setEditHora] = useState('');
  const [editTratamiento, setEditTratamiento] = useState('revision');
  const [editPrincipal, setEditPrincipal] = useState('');
  const [editAsistente, setEditAsistente] = useState('Ninguno');
  const [editObservaciones, setEditObservaciones] = useState(''); 
  const [errorModal, setErrorModal] = useState('');

  useEffect(() => {
    if (citaSeleccionada) {
      const props = citaSeleccionada.extendedProps;
      const horaInicioStr = citaSeleccionada.start.split('T')[1].slice(0, 5);

      setEditPaciente(props.paciente || '');
      setEditHora(horaInicioStr);
      setEditTratamiento(props.tratamientoKey || 'revision');
      setEditPrincipal(props.principal || '');
      setEditAsistente(props.asistente || 'Ninguno');
      setEditObservaciones(props.observaciones || ''); 
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

    handleActualizarCita(event.id, { start: event.startStr, end: event.endStr });
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
      paciente: editPaciente,
      observaciones: editObservaciones.trim()
    });
  };

  const alternarFiltroEspecialista = (nombreCompleto) => {
    if (nombreCompleto === 'Todos') {
      setFiltrosEspecialistas(['Todos']);
      return;
    }

    let nuevosFiltros = filtrosEspecialistas.filter(f => f !== 'Todos');

    if (nuevosFiltros.includes(nombreCompleto)) {
      nuevosFiltros = nuevosFiltros.filter(f => f !== nombreCompleto);
    } else {
      nuevosFiltros.push(nombreCompleto);
    }

    if (nuevosFiltros.length === 0) {
      setFiltrosEspecialistas(['Todos']);
    } else {
      setFiltrosEspecialistas(nuevosFiltros);
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtrosEspecialistas.includes('Todos')) return true;
    const equipo = cita.extendedProps?.personalInvolucrado || [];
    return equipo.some(miembro => filtrosEspecialistas.includes(miembro));
  });

  const handleImprimirDia = () => {
    window.print();
  };

  const citasDeHoyParaImprimir = citas
    .filter(c => c.start.startsWith(fechaActual))
    .sort((a, b) => a.start.localeCompare(b.start));

  // 🌟 INYECTOR CROMÁTICO EN CALIENTE (REACTIVIDAD FIABLE AL 100%)
  // Busca el color vivo guardado en el estado general y se lo inyecta al DOM del evento sin clonar objetos.
  const handleEventDidMount = (info) => {
    const especialistaNombre = info.event.extendedProps?.principal;
    if (!especialistaNombre) return;

    // Si la cita tiene un color de error por Fuera de Turno asignado en App.jsx, se respeta la alerta visual
    if (info.event.backgroundColor === '#ef4444') {
      info.el.style.backgroundColor = '#ef4444';
      return;
    }

    // Buscamos dinámicamente al trabajador en la lista sincronizada usando 'apellido' corregido
    const trabajadorCoincidente = personalList.find(p => {
      const stringCompleto = `${p.nombre} ${p.apellido || ''}`.trim().toLowerCase();
      return stringCompleto === especialistaNombre.toLowerCase() || especialistaNombre.toLowerCase().includes(p.nombre.toLowerCase());
    });

    if (trabajadorCoincidente?.color) {
      info.el.style.backgroundColor = trabajadorCoincidente.color;
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
      
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

        #print-sheet { display: none; }

        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: sans-serif !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .hide-on-print { display: none !important; }
          #print-sheet { display: block !important; width: 100% !important; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9 !important; font-weight: bold; }
        }
      `}</style>

      {/* BARRA SUPERIOR DE FILTROS E IMPRESIÓN */}
      <div className="mb-4 bg-slate-100 p-2 rounded-xl flex flex-wrap gap-2 items-center justify-between hide-on-print">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">Filtrar:</span>
          <button
            onClick={() => alternarFiltroEspecialista('Todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtrosEspecialistas.includes('Todos') 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            👁️ Ver Todo
          </button>
          {personalList.map(p => {
            // 🆕 CORRECCIÓN DE COLUMNA: 'apellido' en lugar de 'apellidos'
            const nombreCompleto = `${p.nombre} ${p.apellido || ''}`.trim();
            const estaActivo = filtrosEspecialistas.includes(nombreCompleto);
            return (
              <button
                key={p.id}
                onClick={() => alternarFiltroEspecialista(nombreCompleto)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                  estaActivo 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{estaActivo ? '✅' : '👤'}</span> {nombreCompleto}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleImprimirDia}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          🖨️ Imprimir Hoja del Día
        </button>
      </div>

      {/* CONTENEDOR DEL CALENDARIO EN PANTALLA */}
      <div className="hide-on-print">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate={new Date().toISOString().split('T')[0]} 
          locale={esLocale}
          events={citasFiltradas}
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
          eventDidMount={handleEventDidMount} // 🌟 ASIGNADO EL INYECTOR CROMÁTICO EN EL MONTAJE DEL EVENTO
          hiddenDays={[0, 6]} 
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
        />
      </div>

      {/* VISTA IMPRESA */}
      <div id="print-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>📋 HOJA DE TRABAJO DIARIA</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>Fecha de la Agenda: <strong>{fechaActual}</strong></p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
            Impreso el: {new Date().toLocaleDateString('es-ES')}
          </div>
        </div>

        {citasDeHoyParaImprimir.length === 0 ? (
          <p style={{ marginTop: '30px', textAlign: 'center', fontStyle: 'italic', color: '#64748b' }}>
            No hay citas agendadas para este día en la clínica.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Horario</th>
                <th style={{ width: '23%' }}>Paciente</th>
                <th style={{ width: '18%' }}>Tratamiento</th>
                <th style={{ width: '12%' }}>Principal</th>
                <th style={{ width: '12%' }}>Asistente</th>
                <th style={{ width: '23%' }}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {citasDeHoyParaImprimir.map(cita => {
                const horaIn = cita.start.split('T')[1].slice(0, 5);
                const horaFi = cita.end.split('T')[1].slice(0, 5);
                const infoT = DURACION_TRATAMIENTOS[cita.extendedProps.tratamientoKey];
                
                return (
                  <tr key={cita.id}>
                    <td><strong>{horaIn} - {horaFi}</strong></td>
                    <td>{cita.extendedProps.paciente}</td>
                    <td>{infoT ? infoT.nombre : 'Revisión'}</td>
                    <td>{cita.extendedProps.principal}</td>
                    <td>{cita.extendedProps.asistente === 'Ninguno' ? '-' : cita.extendedProps.asistente}</td>
                    <td><span style={{ fontSize: '11px', fontStyle: 'italic' }}>{cita.extendedProps.observaciones || '-'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE EDICIÓN FLOTANTE */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 hide-on-print">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-300 overflow-hidden">
            
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider">✏️ Editar Ficha de la Cita</h3>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={GuardarCambiosModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label>
                <input type="text" value={editPaciente} onChange={(e) => setEditPaciente(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 font-medium" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora de Inicio</label>
                <input type="time" value={editHora} onChange={(e) => setEditHora(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 font-medium" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tratamiento</label>
                <select value={editTratamiento} onChange={(e) => setEditTratamiento(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium">
                  <option value="revision">Revisión General (20 min)</option>
                  <option value="limpieza">Limpieza Dental (30 min)</option>
                  <option value="ortodoncia">Ajuste Ortodoncia (45 min)</option>
                  <option value="cirugia">Cirugía / Implante (2 horas)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialista Principal</label>
                <select value={editPrincipal} onChange={(e) => setEditPrincipal(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium">
                  <option value="">-- Selecciona --</option>
                  {personalList.map(p => {
                    // 🆕 CORRECCIÓN DE COLUMNA: 'apellido' en lugar de 'apellidos'
                    const nombreCompleto = `${p.nombre} ${p.apellido || ''}`.trim();
                    return <option key={p.id} value={nombreCompleto}>{nombreCompleto}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asistente</label>
                <select value={editAsistente} onChange={(e) => setEditAsistente(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium">
                  <option value="Ninguno">Ninguno (Va sola)</option>
                  {personalList.map(p => {
                    // 🆕 CORRECCIÓN DE COLUMNA: 'apellido' en lugar de 'apellidos'
                    const nombreCompleto = `${p.nombre} ${p.apellido || ''}`.trim();
                    return <option key={p.id} value={nombreCompleto} disabled={nombreCompleto === editPrincipal}>{nombreCompleto}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observaciones de la Cita</label>
                <textarea 
                  value={editObservaciones} 
                  onChange={(e) => setEditObservaciones(e.target.value)} 
                  rows="2"
                  placeholder="Sin anotaciones..."
                  className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700 text-sm font-medium resize-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              {errorModal && <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded-lg text-xs font-medium">{errorModal}</div>}
              
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button type="button" onClick={() => handleEliminarCita(citaSeleccionada.id)} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors">Eliminar Cita</button>
                <button type="button" onClick={() => setCitaSeleccionada(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs transition-colors">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors">Aplicar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;