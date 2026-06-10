// src/services/api.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const apiCitas = {
  async getAll() {
    const { data, error } = await supabase
      .from('citas')
      .select('*')
      .order('start', { ascending: true });
    if (error) throw error;
    return data;
  },
  async insert(cita) {
    const { data, error } = await supabase
      .from('citas')
      .insert([cita])
      .select();
    if (error) throw error;
    return data[0];
  },
  async update(id, datos) {
    const { data, error } = await supabase
      .from('citas')
      .update(datos)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async delete(id) {
    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const apiPersonal = {
  async getAll() {
    const { data, error } = await supabase
      .from('personal')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data;
  },
  async insert(empleado) {
    const { data, error } = await supabase
      .from('personal')
      .insert([empleado])
      .select();
    if (error) throw error;
    return data[0];
  },
  async update(id, datos) {
    const { data, error } = await supabase
      .from('personal')
      .update(datos)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async delete(id) {
    const { error } = await supabase
      .from('personal')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// CONEXIÓN CON TU TABLA DE PACIENTES (COLUMNAS: apellido, notas)
export const apiPacientes = {
  async getAll() {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data;
  },
  async insert(paciente) {
    const { data, error } = await supabase
      .from('pacientes')
      .insert([paciente])
      .select();
    if (error) throw error;
    return data[0];
  },
  async update(id, datos) {
    const { data, error } = await supabase
      .from('pacientes')
      .update(datos)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async delete(id) {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};