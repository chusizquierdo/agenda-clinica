// src/components/GestionPersonal.jsx
import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, X, Check, ArrowLeft, Mail, Phone, Clock } from 'lucide-react';

function GestionPersonal({ personal, onAdd, onUpdate, onDelete, onVolver }) {
  // Estados para el formulario de Añadir / Editar
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rol, setRol] = useState('Doctora');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [horaSalida, setHoraSalida] = useState('14:00');
  const [color, setColor] = useState('#3b82f6');
  
  // Modos de edición y eliminación
  const [editandoId, setEditandoId] = useState(null);
  const [confirmarBorrarId, setConfirmarBorrarId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;

    const datosTrabajador = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rol,
      email: email.trim(),
      telefono: telefono.trim(),
      hora_salida: horaSalida,
      color
    };

    if (editandoId) {
      onUpdate(editandoId, datosTrabajador);
      setEditandoId(null);
    } else {
      onAdd(datosTrabajador);
    }

    // Resetear formulario
    setNombre(''); setApellido(''); setRol('Doctora');
    setEmail(''); setTelefono(''); setHoraSalida('14:00'); setColor('#3b82f6');
  };

  const activarEdicion = (trabajador) => {
    setEditandoId(trabajador.id);
    setNombre(trabajador.nombre);
    setApellido(trabajador.apellido);
    setRol(trabajador.rol);
    setEmail(trabajador.email || '');
    setTelefono(trabajador.telefono || '');
    setHoraSalida(trabajador.hora_salida || '14:00');
    setColor(trabajador.color || '#3b82f6');
  };

  return (
    <div className="bg-slate-50 min-h-screen p-2 animate-fadeIn">
      {/* Botón Volver */}
      <button 
        onClick={onVolver}
        className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
      >
        <ArrowLeft size={14} /> Volver a la Agenda
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FORMULARIO DE ALTA / EDICIÓN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            {editandoId ? '📝 Editar Trabajador' : '👤 Añadir Nuevo Personal'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Nombre *</label>
                <input 
                  type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Apellido *</label>
                <input 
                  type="text" required value={apellido} onChange={e => setApellido(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Especialidad / Rol</label>
              <select 
                value={rol} onChange={e => setRol(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Doctor">Doctor</option>
                <option value="Doctora">Doctora</option>
                <option value="Enfermero">Enfermero</option>
                <option value="Enfermera">Enfermera</option>
                <option value="Recepción">Recepción</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Teléfono</label>
                <input 
                  type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Hora Salida (Aviso)</label>
                <input 
                  type="time" value={horaSalida} onChange={e => setHoraSalida(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Correo Electrónico</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Color Identificativo en Agenda</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-10 h-8 rounded border border-slate-200 cursor-pointer bg-transparent"
                />
                <span className="text-slate-400 font-mono text-[10px]">{color.toUpperCase()}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all shadow-sm"
              >
                {editandoId ? 'Guardar Cambios' : 'Registrar Empleado'}
              </button>
              {editandoId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditandoId(null);
                    setNombre(''); setApellido(''); setRol('Doctora'); setEmail(''); setTelefono(''); setHoraSalida('14:00'); setColor('#3b82f6');
                  }}
                  className="bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl hover:bg-slate-300 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA DE PERSONAL EXISTENTE */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h2 className="text-sm font-bold text-slate-800 mb-4">👥 Plantilla de la Clínica</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2">Personal</th>
                  <th className="pb-2">Rol</th>
                  <th className="pb-2">Contacto</th>
                  <th className="pb-2">Horario</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {personal.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No hay personal registrado en la base de datos todavía.</td>
                  </tr>
                ) : (
                  personal.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: emp.color }} />
                        {emp.nombre} {emp.apellido}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {emp.rol}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 space-y-0.5">
                        {emp.telefono && <p className="flex items-center gap-1"><Phone size={10}/> {emp.telefono}</p>}
                        {emp.email && <p className="flex items-center gap-1 text-[10px] text-slate-400"><Mail size={10}/> {emp.email}</p>}
                      </td>
                      <td className="py-3 text-slate-600 font-medium flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {emp.hora_salida || '14:00'}h
                      </td>
                      <td className="py-3 text-right">
                        {confirmarBorrarId === emp.id ? (
                          <div className="flex items-center justify-end gap-1 bg-red-50 p-1 rounded-lg border border-red-200 inline-flex animate-bounce">
                            <span className="text-[10px] text-red-700 px-1 font-medium">¿Seguro?</span>
                            <button 
                              onClick={() => { onDelete(emp.id); setConfirmarBorrarId(null); }}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                              <Check size={12} />
                            </button>
                            <button 
                              onClick={() => setConfirmarBorrarId(null)}
                              className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => activarEdicion(emp)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-lg transition-all"
                              title="Editar datos"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => setConfirmarBorrarId(emp.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                              title="Eliminar empleado"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default GestionPersonal;