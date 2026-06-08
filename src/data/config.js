// src/data/config.js

export const DURACION_TRATAMIENTOS = {
  revision: { nombre: 'Revisión General', minutos: 30 },
  limpieza: { nombre: 'Limpieza Bucal', minutos: 45 },
  ortodoncia: { nombre: 'Ajuste Ortodoncia', minutos: 40 },
  implante: { nombre: 'Cirugía de Implante', minutos: 120 },
  endodoncia: { nombre: 'Endodoncia', minutos: 90 }
};

// Dejamos esto como valores por defecto "de respaldo" por si la base de datos tarda en cargar
export const COLORES_DEFECTO = {
  'Dra. García': '#3b82f6',
  'Dr. López': '#10b981',
  'Dra. Martínez': '#f59e0b',
  'Asistente Elena': '#ec4899'
};

export const HORARIOS_DEFECTO = {
  'Dra. García': '18:00',
  'Dr. López': '17:30',
  'Dra. Martínez': '20:00',
  'Asistente Elena': '19:00'
};