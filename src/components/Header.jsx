// src/components/Header.jsx
import React from 'react';
import { BarChart3, ArrowLeft, Users, UserCircle, LogOut, CalendarDays, Key } from 'lucide-react';
import Calculadora from './Calculadora';
import RelojDigital from './RelojDigital';
import logoClinica from '../assets/logo.avif';

function Header({ 
  vistaActual, 
  setVistaActual, 
  usuarioLogueado, 
  onCerrarSesion, 
  onAbrirModalPassword 
}) {
  return (
    <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 hide-on-print">
      <div className="flex items-center gap-3">
        <img src={logoClinica} alt="Logo" className="h-12 w-auto object-contain select-none" />
        <RelojDigital />
      </div>
      
      <div className="flex gap-2 items-center">
        <Calculadora />

        {/* Pastilla de Usuario con botón de Llave */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl text-[11px] font-medium text-slate-600">
          <span className="truncate max-w-[140px]" title={usuarioLogueado?.email}>
            👤 {usuarioLogueado?.email}
          </span>
          <button 
            onClick={onAbrirModalPassword}
            className="p-1 hover:bg-amber-100 hover:text-amber-700 text-slate-400 rounded-lg transition-all ml-1"
            title="Cambiar mi contraseña"
          >
            <Key size={13} />
          </button>
        </div>

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
          onClick={onCerrarSesion}
          className="bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm transition-all"
        >
          <LogOut size={15} /> Salir
        </button>
      </div>
    </header>
  );
}

export default Header;