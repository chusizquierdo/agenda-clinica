// src/components/GestionPacientes.jsx
import React, { useState } from 'react';
import { UserPlus, Search, FileText, Trash2, ShieldAlert, CheckCircle2, XCircle, Edit3, Save } from 'lucide-react';

function GestionPacientes({ pacientes = [], onAddPaciente, onUpdatePaciente, onDeletePaciente }) {
  // Estados para el formulario de alta
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [notas, setNotas] = useState('');

  // Filtro de búsqueda local
  const [buscar, setBuscar] = useState('');

  // Estado para la Ficha Modal flotante y su modo edición
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editNotas, setEditNotas] = useState('');

  // 🌟 Estado para Alertas Visuales Internas (Texto verde/rojo de confirmación)
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: '', mensaje: '' });

  const lanzarNotificacion = (tipo, mensaje) => {
    setNotificacion({ mostrar: true, tipo, mensaje });
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: '', mensaje: '' });
    }, 4000); // Se oculta solo a los 4 segundos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      lanzarNotificacion('error', '⚠️ El nombre y el teléfono son campos obligatorios.');
      return;
    }

    try {
      await onAddPaciente({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        dni: dni.trim().toUpperCase(),
        notas: notas.trim()
      });
      
      lanzarNotificacion('exito', '✅ ¡Paciente registrado correctamente en la base de datos!');
      setNombre(''); setApellido(''); setTelefono(''); setDni(''); setNotas('');
    } catch (err) {
      lanzarNotificacion('error', '❌ Error de sincronización: No se pudo registrar al paciente.');
    }
  };

  const handleEliminar = async (id, nombreComp) => {
    const seguro = window.confirm(`⚠️ ¿Estás completamente seguro de que deseas eliminar el expediente de "${nombreComp}"? Esta acción no se puede deshacer.`);
    if (!seguro) return;

    try {
      await onDeletePaciente(id);
      lanzarNotificacion('exito', '🗑️ El expediente del paciente ha sido eliminado correctamente.');
      if (pacienteSeleccionado?.id === id) setPacienteSeleccionado(null);
    } catch (err) {
      lanzarNotificacion('error', '❌ Error: No se pudo eliminar el registro de Supabase.');
    }
  };

  const abrirFicha = (p) => {
    setPacienteSeleccionado(p);
    setModoEdicion(false);
    setEditNombre(p.nombre);
    setEditApellido(p.apellido || '');
    setEditTelefono(p.telefono);
    setEditDni(p.dni || '');
    setEditNotas(p.notas || '');
  };

  const GuardarEdicionFicha = async () => {
    const seguro = window.confirm("¿Deseas guardar los cambios modificados en esta ficha clínica?");
    if (!seguro) return;

    try {
      await onUpdatePaciente(pacienteSeleccionado.id, {
        nombre: editNombre.trim(),
        apellido: editApellido.trim(),
        telefono: editTelefono.trim(),
        dni: editDni.trim().toUpperCase(),
        notas: editNotas.trim()
      });

      lanzarNotificacion('exito', '💾 ¡Ficha clínica editada y guardada correctamente!');
      setPacienteSeleccionado(null);
      setModoEdicion(false);
    } catch (err) {
      lanzarNotificacion('error', '❌ Error: No se pudieron actualizar los datos del paciente.');
    }
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const termino = buscar.toLowerCase();
    const nomCompleto = `${p.nombre} ${p.apellido || ''}`.toLowerCase();
    return nomCompleto.includes(termino) || p.telefono.includes(termino) || (p.dni && p.dni.toLowerCase().includes(termino));
  });

  return (
    <div className="space-y-4">
      
      {/* BANNER DE NOTIFICACIONES (Texto dinámico no invasivo) */}
      {notificacion.mostrar && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-sm transition-all animate-fadeIn ${
          notificacion.tipo === 'exito' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notificacion.tipo === 'exito' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}
          {notificacion.mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA 1: FORMULARIO DE ALTA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserPlus className="text-emerald-600" size={18} />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Registrar Paciente</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombre *</label>
              <input
                type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Carmen"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Apellidos</label>
              <input
                type="text" value={apellido} onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: Santana Ramos"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono *</label>
                <input
                  type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  placeholder="600123456"
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">DNI / NIE</label>
                <input
                  type="text" value={dni} onChange={(e) => setDni(e.target.value)}
                  placeholder="12345678X"
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Historial, Alergias o Notas Clínicas</label>
              <textarea
                value={notas} onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Alérgica a la Penicilina..."
                rows="4"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider"
            >
              Guardar en Base de Datos
            </button>
          </form>
        </div>

        {/* COLUMNA 2 Y 3: LISTADO Y BUSCADOR */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Base de Datos de Pacientes ({pacientes.length})
            </h2>
            
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text" value={buscar} onChange={(e) => setBuscar(e.target.value)}
                placeholder="Buscar por nombre, tel o DNI..."
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {pacientesFiltrados.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No se encontraron registros de pacientes.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <th className="p-3">Paciente</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">DNI / NIE</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {pacientesFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">
                        {p.nombre} {p.apellido}
                        {p.notas && (p.notas.toLowerCase().includes('alerg') || p.notas.toLowerCase().includes('⚠️') || p.notas.toLowerCase().includes('importante')) && (
                          <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px] uppercase animate-pulse">
                            <ShieldAlert size={10} /> Alerta
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{p.telefono}</td>
                      <td className="p-3 font-mono">{p.dni || '-'}</td>
                      <td className="p-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirFicha(p)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-1.5 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                        >
                          <FileText size={14} /> Ficha
                        </button>
                        <button
                          onClick={() => handleEliminar(p.id, `${p.nombre} ${p.apellido || ''}`)}
                          className="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: LA FICHA DEL PACIENTE CON SOPORTE DE EDICIÓN */}
      {pacienteSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="text-emerald-400" size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  {modoEdicion ? 'Modificando Expediente' : 'Ficha Clínica del Paciente'}
                </h3>
              </div>
              <button onClick={() => setPacienteSeleccionado(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              {modoEdicion ? (
                // Vista del formulario de edición dentro de la modal
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Nombre</label>
                      <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Apellidos</label>
                      <input type="text" value={editApellido} onChange={(e) => setEditApellido(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border rounded-lg focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Teléfono</label>
                      <input type="tel" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">DNI</label>
                      <input type="text" value={editDni} onChange={(e) => setEditDni(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border rounded-lg focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Historial y Notas</label>
                    <textarea rows="4" value={editNotas} onChange={(e) => setEditNotas(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border rounded-lg focus:outline-none resize-none" />
                  </div>
                </div>
              ) : (
                // Vista de lectura normal de la modal
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Nombre Completo</p>
                    <p className="text-base font-black text-slate-800 mt-0.5">
                      {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Teléfono Móvil</p>
                      <p className="text-sm font-bold text-slate-700 font-mono mt-0.5">{pacienteSeleccionado.telefono}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">DNI / Identificación</p>
                      <p className="text-sm font-bold text-slate-700 font-mono mt-0.5">{pacienteSeleccionado.dni || 'No registrado'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">📝 Historial Médico y Alergias</p>
                    <div className={`p-4 rounded-xl text-xs leading-relaxed min-h-[100px] whitespace-pre-wrap border ${
                      pacienteSeleccionado.notas ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400 italic'
                    }`}>
                      {pacienteSeleccionado.notas || 'Sin observaciones médicas registradas.'}
                    </div>
                  </div>
                </>
              )}

              {/* BOTONES DE ACCIÓN DE LA MODAL */}
              <div className="flex gap-2 pt-2">
                {modoEdicion ? (
                  <>
                    <button
                      type="button" onClick={GuardarEdicionFicha}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1"
                    >
                      <Save size={14} /> Guardar Cambios
                    </button>
                    <button
                      type="button" onClick={() => setModoEdicion(false)}
                      className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs uppercase"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button" onClick={() => setModoEdicion(true)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1"
                    >
                      <Edit3 size={14} /> Modificar Datos
                    </button>
                    <button
                      type="button" onClick={() => setPacienteSeleccionado(null)}
                      className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase"
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionPacientes;