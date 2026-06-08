// src/components/GestionPersonal.jsx
import React, { useState } from 'react';
import { UserPlus, Trash2, Mail, Phone, FileText, Clock, Edit2, Check, X } from 'lucide-react';

function GestionPersonal({ personal, onAdd, onUpdate, onDelete, onVolver }) {
  // Estados para el formulario de Alta
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Especialista');
  const [color, setColor] = useState('#3b82f6');
  const [salida, setSalida] = useState('18:00');

  // 🆕 Estados para la Edición en Línea de la Tabla
  const [idEditando, setIdEditando] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRol, setEditRol] = useState('Especialista');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [editSalida, setEditSalida] = useState('18:00');

  // Activar el modo edición rellenando los estados con los valores actuales del empleado
  const activarEdicion = (emp) => {
    setIdEditando(emp.id);
    setEditNombre(emp.nombre || '');
    setEditApellidos(emp.apellidos || '');
    setEditDni(emp.dni || '');
    setEditTelefono(emp.telefono || '');
    setEditEmail(emp.email || '');
    setEditRol(emp.rol || 'Especialista');
    setEditColor(emp.color || '#3b82f6');
    setEditSalida(emp.horario_salida || '18:00');
  };

  // Cancelar la edición limpia
  const cancelarEdicion = () => {
    setIdEditando(null);
  };

  // Guardar cambios mandándolos a la BD a través de onUpdate
  const handleGuardarCambios = (id) => {
    if (!editNombre.trim() || !editDni.trim()) {
      alert("⚠️ El nombre y el DNI son campos obligatorios.");
      return;
    }

    onUpdate(id, {
      nombre: editNombre.trim(),
      apellidos: editApellidos.trim(),
      dni: editDni.trim().toUpperCase(),
      telefono: editTelefono.trim(),
      email: editEmail.trim().toLowerCase(),
      rol: editRol,
      color: editColor,
      horario_salida: editSalida
    });

    setIdEditando(null); // Apagar modo edición tras guardar
  };

  const handleSubmitAlta = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidos.trim() || !dni.trim()) return;

    onAdd({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      dni: dni.trim().toUpperCase(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      rol,
      color,
      horario_salida: salida
    });

    setNombre(''); setApellidos(''); setDni(''); setTelefono(''); setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN SUPERIOR: FORMULARIO DE ALTA */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
          <UserPlus size={16} className="text-blue-500" /> Contratación / Alta de Personal de Clínica
        </h2>

        <form onSubmit={handleSubmitAlta} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Nombre</label>
            <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Laura" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Apellidos</label>
            <input type="text" required value={apellidos} onChange={e => setApellidos(e.target.value)} placeholder="Ej: Martínez López" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">DNI / NIE</label>
            <input type="text" required value={dni} onChange={e => setDni(e.target.value)} placeholder="Ej: 12345678Z" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Teléfono</label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 600123456" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ej: laura@clinica.com" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Rol / Puesto</label>
            <select value={rol} onChange={e => setRol(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium">
              <option value="Especialista">Especialista (Odontólogo)</option>
              <option value="Asistente">Asistente de Gabinete</option>
              <option value="Higienista">Higienista Bucodental</option>
              <option value="Recepcionista">Recepcionista</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Color Citas</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer p-0.5" />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Hora Salida</label>
              <input type="time" value={salida} onChange={e => setSalida(e.target.value)} className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm uppercase tracking-wider transition-all">
            Registrar Alta
          </button>
        </form>
      </div>

      {/* SECCIÓN INFERIOR: TABLA DE PERSONAL ACTIVO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700">👥 Plantilla de Personal Activa ({personal.length})</h3>
        </div>
        
        {personal.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No hay trabajadores registrados en la base de datos de Supabase.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3" style={{ width: '25%' }}>Empleado</th>
                  <th className="p-3" style={{ width: '15%' }}>Identificación Legal</th>
                  <th className="p-3" style={{ width: '20%' }}>Contacto</th>
                  <th className="p-3" style={{ width: '15%' }}>Rol / Cargo</th>
                  <th className="p-3" style={{ width: '13%' }}>Configuración Horario</th>
                  <th className="p-3 text-center" style={{ width: '12%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {personal.map((emp) => {
                  const estaEditando = idEditando === emp.id;

                  return (
                    <tr key={emp.id} className={`transition-all ${estaEditando ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}>
                      
                      {/* COLUMNA: EMPLEADO (NOMBRE, APELLIDOS Y COLOR) */}
                      <td className="p-3 font-semibold text-slate-800">
                        {estaEditando ? (
                          <div className="flex items-center gap-2">
                            <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border shrink-0" />
                            <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-1/2 p-1 border rounded bg-white" placeholder="Nombre" />
                            <input type="text" value={editApellidos} onChange={e => setEditApellidos(e.target.value)} className="w-1/2 p-1 border rounded bg-white" placeholder="Apellidos" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full block border shadow-sm shrink-0" style={{ backgroundColor: emp.color }} />
                            {emp.nombre} {emp.apellidos}
                          </div>
                        )}
                      </td>

                      {/* COLUMNA: DNI */}
                      <td className="p-3 font-mono text-slate-500">
                        {estaEditando ? (
                          <input type="text" value={editDni} onChange={e => setEditDni(e.target.value)} className="w-full p-1 border rounded bg-white font-mono" />
                        ) : (
                          <div className="flex items-center gap-1.5"><FileText size={13}/> {emp.dni}</div>
                        )}
                      </td>

                      {/* COLUMNA: CONTACTO (TELÉFONO Y EMAIL) */}
                      <td className="p-3 space-y-1">
                        {estaEditando ? (
                          <div className="space-y-1">
                            <input type="tel" value={editTelefono} onChange={e => setEditTelefono(e.target.value)} className="w-full p-1 border rounded bg-white" placeholder="Teléfono" />
                            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full p-1 border rounded bg-white text-xs" placeholder="Email" />
                          </div>
                        ) : (
                          <>
                            {emp.telefono && <div className="flex items-center gap-1.5 text-slate-600"><Phone size={13} className="text-slate-400"/> {emp.telefono}</div>}
                            {emp.email && <div className="flex items-center gap-1.5 text-slate-500 lowercase"><Mail size={13} className="text-slate-400"/> {emp.email}</div>}
                          </>
                        )}
                      </td>

                      {/* COLUMNA: ROL */}
                      <td className="p-3">
                        {estaEditando ? (
                          <select value={editRol} onChange={e => setEditRol(e.target.value)} className="w-full p-1 border rounded bg-white text-xs font-medium">
                            <option value="Especialista">Especialista</option>
                            <option value="Asistente">Asistente</option>
                            <option value="Higienista">Higienista</option>
                            <option value="Recepcionista">Recepcionista</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            emp.rol === 'Especialista' || emp.rol === 'Odontólogo' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {emp.rol}
                          </span>
                        )}
                      </td>

                      {/* COLUMNA: HORARIO */}
                      <td className="p-3">
                        {estaEditando ? (
                          <input type="time" value={editSalida} onChange={e => setEditSalida(e.target.value)} className="w-full p-1 border rounded bg-white" />
                        ) : (
                          <div className="flex items-center gap-1 text-slate-600"><Clock size={13} className="text-slate-400" /> Cierre: {emp.horario_salida}h</div>
                        )}
                      </td>

                      {/* COLUMNA DE ACCIONES DINÁMICA */}
                      <td className="p-3 text-center">
                        {estaEditando ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleGuardarCambios(emp.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Guardar cambios en base de datos"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                              title="Cancelar edición"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => activarEdicion(emp)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                              title="Editar campos"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => onDelete(emp.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Dar de baja / archivar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionPersonal;