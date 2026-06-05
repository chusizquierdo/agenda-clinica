// src/data/config.js

export const DURACION_TRATAMIENTOS = {
  revision: { nombre: 'Revisión General', minutos: 20 },
  limpieza: { nombre: 'Limpieza Dental', minutos: 30 },
  ortodoncia: { nombre: 'Ajuste Ortodoncia', minutos: 45 },
  cirugia: { nombre: 'Cirugía / Implante', minutos: 120 },
};

export const PERSONAL_CLINICA = ['Rut Barrero', 'Miriam Quiñones', 'María'];

// Horarios límite de salida para el aviso visual de sobrepaso
export const HORARIOS_SALIDA = {
  'Rut Barrero': '15:00',
  'Miriam Quiñones': '20:00',
  'María': '18:00'
};

// Colores identificativos por defecto para el personal (cuando no hay sobrepaso)
export const COLORES_PERSONAL = {
  'Rut Barrero': '#3b82f6', // Azul
  'Miriam Quiñones': '#10b981', // Verde
  'María': '#f59e0b'  // Naranja
};