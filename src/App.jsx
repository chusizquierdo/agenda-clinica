// src/App.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS, HORARIOS_SALIDA, COLORES_PERSONAL } from './data/config';
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';

function App() {
  const fechaFijaPrueba = "2026-05-31"; // Ajustado al día de hoy para que se posicione bien al cargar

  // 100% VACÍO: Sin pacientes ficticios ni citas iniciales instaladas
  const [citas, setCitas] = useState([]);

  // Estados del formulario
  const [paciente, setPaciente] = useState('');
  const [fecha, setFecha] = useState(fechaFijaPrueba);
  const [hora, setHora] = useState('09:00'); 
  const [tratamiento, setTratamiento] = useState('revision'); 
  const [principal, setPrincipal] = useState('');
  const [asistente, setAsistente] = useState('Ninguno');
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    if (principal && principal === asistente) {
      setAsistente('Ninguno');
    }
  }, [principal]);

  useEffect(() => {
    setAdvertencia('');
    if (!principal) return;

    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento];
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    const horaFinStr = finId.toTimeString().slice(0, 5);

    const [hLimite, mLimite] = HORARIOS_SALIDA[principal].split(':').map(Number);
    const [hFin, mFin] = horaFinStr.split(':').map(Number);
    
    if ((hFin * 60 + mFin) > (hLimite * 60 + mLimite)) {
      setAdvertencia(`⚠️ ¡Atención! Termina a las ${horaFinStr}. Supera la salida de la ${principal} (${HORARIOS_SALIDA[principal]}h).`);
    }
  }, [hora, tratamiento, principal, fecha]);

  // Algoritmo de validación por texto plano (Blindado)
  const comprobarDisponibilidad = (fechaNueva, horaInicioNueva, horaFinNueva, personalAComprobar, idCitaExcluida = null) => {
    const [hIn, mIn] = horaInicioNueva.split(':').map(Number);
    const [hFi, mFi] = horaFinNueva.split(':').map(Number);
    const minutosInicioNuevo = hIn * 60 + mIn;
    const minutosFinNuevo = hFi * 60 + mFi;

    for (let cita of citas) {
      if (idCitaExcluida && cita.id === idCitaExcluida) continue;

      const [fechaCita, tiempoCitaInicio] = cita.start.split('T');
      const tiempoCitaFin = cita.end.split('T')[1];

      if (fechaNueva !== fechaCita) continue;

      const [hCitaIn, mCitaIn] = tiempoCitaInicio.split(':').map(Number);
      const [hCitaFi, mCitaFi] = tiempoCitaFin.split(':').map(Number);
      const minutosCitaInicio = hCitaIn * 60 + mCitaIn;
      const minutesCitaFin = hCitaFi * 60 + mCitaFi;

      const seCruzanTiempos = minutosInicioNuevo < minutesCitaFin && minutosFinNuevo > minutosCitaInicio;

      if (seCruzanTiempos) {
        const equipo = cita.extendedProps?.personalInvolucrado || [];
        if (equipo.includes(personalAComprobar)) {
          return false; 
        }
      }
    }
    return true; 
  };

  // Generador de títulos dinámicos con soporte para el nombre del Paciente
  const calcularMetadatosCita = (principalElegido, asistenteElegido, tratamientoKey, finId, nombrePaciente) => {
    const infoTratamiento = DURACION_TRATAMIENTOS[tratamientoKey];
    const horaFinTexto = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    
    const [hLimite, mLimite] = HORARIOS_SALIDA[principalElegido].split(':').map(Number);
    const [hFin, mFin] = horaFinTexto.split(':').map(Number);
    
    let backgroundColor;
    let title;

    const pacienteLimpio = nombrePaciente.trim() ? nombrePaciente.trim() : "Paciente Anónimo";

    if ((hFin * 60 + mFin) > (hLimite * 60 + mLimite)) {
      backgroundColor = '#ef4444';
      title = `⚠️ SOBREPASADO (${horaFinTexto}) - 👤 ${pacienteLimpio} [${infoTratamiento.nombre}]`;
    } else {
      backgroundColor = COLORES_PERSONAL[principalElegido] || '#64748b';
      title = `👤 ${pacienteLimpio} - ${infoTratamiento.nombre} [Dirige: ${principalElegido}${asistenteElegido !== 'Ninguno' ? ` + Aux: ${asistenteElegido}` : ''}]`;
    }

    return { backgroundColor, title, pacienteLimpio };
  };

  const handleCrearCita = (e) => {
    e.preventDefault();
    setError('');

    if (!principal) {
      setError('⚠️ Error: Debes seleccionar un Especialista Principal en el desplegable.');
      return;
    }

    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento];
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    
    const horaInicioTexto = hora.slice(0, 5);
    const horaFinTexto = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;

    if (!comprobarDisponibilidad(fecha, horaInicioTexto, horaFinTexto, principal)) {
      setError(`❌ Conflicto de Agenda: ${principal} ya está ocupada en ese rango horario.`);
      return;
    }

    if (asistente !== 'Ninguno' && !comprobarDisponibilidad(fecha, horaInicioTexto, horaFinTexto, asistente)) {
      setError(`❌ Conflicto de Agenda: El asistente elegido (${asistente}) está ocupado.`);
      return;
    }

    const equipo = [principal];
    if (asistente !== 'Ninguno') equipo.push(asistente);

    const { backgroundColor, title, pacienteLimpio } = calcularMetadatosCita(principal, asistente, tratamiento, finId, paciente);

    const nuevaCita = {
      id: String(Date.now()),
      title,
      start: `${fecha}T${horaInicioTexto}:00`,
      end: `${fecha}T${horaFinTexto}:00`,
      backgroundColor,
      extendedProps: { 
        personalInvolucrado: equipo, 
        tratamientoKey: tratamiento, 
        principal, 
        asistente,
        paciente: pacienteLimpio
      }
    };

    setCitas([...citas, nuevaCita]);
    setPrincipal('');
    setPaciente(''); 
  };

  const handleActualizarCita = (id, datosActualizados) => {
    const tFinTexto = datosActualizados.end.split('T')[1].slice(0, 5);

    const citasModificadas = citas.map(cita => {
      if (cita.id === id) {
        const equipo = [datosActualizados.principal];
        if (datosActualizados.asistente !== 'Ninguno') equipo.push(datosActualizados.asistente);

        const dummyFin = new Date(datosActualizados.end);
        const pacienteExistente = datosActualizados.paciente || cita.extendedProps.paciente || "Paciente";

        const { backgroundColor, title } = calcularMetadatosCita(
          datosActualizados.principal,
          datosActualizados.asistente,
          datosActualizados.tratamientoKey || cita.extendedProps.tratamientoKey,
          dummyFin,
          pacienteExistente
        );

        return {
          ...cita,
          start: datosActualizados.start,
          end: datosActualizados.end,
          title,
          backgroundColor,
          extendedProps: { 
            ...cita.extendedProps, 
            ...datosActualizados, 
            personalInvolucrado: equipo, 
            tratamientoKey: datosActualizados.tratamientoKey || cita.extendedProps.tratamientoKey,
            paciente: pacienteExistente
          }
        };
      }
      return cita;
    });

    setCitas(citasModificadas);
    setCitaSeleccionada(null);
  };

  const handleEliminarCita = (id) => {
    setCitas(citas.filter(cita => cita.id !== id));
    setCitaSeleccionada(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">🩺 Gestor Clínico Pro</h1>
        <p className="text-xs text-slate-500">Arquitectura modular profesional y control de tiempos</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1">
          <Formulario
            fecha={fecha} setFecha={setFecha}
            hora={hora} setHora={setHora}
            tratamiento={tratamiento} setTratamiento={setTratamiento}
            principal={principal} setPrincipal={setPrincipal}
            asistente={asistente} setAsistente={setAsistente}
            paciente={paciente} setPaciente={setPaciente}
            error={error}
            advertencia={advertencia}
            handleCrearCita={handleCrearCita}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Calendario
            citas={citas}
            comprobarDisponibilidad={(ini, fin, pers, idEx) => {
              const f = ini.toISOString().split('T')[0];
              const hIn = ini.toTimeString().slice(0, 5);
              const hFi = fin.toTimeString().slice(0, 5);
              return comprobarDisponibilidad(f, hIn, hFi, pers, idEx);
            }}
            handleActualizarCita={handleActualizarCita}
            handleEliminarCita={handleEliminarCita}
            citaSeleccionada={citaSeleccionada}
            setCitaSeleccionada={setCitaSeleccionada}
          />
        </div>
      </div>
    </div>
  );
}

export default App;