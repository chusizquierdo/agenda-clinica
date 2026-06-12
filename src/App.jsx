import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS } from './data/config'; 
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';
import CambioPasswordModal from './components/CambioPasswordModal';
import Header from './components/Header'; 
import Login from './components/Login';
import VistaAdministracion from './components/VistaAdministracion';
import { apiAuth } from './services/auth';
import { apiVacaciones } from './services/vacaciones';
import { apiCitas, apiPersonal, apiPacientes } from './services/api'; 

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
  
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [comprobandoSesion, setComprobandoSesion] = useState(true);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);

  const [citas, setCitas] = useState([]);
  const [personalList, setPersonalList] = useState([]); 
  const [pacientes, setPacientes] = useState([]); 
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('calendario');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  function compruebaTurnoEmpleado(nombreCompleto, fechaStr, hIniStr, hFinStr) {
    const empData = personalList.find(p => `${p.nombre} ${p.apellido || ''}`.trim() === nombreCompleto);
    if (!empData) return true; 

    const cuadrante = empData.horario && Object.keys(empData.horario).length > 0 ? empData.horario : HORARIO_POR_DEFECTO;
    const dummyFecha = new Date(`${fechaStr}T00:00:00`);
    const diaSemanaNombre = TRADUCTOR_DIAS[dummyFecha.getDay()];
    const reglaDia = cuadrante[diaSemanaNombre];

    if (!reglaDia || (!reglaDia.trabaja && !reglaDia.works)) return false;

    const [hIn, mIn] = hIniStr.split(':').map(Number);
    const [hFi, mFi] = hFinStr.split(':').map(Number);
    const [hLimIn, mLimIn] = (reglaDia.inicio || '09:00').split(':').map(Number);
    const [hLimFi, mLimFi] = (reglaDia.fin || '19:00').split(':').map(Number);

    return (hIn * 60 + mIn) >= (hLimIn * 60 + mLimIn) && (hFi * 60 + mFi) <= (hLimFi * 60 + mLimFi);
  }

  function comprobarDisponibilidad(fNueva, hIniNueva, hFinNueva, pers, idEx = null) {
    if (pers === 'Ninguno') return true;

    // Diagnóstico inicial
    console.log(`🔍 DEBUG: Validando ${pers} | ID Excluido: ${idEx} | ${fNueva} | ${hIniNueva} a ${hFinNueva}`);

    const estaDeVacaciones = vacaciones.some(v => {
      const nombreTrabajador = `${v.nombre_empleado}`.toLowerCase();
      const persMinus = pers.toLowerCase();
      if (!persMinus.includes(nombreTrabajador)) return false;
      return fNueva >= v.fecha_inicio && fNueva <= v.fecha_fin;
    });

    if (estaDeVacaciones) {
      console.log(`❌ Bloqueado: ${pers} está de vacaciones.`);
      return false; 
    }

    if (!compruebaTurnoEmpleado(pers, fNueva, hIniNueva, hFinNueva)) {
      console.log(`❌ Bloqueado: ${pers} fuera de turno.`);
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
        if ((cita.extendedProps?.personalInvolucrado || []).includes(pers)) {
          console.log(`❌ CONFLICTO detectado con cita ID ${cita.id} (${cita.extendedProps.paciente})`);
          return false;
        }
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
            const rolDefinitivo = emp.rol || emp.role || coincidenciaInicial?.rol || 'Especialista';
            const apellidoDefinitivo = emp.apellido !== undefined ? emp.apellido : (emp.apellidos || coincidenciaInicial?.apellido || '');
            const colorDefinitivo = emp.color || coincidenciaInicial?.color || '#64748b';

            return {
              ...emp,
              rol: rolDefinitivo,
              role: rolDefinitivo,
              apellido: apellidoDefinitivo,
              color: colorDefinitivo,
              horario: emp.horario && Object.keys(emp.horario).length > 0 ? emp.horario : (coincidenciaInicial?.horario || HORARIO_POR_DEFECTO)
            };
          });
          setPersonalList(plantillaInyectada);
        } else {
          setPersonalList(PERSONAL_INICIAL_OBJ);
        }
      } catch (err) {
        console.error('Error al descargar datos de la API:', err);
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
      const normalizado = {
        ...registroInsertado,
        rol: registroInsertado.rol || registroInsertado.role || 'Especialista',
        role: registroInsertado.rol || registroInsertado.role || 'Especialista',
        apellido: registroInsertado.apellido !== undefined ? registroInsertado.apellido : (registroInsertado.apellidos || '')
      };
      setPersonalList([...personalList, normalizado]);
    } catch (err) {
      alert('❌ Error al registrar el alta en Supabase.');
    }
  };

  const handleUpdatePersonal = async (id, datosActualizados) => {
    try {
      const registroActualizado = await apiPersonal.update(id, datosActualizados);
      const normalizado = {
        ...registroActualizado,
        rol: registroActualizado.rol || registroActualizado.role || 'Especialista',
        role: registroActualizado.rol || registroActualizado.role || 'Especialista',
        apellido: registroActualizado.apellido !== undefined ? registroInsertado.apellido : (registroActualizado.apellidos || '')
      };
      setPersonalList(personalList.map(emp => emp.id === id ? normalizado : emp));
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
    const nuevasObservaciones = datosActualizados.observaciones || citaOriginal.extendedProps.observaciones || '';
    
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
      alert(`❌ Operación denegada: Horario no disponible para el especialista.`);
      return;
    }

    const equipo = [nuevoPrincipal];
    if (nuevoAsistente !== 'Ninguno') equipo.push(nuevoAsistente);

    const dummyFinObj = new Date(nuevoEnd);
    const { backgroundColor, title } = calcularMetadatosCita(fechaCita, nuevoStart.split('T')[1].slice(0, 5), nuevoPrincipal, nuevoAsistente, nuevoTratamientoKey, dummyFinObj, nuevoPaciente);

    const citaActualizadaEstructura = {
      title, start: nuevoStart, end: nuevoEnd, backgroundColor,
      extendedProps: { personalInvolucrado: equipo, tratamientoKey: nuevoTratamientoKey, principal: nuevoPrincipal, asistente: nuevoAsistente, paciente: nuevoPaciente, observaciones: nuevasObservaciones }
    };

    try {
      const registroActualizado = await apiCitas.update(id, citaActualizadaEstructura);
      setCitas(citas.map(cita => String(cita.id) === String(id) ? { ...registroActualizado, id: String(registroActualizado.id) } : cita));
      setCitaSeleccionada(null);
    } catch (err) {
      alert('No se pudieron guardar los cambios en la base de datos.');
    }
  };

  const handleEliminarCita = async (id) => {
    const seguro = window.confirm("⚠️ ¿Estás seguro de que deseas eliminar esta cita?");
    if (!seguro) return;
    try {
      await apiCitas.delete(id);
      setCitas(prevCitas => prevCitas.filter(cita => String(cita.id) !== String(id)));
      setCitaSeleccionada(null);
    } catch (err) {
      alert('No se pudo eliminar la cita.');
    }
  };

  const handleCrearCitaDesdeFormulario = async (datos) => {
    const infoTratamiento = DURACION_TRATAMIENTOS[datos.tratamiento]; 
    const dummy = new Date(`${datos.fecha}T${datos.hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    const hIniT = datos.hora.slice(0, 5);
    const hFinT = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    
    if (!comprobarDisponibilidad(datos.fecha, hIniT, hFinT, datos.principal)) {
      alert(`❌ Bloqueo por Vacaciones o Conflicto: Horario no disponible para ${datos.principal}.`);
      return false;
    }
    if (datos.asistente !== 'Ninguno' && !comprobarDisponibilidad(datos.fecha, hIniT, hFinT, datos.asistente)) {
      alert(`❌ Bloqueo por Vacaciones o Conflicto: Horario no disponible para el Asistente.`);
      return false;
    }

    const equipo = [datos.principal]; 
    if (datos.asistente !== 'Ninguno') equipo.push(datos.asistente);
    
    const { backgroundColor, title, pacienteLimpio } = calcularMetadatosCita(datos.fecha, hIniT, datos.principal, datos.asistente, datos.tratamiento, finId, datos.paciente);
    
    const nuevaCita = {
      title, start: `${datos.fecha}T${hIniT}:00`, end: `${datos.fecha}T${hFinT}:00`, backgroundColor, estado: 'Pendiente',
      extendedProps: { personalInvolucrado: equipo, tratamientoKey: datos.tratamiento, principal: datos.principal, asistente: datos.asistente, paciente: pacienteLimpio, observaciones: datos.observaciones.trim() }
    };
    
    try {
      const registroInsertado = await apiCitas.insert(nuevaCita);
      setCitas([...citas, { ...registroInsertado, id: String(registroInsertado.id) }]);
      return true;
    } catch (err) { 
      alert('❌ Error en la nube al guardar la cita.'); 
      return false;
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
      <Header 
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        usuarioLogueado={usuarioLogueado}
        onCerrarSesion={handleCerrarSesionReal}
        onAbrirModalPassword={() => setModalPasswordAbierto(true)}
      />

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
                fechaInicial={fechaFijaPrueba}
                personalList={personalList}
                vacaciones={vacaciones}
                onCrearCita={handleCrearCitaDesdeFormulario}
              />
            </div>
            <div className="lg:col-span-3">
              <Calendario
                citas={citas} fechaActual={fechaFijaPrueba} personalList={personalList} 
                comprobarDisponibilidad={(ini, fin, pers, idEx) => {
                  return comprobarDisponibilidad(ini.toISOString().split('T')[0], ini.toTimeString().slice(0, 5), fin.toTimeString().slice(0, 5), pers, idEx);
                }}
                handleActualizarCita={handleActualizarCita} 
                handleEliminarCita={handleEliminarCita}
                citaSeleccionada={citaSeleccionada} setCitaSeleccionada={setCitaSeleccionada}
              />
            </div>
          </div>
        ) : (
          <VistaAdministracion 
            vistaActual={vistaActual}
            citas={citas}
            personalList={personalList}
            vacaciones={vacaciones}
            pacientes={pacientes}
            onAddPersonal={handleAddPersonal}
            onUpdatePersonal={handleUpdatePersonal}
            onDeletePersonal={handleDelPersonal}
            onAddVacacion={handleAddVacacion}
            onDeleteVacacion={handleDelVacacion}
            onAddPaciente={handleAddPaciente}
            onUpdatePaciente={handleUpdatePaciente}
            onDeletePaciente={handleDelPaciente}
            onVolver={() => setVistaActual('calendario')}
          />
        )
      )}

      {modalPasswordAbierto && (
        <CambioPasswordModal 
          usuarioLogueado={usuarioLogueado} 
          onClose={() => setModalPasswordAbierto(false)} 
        />
      )}
    </div>
  );
}

export default App;