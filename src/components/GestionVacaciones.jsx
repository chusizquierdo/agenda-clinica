// src/components/GestionVacaciones.jsx
import React, { useState } from 'react';
import { CalendarDays, Trash2, Calendar, User, AlertCircle, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

function GestionVacaciones({ personal, vacaciones, onAdd, onDelete, onVolver }) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [notes, setNotas] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const [exitoLocal, setExitoLocal] = useState('');

  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [vacacionModal, setVacacionModal] = useState(null);

  const LIMITE_LEGAL_LABORABLES = 22;

  const formatearFechaEuropea = (fechaStr) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const calcularDiasLaborables = (inicioStr, finStr) => {
    if (!inicioStr || !finStr) return 0;
    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);
    let diasLaborables = 0;
    let actual = new Date(inicio);

    while (actual <= fin) {
      const diaSemana = actual.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasLaborables++;
      }
      actual.setDate(actual.getDate() + 1);
    }
    return diasLaborables;
  };

  const getDiasConsumidosAñoActual = (nombreEmpleado) => {
    const añoActual = new Date().getFullYear();
    return vacaciones
      .filter(v => {
        const coincideNombre = v.nombre_empleado.toLowerCase() === nombreEmpleado.toLowerCase();
        const añoInicio = new Date(v.fecha_inicio).getFullYear();
        return coincideNombre && añoInicio === añoActual;
      })
      .reduce((total, v) => total + calcularDiasLaborables(v.fecha_inicio, v.fecha_fin), 0);
  };

  // 🌟 OPTIMIZADO: Buscador dinámico de color cruzado ultra-flexible
  const obtenerColorEmpleado = (nombreCompletoVacacion) => {
    const nombreVacClean = nombreCompletoVacacion.toLowerCase().trim();
    
    const emp = personal.find(p => {
      const nombreFicha = `${p.nombre} ${p.apellidos || ''}`.trim().toLowerCase();
      return nombreFicha === nombreVacClean || nombreVacClean.includes(p.nombre.toLowerCase()) || nombreFicha.includes(nombreVacClean);
    });
    
    return emp?.color || '#64748b'; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    setExitoLocal('');

    if (!empleadoSeleccionado) return setErrorLocal('⚠️ Selecciona un miembro del personal.');
    if (!fechaInicio || !fechaFin) return setErrorLocal('⚠️ Selecciona ambas fechas del rango.');
    if (fechaInicio > fechaFin) return setErrorLocal('⚠️ La fecha de inicio no puede ser posterior a la de fin.');

    const empData = personal.find(p => `${p.nombre} ${p.apellidos || ''}`.trim() === empleadoSeleccionado);
    if (!empData) return setErrorLocal('⚠️ No se encontraron los datos del empleado.');

    const diasSolicitados = calcularDiasLaborables(fechaInicio, fechaFin);
    if (diasSolicitados === 0) {
      return setErrorLocal('⚠️ El rango seleccionado no contiene días laborables (ej: cae en fin de semana).');
    }

    const diasConsumidos = getDiasConsumidosAñoActual(empleadoSeleccionado);
    if (diasConsumidos + diasSolicitados > LIMITE_LEGAL_LABORABLES) {
      return setErrorLocal(
        `❌ Límite legal excedido: ${empleadoSeleccionado} ya ha consumido ${diasConsumidos} días laborables este año. Solicitar ${diasSolicitados} días más superaría el máximo legal de ${LIMITE_LEGAL_LABORABLES} días.`
      );
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    let actual = new Date(inicio);

    while (actual <= fin) {
      const diaSemana = actual.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        const año = actual.getFullYear();
        const mes = String(actual.getMonth() + 1).padStart(2, '0');
        const dia = String(actual.getDate()).padStart(2, '0');
        const isoFecha = `${año}-${mes}-${dia}`;

        const yaDeVacacionesEseDia = vacaciones.filter(v => isoFecha >= v.fecha_inicio && isoFecha <= v.fecha_fin);
        
        const rolesAusentes = yaDeVacacionesEseDia.map(v => {
          const pMatch = personal.find(p => `${p.nombre} ${p.apellidos || ''}`.trim().toLowerCase() === v.nombre_empleado.toLowerCase() || v.nombre_empleado.toLowerCase().includes(p.nombre.toLowerCase()));
          return pMatch?.rol || '';
        });

        rolesAusentes.push(empData.rol);

        const doctorasAusentes = rolesAusentes.filter(r => r === 'Especialista').length;
        const auxiliaresAusentes = rolesAusentes.filter(r => r === 'Asistente').length;

        const totalDoctorasContratadas = personal.filter(p => p.rol === 'Especialista').length;
        const totalAuxiliaresContratadas = personal.filter(p => p.rol === 'Asistente').length;

        if (empData.rol === 'Especialista' && doctorasAusentes >= totalDoctorasContratadas) {
          return setErrorLocal(
            `❌ Conflicto de servicios mínimos el día ${formatearFechaEuropea(isoFecha)}: Rut y Miriam no pueden estar de vacaciones el mismo día. La clínica requiere de al menos una doctora Especialista disponible.`
          );
        }

        if (empData.rol === 'Asistente' && auxiliaresAusentes >= totalAuxiliaresContratadas) {
          return setErrorLocal(
            `❌ Conflicto de servicios mínimos el día ${formatearFechaEuropea(isoFecha)}: María no puede solicitar estas fechas porque la clínica se quedaría sin personal Asistente/Auxiliar.`
          );
        }
      }
      actual.setDate(actual.getDate() + 1);
    }

    try {
      await onAdd({
        empleado_id: empData?.id || null,
        nombre_empleado: empleadoSeleccionado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        notas: notes.trim()
      });

      setExitoLocal(`🎉 Periodo de vacaciones registrado con éxito para ${empleadoSeleccionado}.`);
      setEmpleadoSeleccionado('');
      setFechaInicio('');
      setFechaFin('');
      setNotas('');
    } catch (err) {
      setErrorLocal('❌ Error al registrar las vacaciones en la base de datos.');
    }
  };

  const cambiarMes = (factor) => {
    const nuevaFecha = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + factor, 1);
    setFechaCalendario(nuevaFecha);
  };

  const getDiasDelMes = () => {
    const año = fechaCalendario.getFullYear();
    const mes = fechaCalendario.getMonth();
    const primerDiaMes = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes + 1, 0).getDate();
    
    const desplazar = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
    
    const celdas = [];
    for (let i = 0; i < desplazar; i++) {
      celdas.push(null);
    }
    for (let d = 1; d <= totalDias; d++) {
      celdas.push(new Date(año, mes, d));
    }
    return celdas;
  };

  const comprobarQuienEstaDeVacacionesEseDia = (fechaObj) => {
    if (!fechaObj) return [];
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const isoFecha = `${año}-${mes}-${dia}`;

    return vacaciones.filter(v => isoFecha >= v.fecha_inicio && isoFecha <= v.fecha_fin);
  };

  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
      
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarDays size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Solicitar Vacaciones</h2>
              <p className="text-[11px] text-slate-400">Convenio de Clínicas Privadas (22 días hab.)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trabajador</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <select
                  value={empleadoSeleccionado}
                  onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">Selecciona personal...</option>
                  {personal.map(p => {
                    const nombreCompleto = `${p.nombre} ${p.apellidos || ''}`.trim();
                    return <option key={p.id} value={nombreCompleto}>{nombreCompleto} ({p.rol})</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pl-9 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Fin</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pl-9 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notas / Motivo</label>
              <textarea
                value={notes}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Vacaciones de verano"
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400 resize-none"
              />
            </div>

            {errorLocal && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorLocal}</span>
              </div>
            )}

            {exitoLocal && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
                {exitoLocal}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm shadow-amber-500/10 flex items-center justify-center gap-1"
            >
              Registrar Periodo
            </button>
          </form>
        </div>

        {/* Recuadro de Auditoría claro y suavizado */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Auditoría de días ({new Date().getFullYear()})
          </h3>
          <div className="space-y-3">
            {personal.map(p => {
              const nombreCompleto = `${p.nombre} ${p.apellidos || ''}`.trim();
              const consumidos = getDiasConsumidosAñoActual(nombreCompleto);
              const disponibles = LIMITE_LEGAL_LABORABLES - consumidos;
              const porcentaje = (consumidos / LIMITE_LEGAL_LABORABLES) * 100;

              return (
                <div key={p.id} className="text-xs space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">{nombreCompleto}</span>
                    <span className="text-slate-500">
                      <strong className="text-slate-800">{consumidos}</strong> / {LIMITE_LEGAL_LABORABLES} háb.
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${porcentaje > 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-slate-400 text-right">Quedan {disponibles} días laborables libres</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Historial de Ausencias y Vacaciones</h2>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {vacaciones.length} Registros
            </span>
          </div>

          {vacaciones.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <CalendarDays size={32} className="text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-medium">No hay periodos de vacaciones agendados actualmente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5">Empleado (Clic para ver)</th>
                    <th className="pb-2.5">Periodo</th>
                    <th className="pb-2.5 text-center">Días Háb.</th>
                    <th className="pb-2.5">Notas</th>
                    <th className="pb-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {vacaciones.map((v) => {
                    const diasHab = calcularDiasLaborables(v.fecha_inicio, v.fecha_fin);
                    return (
                      <tr key={v.id} className="hover:bg-amber-50/40 transition-colors group">
                        <td 
                          onClick={() => setVacacionModal(v)}
                          className="py-3 font-semibold text-blue-600 cursor-pointer hover:underline"
                        >
                          👤 {v.nombre_empleado}
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {formatearFechaEuropea(v.fecha_inicio)} al {formatearFechaEuropea(v.fecha_fin)}
                        </td>
                        <td className="py-3 text-center font-bold text-slate-700">{diasHab}d</td>
                        <td className="py-3 text-slate-400 italic max-w-[150px] truncate" title={v.notes}>
                          {v.notas || 'Sin notas'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("⚠️ ¿Deseas revocar este periodo vacacional y liberar el calendario?")) {
                                onDelete(v.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Eliminar vacaciones"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Mapa Visual de Ausencias</h3>
              <p className="text-[11px] text-slate-400">Control cromático de servicios mínimos según el color de cada empleada</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button onClick={() => cambiarMes(-1)} className="p-1 hover:bg-white rounded-lg text-slate-600 transition-all">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-700 min-w-[90px] text-center">
                {mesesNombres[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
              </span>
              <button onClick={() => cambiarMes(1)} className="p-1 hover:bg-white rounded-lg text-slate-600 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div className="text-rose-400">Sáb</div><div className="text-rose-400">Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {getDiasDelMes().map((diaObj, index) => {
              if (!diaObj) return <div key={`empty-${index}`} className="bg-slate-50/40 rounded-lg h-20" />;
              
              const ausentes = comprobarQuienEstaDeVacacionesEseDia(diaObj);
              const esFinDeSemana = diaObj.getDay() === 0 || diaObj.getDay() === 6;
              const tieneVacaciones = ausentes.length > 0;

              return (
                <div
                  key={`day-${index}`}
                  className={`h-20 p-1.5 rounded-xl border flex flex-col justify-between transition-all select-none relative bg-white border-slate-200 text-slate-700 ${
                    esFinDeSemana ? 'bg-slate-50 border-slate-100 text-slate-400' : ''
                  } ${tieneVacaciones ? 'ring-2 ring-slate-100' : ''}`}
                >
                  <span className={`text-[11px] font-bold ${tieneVacaciones ? 'text-slate-900 font-extrabold' : ''}`}>
                    {diaObj.getDate()}
                  </span>
                  
                  {tieneVacaciones && (
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[48px] pr-0.5 scrollbar-thin">
                      {ausentes.map((a, idx) => {
                        const colorEmpleado = obtenerColorEmpleado(a.nombre_empleado);
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setVacacionModal(a)}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white truncate cursor-pointer shadow-sm transition-all hover:brightness-95"
                            style={{ backgroundColor: colorEmpleado }}
                            title={`${a.nombre_empleado}: ${a.notas || 'Vacaciones'}`}
                          >
                            {a.nombre_empleado.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {vacacionModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-amber-600">
                <CalendarDays size={20} />
                <h3 className="font-bold text-slate-800 text-sm">Periodo Vacacional Concedido</h3>
              </div>
              <button 
                onClick={() => setVacacionModal(null)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs text-slate-700 mb-4">
              <p>
                La trabajadora <strong>{vacacionModal.nombre_empleado}</strong> se encuentra disfrutando de sus vacaciones en las fechas seleccionadas:
              </p>
              <div className="p-3 bg-white border border-slate-200 rounded-lg font-medium text-center text-slate-800">
                📅 Del <span className="text-amber-600 font-bold">{formatearFechaEuropea(vacacionModal.fecha_inicio)}</span> al <span className="text-amber-600 font-bold">{formatearFechaEuropea(vacacionModal.fecha_fin)}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Total laborables:</span>
                <span className="font-semibold text-slate-800">{calcularDiasLaborables(vacacionModal.fecha_inicio, vacacionModal.fecha_fin)} días hábiles</span>
              </div>
              {vacacionModal.notas && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Observaciones:</span>
                  <span className="text-slate-600 italic">"{vacacionModal.notas}"</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setVacacionModal(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default GestionVacaciones;