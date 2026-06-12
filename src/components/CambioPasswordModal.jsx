// src/components/CambioPasswordModal.jsx
import React, { useState } from 'react';
import { Key, X, AlertCircle } from 'lucide-react';
import { apiAuth } from '../services/auth';

function CambioPasswordModal({ usuarioLogueado, onClose }) {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [exitoPassword, setExitoPassword] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorPassword('');
    setExitoPassword('');

    if (nuevaPassword.length < 6) {
      return setErrorPassword('⚠️ La contraseña debe tener al menos 6 caracteres.');
    }
    if (nuevaPassword !== confirmarPassword) {
      return setErrorPassword('⚠️ Las contraseñas introducidas no coinciden.');
    }

    try {
      setGuardandoPassword(true);
      await apiAuth.updatePassword(nuevaPassword);
      setExitoPassword('🎉 Contraseña actualizada correctamente.');
      setNuevaPassword('');
      setConfirmarPassword('');
      
      // Esperamos 2 segundos para que el usuario vea el mensaje de éxito antes de cerrar
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setErrorPassword(`❌ Error: ${err.message || 'No se pudo cambiar la contraseña.'}`);
    } finally {
      setGuardandoPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Key size={16} />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Modificar mi Contraseña</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-4">
          Estás modificando el acceso para el usuario activo: <span className="font-semibold text-slate-700">{usuarioLogueado?.email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nueva Contraseña</label>
            <input
              type="password"
              required
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirmar Contraseña</label>
            <input
              type="password"
              required
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {errorPassword && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 text-xs font-medium">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorPassword}</span>
            </div>
          )}

          {exitoPassword && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
              {exitoPassword}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoPassword}
              className="w-1/2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center"
            >
              {guardandoPassword ? 'Actualizando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CambioPasswordModal;