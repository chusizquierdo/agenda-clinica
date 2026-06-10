// src/components/Estadisticas.jsx
import React, { useState } from 'react';
import { DURACION_TRATAMIENTOS } from '../data/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, Clock, Users, Activity } from 'lucide-react';

function Estadisticas({ citas, personalList }) {
  // Filtro interno para seleccionar el mes ("YYYY-MM")
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7));

  // 1. Filtrar las citas correspondientes al mes seleccionado
  const citasDelMes = citas.filter(cita => cita.start.startsWith(mesFiltro));

  // 2. 🧠 PROCESAMIENTO AVANZADO: Contabilizar roles de Principal y Asistente (Adaptado a Array de Objetos)
  const datosEspecialistas = personalList.map(p => {
    // Reconstruimos el nombre completo idéntico a cómo se guarda en las citas
    const nombreCompleto = `${p.nombre} ${p.apellidos}`.trim();

    // Filtrar cuando es el encargado principal
    const comoPrincipal = citasDelMes.filter(c => c.extendedProps.principal === nombreCompleto);
    // Filtrar cuando acude en calidad de asistente/auxiliar
    const comoAsistente = citasDelMes.filter(c => c.extendedProps.asistente === nombreCompleto);
    
    // Calcular minutos acumulados como Principal
    const minutosPrincipal = comoPrincipal.reduce((acc, c) => {
      const tipo = c.extendedProps.tratamientoKey;
      return acc + (DURACION_TRATAMIENTOS[tipo]?.minutos || 0);
    }, 0);

    // Calcular minutos acumulados como Asistente
    const minutosAsistente = comoAsistente.reduce((acc, c) => {
      const tipo = c.extendedProps.tratamientoKey;
      return acc + (DURACION_TRATAMIENTOS[tipo]?.minutos || 0);
    }, 0);

    return {
      name: nombreCompleto,
      // Métricas de volumen (citas)
      'Citas como Principal': comoPrincipal.length,
      'Citas como Asistente': comoAsistente.length,
      'Total Tratamientos': comoPrincipal.length + comoAsistente.length,
      
      // Métricas de tiempo (horas)
      'Horas como Principal': parseFloat((minutosPrincipal / 60).toFixed(1)),
      'Horas como Asistente': parseFloat((minutosAsistente / 60).toFixed(1)),
      'Total Horas': parseFloat(((minutosPrincipal + minutosAsistente) / 60).toFixed(1))
    };
  });

  // 3. Procesar datos: Distribución de tipos de tratamientos (Se mantiene igual)
  const contadorTratamientos = {};
  citasDelMes.forEach(c => {
    const key = c.extendedProps.tratamientoKey;
    const nombreLegible = DURACION_TRATAMIENTOS[key]?.nombre || 'Revisión';
    contadorTratamientos[nombreLegible] = (contadorTratamientos[nombreLegible] || 0) + 1;
  });

  const datosTratamientos = Object.keys(contadorTratamientos).map(key => ({
    name: key,
    value: contadorTratamientos[key]
  }));

  const COLORES_TARTA = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Sumatorios totales para las tarjetas de arriba
  const totalCitasContadas = citasDelMes.length;
  const totalHorasClinica = datosEspecialistas.reduce((acc, curr) => acc + curr['Total Horas'], 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* BARRA DE FILTRO MENSUAL */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Métricas de Rendimiento Clínico</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Seleccionar Mes:</label>
          <input 
            type="month" 
            value={mesFiltro} 
            onChange={(e) => setMesFiltro(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><CalendarDays size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Citas del Mes</p>
            <p className="text-2xl font-black text-slate-800">{totalCitasContadas}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><Clock size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Horas Clínicas Totales</p>
            <p className="text-2xl font-black text-slate-800">{totalHorasClinica.toFixed(1)}h</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Especialistas Activos</p>
            <p className="text-2xl font-black text-slate-800">
              {datosEspecialistas.filter(e => e['Total Tratamientos'] > 0).length} / {personalList.length}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS APILADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Pacientes por Especialista (Apilado) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">🏆 Volumen de Citas por Especialista</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosEspecialistas} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Citas como Principal" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Citas como Asistente" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Horas en Gabinete (Apilado) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">⏱️ Tiempo Real Dedicado a la Clínica</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosEspecialistas} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip unit=" horas" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Horas como Principal" stackId="b" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Horas como Asistente" stackId="b" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Tipo de Tratamiento */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📊 Demanda por Tipo de Tratamiento</h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            {datosTratamientos.length === 0 ? (
              <p className="text-xs font-medium text-slate-400 italic py-12">No hay citas registradas en este mes para extraer porcentajes.</p>
            ) : (
              <>
                <div className="h-60 w-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={datosTratamientos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                        {datosTratamientos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORES_TARTA[index % COLORES_TARTA.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-2 max-w-sm w-full">
                  {datosTratamientos.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORES_TARTA[index % COLORES_TARTA.length] }} />
                        <span className="font-semibold text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border text-xxs">
                        {item.value} {item.value === 1 ? 'cita' : 'citas'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Estadisticas;