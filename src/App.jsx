// src/App.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS } from './data/config'; 
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas';
import GestionPersonal from './components/GestionPersonal'; 
import GestionPacientes from './components/GestionPacientes'; 
import Calculadora from './components/Calculadora'; 
import RelojDigital from './components/RelojDigital'; 
import { BarChart3, ArrowLeft, Users, UserCircle, LogOut, LogIn } from 'lucide-react';
import { apiCitas, apiPersonal, apiPacientes } from './services/api'; 

import logoClinica from './assets/logo.avif';

const PERSONAL_INICIAL_OBJ = [
  { 
    id: 1, 
    nombre: 'Rut', 
    apellidos: 'Barrero', 
    rol: 'Especialista', 
    color: '#3b82f6',
    horario: {
      lunes: { trabaja: true, inicio: '15:00', fin: '19:00' },
      martes: { trabaja: true, inicio: '09:00', fin: '15:00' },
      miercoles: { trabaja: true, inicio: '15:00', fin: '19:00' },
      jueves: { trabaja: true, inicio: '09:00', fin: '15:00' },
      viernes: { trabaja: true, inicio: '15:00', fin: '19:00' }
    }
  },
  { 
    id: 2, 
    nombre: 'Miriam', 
    apellidos: 'Quiñones', 
    rol: 'Especialista', 
    color: '#ef4444',
    horario: {
      lunes: { trabaja: true, inicio: '09:00', fin: '15:00' },
      martes: { trabaja: true, inicio: '15:00', fin: '19:00' },
      miercoles: { trabaja: true, inicio: '09:00', fin: '15:00' },
      jueves: { trabaja: true, inicio: '15:00', fin: '19:00' },
      viernes: { trabaja: true, inicio: '09:00', fin: '15:00' }
    }
  },
  { 
    id: 3, 
    nombre: 'María', 
    apellidos: '', 
    rol: 'Asistente', 
    color: '#10b981',
    horario: {
      lunes: { trabaja: true, inicio: '09:00', fin: '19:00' },
      martes: { trabaja: true, inicio: '09:00', fin: '19:00' },
      miercoles: { trabaja: true, inicio: '09:00', fin: '19:00' },
      jueves: { trabaja: true, inicio: '09:00', fin: '19:00' },
      viernes: { trabaja: true, inicio: '09:00', fin: '19:00' }
    }
  }
];

const HORARIO_POR_DEFECTO = {
  lunes: { trabaja: true, inicio: '09:00', fin: '19:00' },
  martes: { trabaja: true, inicio: '09:00', fin: '19:00' },
  miercoles: { trabaja: true, inicio: '09:00', fin: '19:00' },
  jueves: { trabaja: true, inicio: '09:00', fin: '19:00' },
  viernes: { trabaja: true, inicio: '09:00', fin: '19:00' }
};

const TRADUCTOR_DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function App() {
  const obtenerFechaInicialValida = () => {
    const d = new Date();
    const dia = d.getDay();
    if (dia === 6) d.setDate(d.getDate() + 2); 
    if (dia === 0) d.setDate(d.getDate() + 1); 
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fechaFijaPrueba = obtenerFechaInicialValida();
  
  // 🌟 NUEVO ESTADO: Controla si el usuario está dentro del sistema o fuera
  const [sesionActiva, setSesionActiva] = useState(true);

  const [citas, setCitas] = useState([]);
  const [personalList, setPersonalList] = useState([]); 
  const [pacientes, setPacientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('calendario');
  
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

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const [citasFormateadas, personalDB, pacientesDB] = await Promise.all([
          apiCitas.getAll(),
          apiPersonal.getAll(),
          apiPacientes.getPorPagina(1, 50) 
        ]);
        setCitas(citasFormateadas);
        setPacientes(pacientesDB || []);

        if (personalDB && personalDB.length > 0) {
          const plantillaInyectada = personalDB.map(emp => {
            const coincidenciaInicial = PERSONAL_INICIAL_OBJ.find(p => p.nombre.toLowerCase() === emp.nombre.toLowerCase());
            return {
              ...emp,
              horario: emp.horario && Object.keys(emp.horario).length > 0 
                ? emp.horario 
                : (coincidenciaInicial?.horario || HORARIO_POR_DEFECTO)
            };
          });
          setPersonalList(plantillaInyectada);
        } else {
          setPersonalList(PERSONAL_INICIAL_OBJ);
        }
      } catch (err) {
        console.error('Error al descargar datos de la API:', err);
        setError('❌ Error de conexión: No se pudieron sincronizar los datos.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  // Handlers para pacientes
  const handleAddPaciente = async (nuevoPac) => {
    const registroInsertado = await apiPacientes.insert(nuevoPac);
    setPacientes([...pacientes, registroInsertado]);
    return registroInsertado;
  };

  const handleUpdatePaciente = async (id, datosActualizados) => {
    const registroActualizado = await apiPacientes.update(id, datosActualizados);
    setPacientes(pacientes.map(p => p.id === id ? registroActualizado : p));
    return registroActualizado;
  };

  const handleDelPaciente = async (id) => {
    await apiPacientes.delete(id);
    setPacientes(pacientes.filter(p => p.id !== id));
    return true;
  };

  // Handlers para personal
  const handleAddPersonal = async (nuevoTrabajador) => {
    try {
      const registroInsertado = await apiPersonal.insert(nuevoTrabajador);
      setPersonalList([...personalList, registroInsertado]);
    } catch (err) {
      alert('❌ Error al registrar el alta en Supabase.');
    }
  };

  const handleUpdatePersonal = async (id, datosActualizados) => {
    try {
      const registroActualizado = await apiPersonal.update(id, datosActualizados);
      setPersonalList(personalList.map(emp => emp.id === id ? registroActualizado : emp));
      
      const actual = personalList.find(e => e.id === id);
      if (actual && principal === `${actual.nombre} ${actual.apellidos || ''}`.trim()) {
        setPrincipal(`${datosActualizados.nombre} ${datosActualizados.apellidos || ''}`.trim());
      }
    } catch (err) {
      alert('❌ Error al actualizar los datos en Supabase.');
    }
  };

  const handleDelPersonal = async (id) => {
    const seguro = window.confirm("¿Seguro que deseas eliminar a este trabajador?");
    if (!seguro) return;
    try {
      await apiPersonal.delete(id);
      setPersonalList(personalList.filter(emp => emp.id !== id));
    } catch (err) {
      alert('❌ Error al eliminar el registro en Supabase.');
    }
  };

  const handleActualizarCita = async (id, datosActualizados) => {
    const citaOriginal = citas.find(c => c.id === id);
    if (!citaOriginal) return;

    const [fechaCita] = citaOriginal.start.split('T');
    
    const nuevoPrincipal = datosActualizados.principal || citaOriginal.extendedProps.principal;
    const nuevoAsistente = datosActualizados.asistente || citaOriginal.extendedProps.asistente;
    const nuevoTratamientoKey = datosActualizados.treatmentKey || citaOriginal.extendedProps.tratamientoKey;
    const nuevoPaciente = datosActualizados.paciente !== undefined ? datosActualizados.paciente : citaOriginal.extendedProps.paciente;
    const nuevasObservaciones = datosActualizados.observaciones !== undefined ? datosActualizados.observaciones : citaOriginal.extendedProps.observaciones;
    
    let nuevoStart = datosActualizados.start || citaOriginal.start;
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
      fechaCita,
      nuevoStart.split('T')[1].slice(0, 5),
      nuevoPrincipal,
      nuevoAsistente,
      nuevoTratamientoKey,
      dummyFinObj,
      nuevoPaciente
    );

    const citaActualizadaEstructura = {
      title, start: nuevoStart, end: nuevoEnd, backgroundColor,
      extendedProps: { 
        personalInvolucrado: equipo, tratamientoKey: nuevoTratamientoKey, 
        principal: nuevoPrincipal, asistente: nuevoAsistente,
        paciente: nuevoPaciente, observaciones: nuevasObservaciones
      }
    };

    try {
      const registroActualizado = await apiCitas.update(id, citaActualizadaEstructura);
      setCitas(citas.map(cita => cita.id === id ? { ...registroActualizado, id: String(registroActualizado.id) } : cita));
      setCitaSeleccionada(null);
    } catch (err) {
      alert('No se pudieron guardar los cambios: ' + (err.message || ''));
    }
  };

  const handleEliminarCita = async (id) => {
    const seguro = window.confirm("⚠️ ¿Estás seguro de que deseas eliminar esta cita de forma permanente?");
    if (!seguro) return;

    try {
      await apiCitas.delete(id);
      setCitas(citas.filter(cita => cita.id !== id));
      setCitaSeleccionada(null);
    } catch (err) {
      alert('No se pudo eliminar la cita.');
    }
  };

  useEffect(() => {
    if (principal && principal === asistente) setAsistente('Ninguno');
  }, [principal]);

  useEffect(() => {
    setAdvertencia('');
    if (!principal) return;

    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento];
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    const horaFinStr = finId.toTimeString().slice(0, 5);

    const empData = personalList.find(p => `${p.nombre} ${p.apellidos || ''}`.trim() === principal);
    const cuadrante = empData?.horario && Object.keys(empData.horario).length > 0 ? empData.horario : HORARIO_POR_DEFOTT;
    
    const diaSemanaNombre = TRADUCTOR_DIAS[dummy.getDay()];
    const reglaDia = cuadrante[diaSemanaNombre];

    if (!reglaDia || !reglaDia.trabaja) {
      setAdvertencia(`⚠️ ¡Aviso! El ${diaSemanaNombre} figura como día NO laborable para ${principal}.`);
      return;
    }

    const [hIn, mIn] = hora.split(':').map(Number);
    const [hFi, mFi] = horaFinStr.split(':').map(Number);
    const [hLimIn, mLimIn] = reglaDia.inicio.split(':').map(Number);
    const [hLimFi, mLimFi] = reglaDia.fin.split(':').map(Number);

    const minCitaInicio = hIn * 60 + mIn;
    const minCitaFin = hFi * 60 + mFi;
    const minTurnoInicio = hLimIn * 60 + mLimIn;
    const minTurnoFin = hLimFi * 60 + mLimFi;

    if (minCitaInicio < minTurnoInicio || minCitaFin > minTurnoFin) {
      setAdvertencia(`⚠️ ¡Fuera de Turno! ${principal} trabaja de ${reglaDia.inicio}h a ${reglaDia.fin}h los ${diaSemanaNombre}s.`);
    }
  }, [hora, tratamiento, principal, fecha, personalList]);

  const compruebaTurnoEmpleado = (nombreCompleto, fechaStr, hIniStr, hFinStr) => {
    const empData = personalList.find(p => `${p.nombre} ${p.apellidos || ''}`.trim() === nombreCompleto);
    if (!empData) return true; 

    const cuadrante = empData.horario && Object.keys(empData.horario).length > 0 ? empData.horario : HORARIO_POR_DEFECTO;
    const dummyFecha = new Date(`${fechaStr}T00:00:00`);
    const diaSemanaNombre = TRADUCTOR_DIAS[dummyFecha.getDay()];
    const reglaDia = cuadrante[diaSemanaNombre];

    if (!reglaDia || !reglaDia.trabaja) return false;

    const [hIn, mIn] = hIniStr.split(':').map(Number);
    const [hFi, mFi] = hFinStr.split(':').map(Number);
    const [hLimIn, mLimIn] = reglaDia.inicio.split(':').map(Number);
    const [hLimFi, mLimFi] = reglaDia.fin.split(':').map(Number);

    return (hIn * 60 + mIn) >= (hLimIn * 60 + mLimIn) && (hFi * 60 + mFi) <= (hLimFi * 60 + mLimFi);
  };

  const comprobarDisponibilidad = (fNueva, hIniNueva, hFinNueva, pers, idEx = null) => {
    if (pers !== 'Ninguno' && !compruebaTurnoEmpleado(pers, fNueva, hIniNueva, hFinNueva)) {
      return false; 
    }

    const [hIn, mIn] = hIniNueva.split(':').map(Number);
    const [hFi, mFi] = hFinNueva.split(':').map(Number);
    const minIniN = hIn * 60 + mIn;
    const minFinN = hFi * 60 + mFi;
    
    for (let cita of citas) {
      if (idEx && cita.id === idEx) continue;
      const [fCita, tCitaIni] = cita.start.split('T');
      const tCitaFin = cita.end.split('T')[1];
      if (fNueva !== fCita) continue;
      const [hCitaIn, mCitaIn] = tCitaIni.split(':').map(Number);
      const [hCitaFi, mCitaFi] = tCitaFin.split(':').map(Number);
      const minCitaI = hCitaIn * 60 + mCitaIn;
      const minCitaF = hCitaFi * 60 + mCitaFi;
      if (minIniN < minCitaF && minFinN > minCitaI) {
        if ((cita.extendedProps?.personalInvolucrado || []).includes(pers)) return false;
      }
    }
    return true; 
  };

  const calcularMetadatosCita = (fechaStr, hIniStr, pElegido, aElegido, tKey, finId, nomPaciente) => {
    const infoTratamiento = DURACION_TRATAMIENTOS[tKey];
    const hFinT = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    const turnoCorrecto = compruebaTurnoEmpleado(pElegido, fechaStr, hIniStr, hFinT);
    const empData = personalList.find(p => `${p.nombre} ${p.apellidos || ''}`.trim() === pElegido);
    const colorPorDefecto = empData?.color || '#64748b';

    let backgroundColor = !turnoCorrecto ? '#ef4444' : colorPorDefecto;
    let title = !turnoCorrecto ? `⚠️ FUERA DE TURNO (${hFinT}) - 👤 ${nomPaciente}` : `👤 ${nomPaciente} - ${infoTratamiento.nombre}`;
    return { backgroundColor, title, pacienteLimpio: nomPaciente.trim() || "Paciente Anónimo" };
  };

  const handleCrearCita = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!principal || principal === "") {
      return setError('⚠️ Error: Selecciona un Especialista Principal de la lista.');
    }
    
    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento]; 
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    const hIniT = hora.slice(0, 5);
    const hFinT = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    
    if (!comprobarDisponibilidad(fecha, hIniT, hFinT, principal)) {
      return setError(`❌ Conflicto: Horario no disponible o sobrepuesto para ${principal}.`);
    }
    if (asistente !== 'Ninguno' && !comprobarDisponibilidad(fecha, hIniT, hFinT, asistente)) {
      return setError(`❌ Conflicto: Horario no disponible o sobrepuesto para el Asistente.`);
    }

    const equipo = [principal]; 
    if (asistente !== 'Ninguno') equipo.push(asistente);
    
    const { backgroundColor, title, pacienteLimpio } = calcularMetadatosCita(fecha, hIniT, principal, asistente, tratamiento, finId, paciente);
    
    const nuevaCita = {
      title, start: `${fecha}T${hIniT}:00`, end: `${fecha}T${hFinT}:00`, backgroundColor, estado: 'Pendiente',
      extendedProps: { personalInvolucrado: equipo, tratamientoKey: tratamiento, principal, asistente, paciente: pacienteLimpio, observaciones: observaciones.trim() }
    };
    
    try {
      const registroInsertado = await apiCitas.insert(nuevaCita);
      setCitas([...citas, { ...registroInsertado, id: String(registroInsertado.id) }]);
      setPaciente(''); setObservaciones('');
      setPrincipal(''); 
    } catch (err) { 
      setError('❌ Error en la nube al guardar la cita.'); 
    }
  };

  // 🌟 VISTA CORPORATIVA: Pantalla que se muestra al cerrar sesión
  if (!sesionActiva) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="bg-white/5 border border-white/10 p-10 rounded-3xl max-w-sm w-full shadow-2xl backdrop-blur-md space-y-6 animate-fadeIn">
          <div className="flex justify-center">
            <img 
              src={logoClinica} 
              alt="Logo Clínica" 
              className="h-24 w-auto object-contain filter drop-shadow-md"
            />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-white font-bold text-lg tracking-wide uppercase">Clínica Médica</h2>
            <p className="text-slate-400 text-xs">Sesión finalizada de forma segura.</p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setSesionActiva(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-wider"
            >
              <LogIn size={16} /> Acceder al Sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL (Cuando la sesión está activa)
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 hide-on-print">
        <div className="flex items-center gap-3">
          <img src={logoClinica} alt="Logo" className="h-12 w-auto object-contain select-none" />
          <RelojDigital />
        </div>
        
        <div className="flex gap-2 items-center">
          <Calculadora />

          {vistaActual === 'calendario' ? (
            <>
              <button
                onClick={() => setVistaActual('pacientes')}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 shadow-sm transition-all"
              >
                <UserCircle size={16} className="text-emerald-600" /> 👥 Gestión Pacientes
              </button>
              <button
                onClick={() => setVistaActual('personal')}
                className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border border-cyan-200 shadow-sm transition-all"
              >
                <Users size={16} className="text-cyan-600" /> 👥 Configurar Personal
              </button>
              <button
                onClick={() => setVistaActual('estadisticas')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <BarChart3 size={16} /> 📊 Ver Estadísticas
              </button>
            </>
          ) : (
            <button
              onClick={() => setVistaActual('calendario')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} /> 📅 Volver al Calendario
            </button>
          )}

          {/* 🌟 NUEVO BOTÓN: Cerrar Sesión con estilo clínico e icono sofisticado */}
          <button
            onClick={() => {
              const confirmar = window.confirm("¿Seguro que deseas salir del panel clínico?");
              if (confirmar) setSesionActiva(false);
            }}
            className="bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm transition-all"
            title="Cerrar sesión de forma segura"
          >
            <LogOut size={15} /> Salir
          </button>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-500 text-xs">Sincronizando la clínica con Supabase...</p>
        </div>
      ) : (
        vistaActual === 'calendario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1 hide-on-print">
              <Formulario
                fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora}
                tratamiento={tratamiento} setTratamiento={setTratamiento} principal={principal} setPrincipal={setPrincipal}
                asistente={asistente} setAsistente={setAsistente} paciente={paciente} setPaciente={setPaciente}
                observaciones={observaciones} setObservaciones={setObservaciones} error={error} advertencia={advertencia}
                handleCrearCita={handleCrearCita} personalList={personalList} 
              />
            </div>
            <div className="lg:col-span-3">
              <Calendario
                citas={citas} fechaActual={fecha} personalList={personalList} 
                comprobarDisponibilidad={(ini, fin, pers, idEx) => {
                  return comprobarDisponibilidad(ini.toISOString().split('T')[0], ini.toTimeString().slice(0, 5), fin.toTimeString().slice(0, 5), pers, idEx);
                }}
                handleActualizarCita={handleActualizarCita} 
                handleEliminarCita={handleEliminarCita}
                citaSeleccionada={citaSeleccionada} setCitaSeleccionada={setCitaSeleccionada}
              />
            </div>
          </div>
        ) : vistaActual === 'estadisticas' ? (
          <Estadisticas citas={citas} personalList={personalList} />
        ) : vistaActual === 'personal' ? (
          <GestionPersonal 
            personal={personalList}
            onAdd={handleAddPersonal}
            onUpdate={handleUpdatePersonal}
            onDelete={handleDelPersonal}
            onVolver={() => setVistaActual('calendario')}
          />
        ) : (
          <GestionPacientes 
            pacientes={pacientes}
            onAddPaciente={handleAddPaciente}
            onUpdatePaciente={handleUpdatePaciente}
            onDeletePaciente={handleDelPaciente}
          />
        )
      )}
    </div>
  );
}

export default App;