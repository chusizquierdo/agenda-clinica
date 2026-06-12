// src/components/Formulario.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS } from '../data/config';

const HORARIO_POR_DEFECTO = {
  lunes: { trabaja: true, inicio: '09:00', fin: '19:00' },
  martes: { trabaja: true, inicio: '09:00', fin: '19:00' },
  miercoles: { trabaja: true, inicio: '09:00', fin: '19:00' },
  jueves: { trabaja: true, inicio: '09:00', fin: '19:00' },
  viernes: { trabaja: true, inicio: '09:00', fin: '19:00' }
};

const TRADUCTOR_DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function Formulario({ fechaInicial, personalList, vacaciones, onCrearCita }) {
  // Estados locales encapsulados dentro del formulario
  const [paciente, setPaciente] = useState('');
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState('09:00');
  const [tratamiento, setTratamiento] = useState('revision');
  const [principal, setPrincipal] = useState('');
  const [asistente, setAsistente] = useState('Ninguno');
  const [observaciones, setObservaciones] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Regla de negocio: El principal no puede ser igual al asistente
  useEffect(() => {
    if (principal && principal === asistente) {
      setAsistente('Ninguno');
    }
  }, [principal, asistente]);

  // Validación de turnos y vacaciones en tiempo real
  useEffect(() => {
    setAdvertencia('');
    if (!principal) return;

    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento];
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    const horaFinStr = finId.toTimeString().slice(0, 5);

    // 1. Comprobación de vacaciones
    const coincidenciaVacaciones = vacaciones.some(v => {
      const nombreTrabajador = `${v.nombre_empleado}`.toLowerCase();
      const principalMinus = principal.toLowerCase();
      if (!principalMinus.includes(nombreTrabajador)) return false;
      return fecha >= v.fecha_inicio && fecha <= v.fecha_fin;
    });

    if (coincidenciaVacaciones) {
      setAdvertencia(`🚨 ¡ATENCIÓN! ${principal} tiene VACACIONES registradas en esta fecha.`);
      return;
    }

    // 2. Comprobación de cuadrante y turnos
    const empData = personalList.find(p => `${p.nombre} ${p.apellido || ''}`.trim() === principal);
    const cuadrante = empData?.horario && Object.keys(empData.horario).length > 0 ? empData.horario : HORARIO_POR_DEFECTO;
    
    const diaSemanaNombre = TRADUCTOR_DIAS[dummy.getDay()];
    const reglaDia = cuadrante[diaSemanaNombre];

    if (!reglaDia || !reglaDia.works && !reglaDia.trabaja) {
      setAdvertencia(`⚠️ ¡Aviso! El ${diaSemanaNombre} figura como día NO laborable para ${principal}.`);
      return;
    }

    const [hIn, mIn] = hora.split(':').map(Number);
    const [hFi, mFi] = horaFinStr.split(':').map(Number);
    const [hLimIn, mLimIn] = (reglaDia.inicio || '09:00').split(':').map(Number);
    const [hLimFi, mLimFi] = (reglaDia.fin || '19:00').split(':').map(Number);

    const minCitaInicio = hIn * 60 + mIn;
    const minCitaFin = hFi * 60 + mFi;
    const minTurnoInicio = hLimIn * 60 + mLimIn;
    const minTurnoFin = hLimFi * 60 + mLimFi;

    if (minCitaInicio < minTurnoInicio || minCitaFin > minTurnoFin) {
      setAdvertencia(`⚠️ ¡Fuera de Turno! ${principal} trabaja de ${reglaDia.inicio}h a ${reglaDia.fin}h los ${diaSemanaNombre}s.`);
    }
  }, [hora, tratamiento, principal, fecha, personalList, vacaciones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!principal || principal === "") {
      return setErrorLocal('⚠️ Error: Selecciona un Especialista Principal de la lista.');
    }

    setEnviando(true);

    // Mandamos los datos estructurados al componente padre (App.jsx)
    const exito = await onCrearCita({
      paciente,
      fecha,
      hora,
      tratamiento,
      principal,
      asistente,
      observaciones
    });

    setEnviando(false);

    if (exito) {
      // Limpiamos el formulario tras la creación exitosa
      setPaciente('');
      setObservaciones('');
      setPrincipal('');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        📅 Agendar Nueva Cita
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Paciente</label>
          <input
            type="text"
            required
            placeholder="Nombre completo del paciente"
            value={paciente}
            onChange={(e) => setPaciente(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hora Inicio</label>
            <input
              type="time"
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tratamiento</label>
          <select
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {Object.entries(DURACION_TRATAMIENTOS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.nombre} ({value.minutos} min)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Especialista Principal</label>
          <select
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">-- Selecciona Especialista --</option>
            {personalList.map((p) => {
              const nombreCompleto = `${p.nombre} ${p.apellido || ''}`.trim();
              return (
                <option key={p.id} value={nombreCompleto}>
                  {p.rol === 'Asistente' ? '👩‍⚕️' : '🩺'} {nombreCompleto} ({p.rol || 'Especialista'})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asistente (Opcional)</label>
          <select
            value={asistente}
            onChange={(e) => setAsistente(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="Ninguno">Ninguno (Sin Asistente)</option>
            {personalList
              .filter(p => `${p.nombre} ${p.apellido || ''}`.trim() !== principal)
              .map((p) => {
                const nombreCompleto = `${p.nombre} ${p.apellido || ''}`.trim();
                return (
                  <option key={p.id} value={nombreCompleto}>
                    👤 {nombreCompleto}
                  </option>
                );
              })}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notas / Observaciones</label>
          <textarea
            rows="2"
            placeholder="Detalles clínicos o notas adicionales..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>

        {advertencia && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px] font-medium leading-relaxed">
            {advertencia}
          </div>
        )}

        {errorLocal && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[11px] font-medium">
            {errorLocal}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm"
        >
          {enviando ? 'Guardando...' : 'Agendar Cita'}
        </button>
      </form>
    </div>
  );
}

export default Formulario;