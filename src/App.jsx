// src/App.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS } from './data/config'; 
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas';
import GestionPersonal from './components/GestionPersonal'; 
import Calculadora from './components/Calculadora'; 
import { BarChart3, ArrowLeft, Users } from 'lucide-react';
import { apiCitas } from './services/api'; 

// 🎨 CONFIGURACIÓN DE COLORES REALES DE TU PERSONAL
const COLORES_PERSONAL = {
  'Rut Barrero': '#3b82f6',     
  'Miriam Quiñones': '#ef4444',  
  'María': '#10b981',            
  'Ninguno': '#64748b'
};

// ⏰ HORARIOS DE SALIDA REALES
const HORARIOS_SALIDA = {
  'Rut Barrero': '18:00',
  'Miriam Quiñones': '18:00',
  'María': '18:00',
  'Ninguno': '23:59'
};

// 👥 🌟 ESTRUCTURA INTEGRAL REQUERIDA POR TU FORMULARIO Y CALENDARIO
const PERSONAL_INICIAL_OBJ = [
  { id: 1, nombre: 'Rut', apellidos: 'Barrero', rol: 'Especialista', color: '#3b82f6' },
  { id: 2, nombre: 'Miriam', apellidos: 'Quiñones', rol: 'Especialista', color: '#ef4444' },
  { id: 3, nombre: 'María', apellidos: '', rol: 'Asistente', color: '#10b981' } // María actúa de asistente
];

function App() {
  const fechaFijaPrueba = new Date().toISOString().split('T')[0]; 

  // Estados de la aplicación
  const [citas, setCitas] = useState([]);
  const [personalList, setPersonalList] = useState(PERSONAL_INICIAL_OBJ); 
  const [loading, setLoading] = useState(true);

  // Control de navigation
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

  // 1. CARGAR DATOS DESDE SUPABASE
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const citasFormateadas = await apiCitas.getAll();
        setCitas(citasFormateadas);
      } catch (err) {
        console.error('Error al descargar datos de la API:', err);
        setError('❌ Error de conexión: No se pudieron sincronizar los datos.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // MANEJADORES DE LA TABLA PERSONAL
  const handleAddPersonal = async (nuevoTrabajador) => {
    const localId = Math.floor(Math.random() * 100000);
    const empleadoConId = { ...nuevoTrabajador, id: localId };
    setPersonalList([...personalList, empleadoConId]);
  };

  const handleUpdatePersonal = async (id, datosActualizados) => {
    setPersonalList(personalList.map(emp => emp.id === id ? { ...emp, ...datosActualizados } : emp));
  };

  const handleDelPersonal = async (id) => {
    setPersonalList(personalList.filter(emp => emp.id !== id));
  };

  // MANEJADORES DE CITAS (CONECTADO A LA API)
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
      nuevoPrincipal,
      nuevoAsistente,
      nuevoTratamientoKey,
      dummyFinObj,
      nuevoPaciente
    );

    const citaActualizadaEstructura = {
      title,
      start: nuevoStart,
      end: nuevoEnd,
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

    try {
      const registroActualizado = await apiCitas.update(id, citaActualizadaEstructura);
      setCitas(citas.map(cita => cita.id === id ? { ...registroActualizado, id: String(registroActualizado.id) } : cita));
      setCitaSeleccionada(null);
    } catch (err) {
      console.error('Error al actualizar mediante API:', err);
      alert('No se pudieron guardar los cambios: ' + (err.message || ''));
    }
  };

  const handleEliminarCita = async (id) => {
    const seguro = window.confirm("⚠️ ¿Estás seguro de que deseas eliminar esta cita de forma permanente? Esta acción no se puede deshacer.");
    if (!seguro) return;

    try {
      await apiCitas.delete(id);
      setCitas(citas.filter(cita => cita.id !== id));
      setCitaSeleccionada(null);
    } catch (err) {
      console.error('Error al borrar mediante API:', err);
      alert('No se pudo eliminar la cita: ' + (err.message || ''));
    }
  };

  // LOGICA DE VALIDACIONES DE DISPONIBILIDAD
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
    
    const limiteSalida = HORARIOS_SALIDA[principal] || '18:00';
    const [hLimite, mLimite] = limiteSalida.split(':').map(Number);
    const [hFin, mFin] = horaFinStr.split(':').map(Number);
    
    if ((hFin * 60 + mFin) > (hLimite * 60 + mLimite)) {
      setAdvertencia(`⚠️ ¡Atención! Termina a las ${horaFinStr}. Supera la salida de la ${principal} (${limiteSalida}h).`);
    }
  }, [hora, tratamiento, principal, fecha]);

  const comprobarDisponibilidad = (fNueva, hIniNueva, hFinNueva, pers, idEx = null) => {
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

  const calcularMetadatosCita = (pElegido, aElegido, tKey, finId, nomPaciente) => {
    const infoTratamiento = DURACION_TRATAMIENTOS[tKey];
    const hFinT = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    
    const limiteSalida = HORARIOS_SALIDA[pElegido] || '18:00';
    const [hLim, mLim] = limiteSalida.split(':').map(Number);
    const [hFin, mFin] = hFinT.split(':').map(Number);
    
    let backgroundColor = (hFin * 60 + mFin) > (hLim * 60 + mLim) ? '#ef4444' : (COLORES_PERSONAL[pElegido] || '#64748b');
    let title = (hFin * 60 + mFin) > (hLim * 60 + mLim) ? `⚠️ SOBREPASADO (${hFinT}) - 👤 ${nomPaciente}` : `👤 ${nomPaciente} - ${infoTratamiento.nombre}`;
    return { backgroundColor, title, pacienteLimpio: nomPaciente.trim() || "Paciente Anónimo" };
  };

  const handleCrearCita = async (e) => {
    e.preventDefault();
    setError('');
    if (!principal) return setError('⚠️ Error: Selecciona Especialista Principal.');
    const infoTratamiento = DURACION_TRATAMIENTOS[tratamiento]; 
    const dummy = new Date(`${fecha}T${hora}:00`);
    const finId = new Date(dummy.getTime() + infoTratamiento.minutos * 60000);
    const hIniT = hora.slice(0, 5);
    const hFinT = `${String(finId.getHours()).padStart(2, '0')}:${String(finId.getMinutes()).padStart(2, '0')}`;
    if (!comprobarDisponibilidad(fecha, hIniT, hFinT, principal)) return setError(`❌ Conflicto: ${principal} ocupada.`);
    if (asistente !== 'Ninguno' && !comprobarDisponibilidad(fecha, hIniT, hFinT, asistente)) return setError(`❌ Conflicto: Asistente ocupado.`);
    const equipo = [principal]; if (asistente !== 'Ninguno') equipo.push(asistente);
    const { backgroundColor, title, pacienteLimpio } = calcularMetadatosCita(principal, asistente, tratamiento, finId, paciente);
    const nuevaCita = {
      title, start: `${fecha}T${hIniT}:00`, end: `${fecha}T${hFinT}:00`, backgroundColor, estado: 'Pendiente',
      extendedProps: { personalInvolucrado: equipo, tratamientoKey: tratamiento, principal, asistente, paciente: pacienteLimpio, observaciones: observaciones.trim() }
    };
    try {
      const registroInsertado = await apiCitas.insert(nuevaCita);
      setCitas([...citas, { ...registroInsertado, id: String(registroInsertado.id) }]);
      setPaciente(''); setObservaciones('');
    } catch (err) { setError('❌ Error en la nube al guardar la cita.'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 hide-on-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🩺 Clínica Vecindario</h1>
          <p className="text-xs text-slate-500">Arquitectura modular y administración de clínica</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Calculadora />

          {vistaActual === 'calendario' ? (
            <>
              <button
                onClick={() => setVistaActual('personal')}
                className="bg-white text-slate-700 hover:bg-slate-50 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border border-slate-200 shadow-sm transition-all"
              >
                <Users size={16} className="text-blue-500" /> 👥 Configurar Personal
              </button>
              <button
                onClick={() => setVistaActual('estadisticas')}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
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
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-500 text-xs">Sincronizando la clínica...</p>
        </div>
      ) : (
        vistaActual === 'calendario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1 hide-on-print">
              {/* 🌟 ENLAZADO PERFECTO: Pasamos 'personalList' con la estructura interna exacta que el Formulario filtra */}
              <Formulario
                fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora}
                tratamiento={tratamiento} setTratamiento={setTratamiento} principal={principal} setPrincipal={setPrincipal}
                asistente={asistente} setAsistente={setAsistente} paciente={paciente} setPaciente={setPaciente}
                observaciones={observaciones} setObservaciones={setObservaciones} error={error} advertencia={advertencia}
                handleCrearCita={handleCrearCita} personalList={personalList} 
              />
            </div>
            <div className="lg:col-span-3">
              {/* 🌟 FILTROS SIN UNDEFINED: Pasamos el mismo objeto para que renderice los nombres completos limpios */}
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
        ) : (
          <GestionPersonal 
            personal={personalList}
            onAdd={handleAddPersonal}
            onUpdate={handleUpdatePersonal}
            onDelete={handleDelPersonal}
            onVolver={() => setVistaActual('calendario')}
          />
        )
      )}
    </div>
  );
}

export default App;