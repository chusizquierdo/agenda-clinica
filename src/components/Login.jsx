// src/components/Login.jsx
import React, { useState } from 'react';
import { apiAuth } from '../services/auth';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import logoClinica from '../assets/logo.avif';

function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    if (!email.trim() || !password) {
      setErrorLogin('⚠️ Por favor, rellena todos los campos.');
      return;
    }

    try {
      setCargando(true);
      // Llamada a nuestro servicio modular de autenticación
      const usuario = await apiAuth.login(email, password);
      if (usuario) {
        onLoginExitoso(usuario);
      }
    } catch (err) {
      setErrorLogin(err.message || '❌ Error al intentar conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl backdrop-blur-md space-y-6 animate-fadeIn">
        
        {/* LOGO Y CABECERA CORPORATIVA */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoClinica} 
              alt="Logo Clínica Estética" 
              className="h-20 w-auto object-contain filter drop-shadow-md"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-white font-bold text-base tracking-wide uppercase flex items-center justify-center gap-1.5">
              <ShieldCheck className="text-blue-400" size={18} /> Panel Clínico Privado
            </h2>
            <p className="text-slate-400 text-[11px]">Acceso restringido para el personal médico autorizado.</p>
          </div>
        </div>

        {/* MENSAJE DE ERROR (SI FALLA LA CONTRASEÑA) */}
        {errorLogin && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold text-left leading-relaxed animate-fadeIn">
            {errorLogin}
          </div>
        )}

        {/* FORMULARIO DE ACCESO REAL */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={14} />
              <input
                type="email"
                disabled={cargando}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@clinica.com"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={14} />
              <input
                type="password"
                disabled={cargando}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-wider"
            >
              {cargando ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verificando Credenciales...
                </>
              ) : (
                'Iniciar Sesión Seguro'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Login;