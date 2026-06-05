// src/App.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS, HORARIOS_SALIDA, COLORES_PERSONAL, PERSONAL_CLINICA } from './data/config';
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas'; // 👈 Importamos nuestro nuevo módulo
import { BarChart3, ArrowLeft } from 'lucide-react';

function App() {
  const fechaFijaPrueba = new Date().toISOString().split('T')[0]; 

  // 💾 Base de datos local
  const [citas, setCitas] = useState(() => {
    const citasGuardadas = localStorage.getItem('agenda_clinica_citas');
    return citasGuardadas ? JSON.parse(citasGuardadas) : [];
  });

  // Control de la pantalla activa ('calendario' o 'estadisticas')
  const [vistaActual, setVistaActual] = useState('calendario');
  
  // Estados de los formularios
  const [paciente, setPaciente] = useState('');
  const [fecha, setFecha] = useState(fechaFijaPrueba);
  const [hora, setHora] = useState('09:00'); 
  const [tratamiento, setTratamiento] = useState('revision'); 
  const [principal, setPrincipal] = useState('');
  const [asistente, setAsistente] = useState('Ninguno');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // 💾 Auto-guardado en LocalStorage
  useEffect(() => {
    localStorage.setItem('agenda_clinica_citas', JSON.stringify(citas));
  }, [citas]);

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
      title = `👤 ${pacienteLimpio} - ${infoTratamiento.nombre}`;
    }

    return { backgroundColor, title, pacienteLimpio };
  };

  const handleCrearCita = (e) => {
    e.preventDefault();
    setError('');

    if (!principal) {
      setError('⚠️ Error: Debes seleccionar un Especialista Principal.');
      return;
    }

    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento]; 
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    
    const horaInicioTexto = hora.slice(0, 5);
    const horaFinTexto = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;

    if (!comprobarDisponibilidad(fecha, horaInicioTexto, horaFinTexto, principal)) {
      setError(`❌ Conflicto: ${principal} está ocupada en ese horario.`);
      return;
    }

    if (asistente !== 'Ninguno' && !comprobarDisponibilidad(fecha, horaInicioTexto, horaFinTexto, asistente)) {
      setError(`❌ Conflicto: El asistente (${asistente}) está ocupado.`);
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
        paciente: pacienteLimpio,
        observaciones: observaciones.trim()
      }
    };

    setCitas([...citas, nuevaCita]);
    setPaciente(''); 
    setObservaciones('');
  };

  const handleActualizarCita = (id, datosActualizados) => {
    const citasModificadas = citas.map(cita => {
      if (cita.id === id) {
        const [fechaCita] = cita.start.split('T');
        
        const nuevoPrincipal = datosActualizados.principal || cita.extendedProps.principal;
        const nuevoAsistente = datosActualizados.asistente || cita.extendedProps.asistente;
        const nuevoTratamientoKey = datosActualizados.treatmentKey || cita.extendedProps.tratamientoKey;
        const nuevoPaciente = datosActualizados.paciente !== undefined ? datosActualizados.paciente : cita.extendedProps.paciente;
        const nuevasObservaciones = datosActualizados.observaciones !== undefined ? datosActualizados.observaciones : cita.extendedProps.observaciones;
        
        let nuevoStart = datosActualizados.start || cita.start;
        let nuevoEnd = datosActualizados.end;

        if (datosActualizados.horaInicioManual) {
          nuevoStart = `${fechaCita}T${datosActualizados.horaInicioManual}:00`;
          const infoTratamiento = DURACION_TRATAMIENTOS[nuevoTratamientoKey];
          const dummyInicio = new Date(nuevoStart);
          const dummyFin = new Date(dummyInicio.getTime() + infoTratamiento.minutos * 60000);
          nuevoEnd = `${fechaCita}T${String(dummyFin.getHours()).padStart(2, '0')}:${String(dummyFin.getMinutes()).padStart(2, '0')}:00`;
        }

        const equipo = [nuevoPrincipal];
        if (nuevoAsistente !== 'Ninguno') equipo.push(nuevoAsistente);

        const dummyFinObj = new Date(nuevoEnd);
        const { backgroundColor, title } = calcularMetadatosCita(
          nuevoPrincipal,
          nuevoAsistente,
          nuevoTratamientoKey,
          dummyFinObj,
          nuevoPaciente
        );

        return {
          ...cita,
          start: nuevoStart,
          end: nuevoEnd,
          title,
          backgroundColor,
          extendedProps: { 
            personalInvolucrado: equipo, 
            tratamientoKey: nuevoTratamientoKey, 
            principal: nuevoPrincipal, 
            asistente: nuevoAsistente,
            paciente: nuevoPaciente,
            observaciones: nuevasObservaciones
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
      {/* HEADER LIMPIO */}
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 hide-on-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🩺 Gestor Clínico Pro</h1>
          <p className="text-xs text-slate-500">Arquitectura modular profesional y analíticas</p>
        </div>
        
        <div>
          {vistaActual === 'calendario' ? (
            <button
              onClick={() => setVistaActual('estadisticas')}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <BarChart3 size={16} /> 📊 Ver Estadísticas Mensuales
            </button>
          ) : (
            <button
              onClick={() => setVistaActual('calendario')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} /> 📅 Volver al Calendario
            </button>
          )}
        </div>
      </header>

      {/* CONTROL DE VISTAS TOTALMENTE MODULAR */}
      {vistaActual === 'calendario' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 hide-on-print">
            <Formulario
              fecha={fecha} setFecha={setFecha}
              hora={hora} setHora={setHora}
              tratamiento={tratamiento} setTratamiento={setTratamiento}
              principal={principal} setPrincipal={setPrincipal}
              asistente={asistente} setAsistente={setAsistente}
              paciente={paciente} setPaciente={setPaciente}
              observaciones={observaciones} setObservaciones={setObservaciones}
              error={error}
              advertencia={advertencia}
              handleCrearCita={handleCrearCita}
            />
          </div>
          
          <div className="lg:col-span-3">
            <Calendario
              citas={citas}
              fechaActual={fecha} 
              personalList={PERSONAL_CLINICA}
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
      ) : (
        /* ¡Inyección limpia del nuevo componente modular! 🚀 */
        <Estadisticas citas={citas} personalList={PERSONAL_CLINICA} />
      )}
    </div>
  );
}

export default App;