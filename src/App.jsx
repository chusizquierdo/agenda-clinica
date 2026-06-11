// src/App.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS } from './data/config'; 
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas';
import GestionPersonal from './components/GestionPersonal'; 
import GestionPacientes from './components/GestionPacientes'; 
import GestionVacaciones from './components/GestionVacaciones';
import Calculadora from './components/Calculadora'; 
import RelojDigital from './components/RelojDigital'; 
import Login from './components/Login';
import { apiAuth } from './services/auth';
import { apiVacaciones } from './services/vacaciones';
import { BarChart3, ArrowLeft, Users, UserCircle, LogOut, CalendarDays } from 'lucide-react';
import { apiCitas, apiPersonal, apiPacientes } from './services/api'; 

import logoClinica from './assets/logo.avif';

const PERSONAL_INICIAL_OBJ = [
  { 
    id: 1, 
    nombre: 'Rut', 
    apellido: 'Barrero', 
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
    apellido: 'Quiñones', 
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
    apellido: '', 
    rol: 'Asistente', 
    color: '#10b981',
    horario: {
      lunes: { trabaja: true, inicio: '09:00', fin: '19:00' },
      martes: { trabaja: true, inicio: '09:00', fin: '19:00' },
      miercoles: { trabaja: true, inicio: '09:00', py: '19:00' },
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
  
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [comprobandoSesion, setComprobandoSesion] = useState(true);

  const [citas, setCitas] = useState([]);
  const [personalList, setPersonalList] = useState([]); 
  const [pacientes, setPacientes] = useState([]); 
  const [vacaciones, setVacaciones] = useState([]);
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

  // 🌟 DECLARACIONES CON HOISTING GARANTIZADO (Se pueden llamar desde cualquier lugar)
  function compruebaTurnoEmpleado(nombreCompleto, fechaStr, hIniStr, hFinStr) {
    const empData = personalList.find(p => `${p.nombre} ${p.apellido || ''}`.trim() === nombreCompleto);
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
  }

  function comprobarDisponibilidad(fNueva, hIniNueva, hFinNueva, pers, idEx = null) {
    if (pers === 'Ninguno') return true;

    const estaDeVacaciones = vacaciones.some(v => {
      const nombreTrabajador = `${v.nombre_empleado}`.toLowerCase();
      const persMinus = pers.toLowerCase();
      if (!persMinus.includes(nombreTrabajador)) return false;
      return fNueva >= v.fecha_inicio && fNueva <= v.fecha_fin;
    });

    if (estaDeVacaciones) return false; 

    if (!compruebaTurnoEmpleado(pers, fNueva, hIniNueva, hFinNueva)) {
      return false; 
    }

    const [hIn, mIn] = hIniNueva.split(':').map(Number);
    const [hFi, mFi] = hFinNueva.split(':').map(Number);
    const minIniN = hIn * 60 + mIn;
    const minFinN = hFi * 60 + mFi;
    
    for (let cita of citas) {
      if (idEx && String(cita.id) === String(idEx)) continue;
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
  }

  function calcularMetadatosCita(fechaStr, hIniStr, pElegido, aElegido, tKey, finId, nomPaciente) {
    const infoTratamiento = DURACION_TRATAMIENTOS[tKey];
    const hFinT = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    const turnoCorrecto = compruebaTurnoEmpleado(pElegido, fechaStr, hIniStr, hFinT);
    const empData = personalList.find(p => `${p.nombre} ${p.apellido || ''}`.trim() === pElegido);
    const colorPorDefecto = empData?.color || '#64748b';

    let backgroundColor = !turnoCorrecto ? '#ef4444' : colorPorDefecto;
    let title = !turnoCorrecto ? `⚠️ FUERA DE TURNO (${hFinT}) - 👤 ${nomPaciente}` : `👤 ${nomPaciente} - ${infoTratamiento.nombre}`;
    return { backgroundColor, title, pacienteLimpio: nomPaciente.trim() || "Paciente Anónimo" };
  }

  useEffect(() => {
    const verificarSesionInicial = async () => {
      const user = await apiAuth.getUsuarioActual();
      setUsuarioLogueado(user);
      setComprobandoSesion(false);
    };

    verificarSesionInicial();

    const { subscription } = apiAuth.onEstadoSesionCambia((user) => {
      setUsuarioLogueado(user);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!usuarioLogueado) return;

    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const [citasFormateadas, personalDB, pacientesDB, vacacionesDB] = await Promise.all([
          apiCitas.getAll(),
          apiPersonal.getAll(),
          apiPacientes.getPorPagina(1, 50),
          apiVacaciones.getAll()
        ]);

        const citasNormalizadas = (citasFormateadas || []).map(c => ({ ...c, id: String(c.id) }));
        setCitas(citasNormalizadas);
        setPacientes(pacientesDB || []);
        setVacaciones(vacacionesDB || []);

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
  }, [usuarioLogueado]);

  const handleCerrarSesionReal = async () => {
    const seguro = window.confirm("¿Seguro que deseas salir del panel clínico?");
    if (!seguro) return;

    try {
      await apiAuth.logout();
      setUsuarioLogueado(null);
      setVistaActual('calendario');
    } catch (err) {
      alert('Error al cerrar la sesión de forma segura.');
    }
  };

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
      if (actual && principal === `${actual.nombre} ${actual.apellido || ''}`.trim()) {
        setPrincipal(`${datosActualizados.nombre} ${datosActualizados.apellido || ''}`.trim());
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

  const handleAddVacacion = async (nuevaVac) => {
    const registroInsertado = await apiVacaciones.insert(nuevaVac);
    setVacaciones([...vacaciones, registroInsertado]);
    return registroInsertado;
  };

  const handleDelVacacion = async (id) => {
    await apiVacaciones.delete(id);
    setVacaciones(vacaciones.filter(v => v.id !== id));
    return true;
  };

  const handleActualizarCita = async (id, datosActualizados) => {
    const citaOriginal = citas.find(c => String(c.id) === String(id));
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

    if (!comprobarDisponibilidad(fechaCita, nuevoStart.split('T')[1].slice(0, 5), nuevoEnd.split('T')[1].slice(0, 5), nuevoPrincipal, id)) {
      alert(`❌ Operación denegada: ${nuevoPrincipal} está de vacaciones o no disponible en este rango.`);
      return;
    }
    if (nuevoAsistente !== 'Ninguno' && !comprobarDisponibilidad(fechaCita, nuevoStart.split('T')[1].slice(0, 5), nuevoEnd.split('T')[1].slice(0, 5), nuevoAsistente, id)) {
      alert(`❌ Operación denegada: El asistente está de vacaciones o no disponible en este rango.`);
      return;
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
      setCitas(citas.map(cita => String(cita.id) === String(id) ? { ...registroActualizado, id: String(registroActualizado.id) } : cita));
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
      setCitas(prevCitas => prevCitas.filter(cita => String(cita.id) !== String(id)));
      setCitaSeleccionada(null);
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar la cita de la base de datos.');
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

    const empData = personalList.find(p => `${p.nombre} ${p.apellido || ''}`.trim() === principal);
    const cuadrante = empData?.horario && Object.keys(empData.horario).length > 0 ? empData.horario : HORARIO_POR_DEFECTO;
    
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
  }, [hora, tratamiento, principal, fecha, personalList, vacaciones]);

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
      return setError(`❌ Bloqueo por Vacaciones o Conflicto: Horario no disponible para ${principal}.`);
    }
    if (asistente !== 'Ninguno' && !comprobarDisponibilidad(fecha, hIniT, hFinT, asistente)) {
      return setError(`❌ Bloqueo por Vacaciones o Conflicto: Horario no disponible para el Asistente.`);
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

  if (comprobandoSesion) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/10 border-t-blue-500"></div>
        <p className="text-slate-500 text-xs tracking-wider uppercase font-medium">Verificando seguridad...</p>
      </div>
    );
  }

  if (!usuarioLogueado) {
    return <Login onLoginExitoso={(user) => setUsuarioLogueado(user)} />;
  }

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
                onClick={() => setVistaActual('vacaciones')}
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border border-amber-200 shadow-sm transition-all"
              >
                <CalendarDays size={16} className="text-amber-600" /> 🏖️ Vacaciones Personal
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

          <button
            onClick={handleCerrarSesionReal}
            className="bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm transition-all"
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
        ) : vistaActual === 'vacaciones' ? (
          <GestionVacaciones
            personal={personalList}
            vacaciones={vacaciones}
            onAdd={handleAddVacacion}
            onDelete={handleDelVacacion}
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