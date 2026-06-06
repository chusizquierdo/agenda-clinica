// src/App.jsx
import React, { useState, useEffect } from 'react';
import { DURACION_TRATAMIENTOS, HORARIOS_SALIDA, COLORES_PERSONAL, PERSONAL_CLINICA } from './data/config';
import Formulario from './components/Formulario';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas';
import GestionPersonal from './components/GestionPersonal'; // 👤 NUEVO COMPONENTE
import { BarChart3, ArrowLeft, Users } from 'lucide-react';
import { supabase } from './lib/supabase'; 

function App() {
  const fechaFijaPrueba = new Date().toISOString().split('T')[0]; 

  // Estados de datos
  const [citas, setCitas] = useState([]);
  const [personalList, setPersonalList] = useState([]); // 👥 Listado dinámico de trabajadores
  const [loading, setLoading] = useState(true);

  // Control de navegación: 'calendario', 'estadisticas' o 'personal'
  const [vistaActual, setVistaActual] = useState('calendario');
  
  // Estados de los formularios de citas
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

  // 1. CARGAR DATOS DESDE SUPABASE AL ARRANCAR
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        
        // Carga de Citas
        const { data: dataCitas, error: errorCitas } = await supabase.from('citas').select('*');
        if (errorCitas) throw errorCitas;
        
        const citasFormateadas = (dataCitas || []).map(cita => ({
          ...cita,
          id: String(cita.id)
        }));
        setCitas(citasFormateadas);

        // 👥 MAÑANA CONECTAMOS ESTO: Carga de Personal desde su tabla de Supabase
        // Para que hoy funcione sin romper la app, cargamos un array vacío o el de pruebas por defecto
        setPersonalList([]); 

      } catch (err) {
        console.error('Error al descargar datos de Supabase:', err);
        setError('❌ Error de conexión: No se pudieron sincronizar los datos.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // 👥 MANEJADORES PREPARADOS PARA LA TABLA PERSONAL (MAÑANA ENLAZAMOS CON .from('personal'))
  const handleAddPersonal = async (nuevoTrabajador) => {
    // Generador temporal local para que puedas probar la interfaz hoy mismo
    const localId = Math.floor(Math.random() * 100000);
    const empleadoConId = { ...nuevoTrabajador, id: localId };
    setPersonalList([...personalList, empleadoConId]);
    
    // El código de mañana será:
    // const { data } = await supabase.from('personal').insert([nuevoTrabajador]).select();
  };

  const handleUpdatePersonal = async (id, datosActualizados) => {
    setPersonalList(personalList.map(emp => emp.id === id ? { ...emp, ...datosActualizados } : emp));
    
    // El código de mañana será:
    // await supabase.from('personal').update(datosActualizados).eq('id', id);
  };

  const handleDelPersonal = async (id) => {
    setPersonalList(personalList.filter(emp => emp.id !== id));
    
    // El código de mañana será:
    // await supabase.from('personal').delete().eq('id', id);
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
    const [hLimite, mLimite] = HORARIOS_SALIDA[principal].split(':').map(Number);
    const [hFin, mFin] = horaFinStr.split(':').map(Number);
    if ((hFin * 60 + mFin) > (hLimite * 60 + mLimite)) {
      setAdvertencia(`⚠️ ¡Atención! Termina a las ${horaFinStr}. Supera la salida de la ${principal} (${HORARIOS_SALIDA[principal]}h).`);
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
    const [hLim, mLim] = HORARIOS_SALIDA[pElegido].split(':').map(Number);
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
      const { data, error: insError } = await supabase.from('citas').insert([nuevaCita]).select();
      if (insError) throw insError;
      setCitas([...citas, { ...data[0], id: String(data[0].id) }]);
      setPaciente(''); setObservaciones('');
    } catch (err) { setError('❌ Error en la nube al guardar la cita.'); }
  };

  // Renderizado Condicional de Vistas
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 hide-on-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🩺 Gestor Clínico Pro</h1>
          <p className="text-xs text-slate-500">Arquitectura modular y administración de clínica</p>
        </div>
        
        <div className="flex gap-2">
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
              <Formulario
                fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora}
                tratamiento={tratamiento} setTratamiento={setTratamiento} principal={principal} setPrincipal={setPrincipal}
                asistente={asistente} setAsistente={setAsistente} paciente={paciente} setPaciente={setPaciente}
                observaciones={observaciones} setObservaciones={setObservaciones} error={error} advertencia={advertencia}
                handleCrearCita={handleCrearCita}
              />
            </div>
            <div className="lg:col-span-3">
              <Calendario
                citas={citas} fechaActual={fecha} personalList={PERSONAL_CLINICA}
                comprobarDisponibilidad={(ini, fin, pers, idEx) => {
                  return comprobarDisponibilidad(ini.toISOString().split('T')[0], ini.toTimeString().slice(0, 5), fin.toTimeString().slice(0, 5), pers, idEx);
                }}
                handleActualizarCita={() => {}} handleEliminarCita={() => {}}
                citaSeleccionada={citaSeleccionada} setCitaSeleccionada={setCitaSeleccionada}
              />
            </div>
          </div>
        ) : vistaActual === 'estadisticas' ? (
          <Estadisticas citas={citas} personalList={PERSONAL_CLINICA} />
        ) : (
          /* VISTA ASIGNADA AL NUEVO MÓDULO */
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