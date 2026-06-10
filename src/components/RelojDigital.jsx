// src/components/RelojDigital.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function RelojDigital() {
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const temporizador = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(temporizador);
  }, []);

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatearFechaCorta = (fecha) => {
    const opciones = { weekday: 'short', day: 'numeric', month: 'short' };
    return fecha.toLocaleDateString('es-ES', opciones).replace('.', '');
  };

  return (
    <div className="flex items-center gap-2 text-slate-700 select-none hide-on-print ml-4 pl-4 border-l border-slate-200">
      <Clock size={16} className="text-slate-400" />
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-mono font-bold tracking-md text-slate-800">
          {formatearHora(horaActual)}
        </span>
        <span className="text-xs text-slate-400 font-medium capitalize">
          {formatearFechaCorta(horaActual)}
        </span>
      </div>
    </div>
  );
}

export default RelojDigital;