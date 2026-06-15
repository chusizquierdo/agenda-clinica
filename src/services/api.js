// src/services/api.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const normalizarCita = (cita) => {
  const copia = { ...cita };
  if ('observaciones' in copia && !copia.notas) {
    copia.notas = copia.observaciones;
    delete copia.observaciones;
  }
  if ('alergias_notas' in copia && !copia.notas) {
    copia.notas = copia.alergias_notas;
    delete copia.alergias_notas;
  }
  return copia;
};

const normalizarPersona = (persona) => {
  if (!persona) return persona;
  const copia = { ...persona };
  
  if ('apellidos' in copia) {
    copia.apellido = copia.apellidos;
    delete copia.apellidos;
  }
  
  if ('role' in copia && !copia.rol) {
    copia.rol = copia.role;
  }
  return copia;
};

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
    const citaNormalizada = normalizarCita(cita);
    const { data, error } = await supabase
      .from('citas')
      .insert([citaNormalizada])
      .select();
    if (error) throw error;
    return data[0];
  },
  async update(id, datos) {
    const datosNormalizados = normalizarCita(datos);
    const { data, error } = await supabase
      .from('citas')
      .update(datosNormalizados)
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
    
    if (error) {
      console.error("❌ [PASO 1 - API] Error crítico al consultar Supabase:", error);
      throw error;
    }
    
    
    const resultadoSaneado = (data || []).map(empleado => normalizarPersona(empleado));
    
    return resultadoSaneado;
  },
  async insert(empleado) {
    const empleadoNormalizado = normalizarPersona(empleado);
    const { data, error } = await supabase
      .from('personal')
      .insert([empleadoNormalizado])
      .select();
    if (error) throw error;
    return normalizarPersona(data[0]);
  },
  async update(id, datos) {
    const datosNormalizados = normalizarPersona(datos);
    const { data, error } = await supabase
      .from('personal')
      .update(datosNormalizados)
      .eq('id', id)
      .select();
    if (error) throw error;
    return normalizarPersona(data[0]);
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

export const apiPacientes = {
  async getPorPagina(pagina = 1, limite = 15) {
    const desde = (pagina - 1) * limite;
    const hasta = desde + limite - 1;
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre', { ascending: true })
      .range(desde, hasta);
    if (error) throw error;
    return (data || []).map(p => normalizarPersona(p));
  },
  async search(termino) {
    if (!termino.trim()) return this.getPorPagina(1, 15);
    const queryTerm = `%${termino.trim()}%`;
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .or(`nombre.ilike.${queryTerm},apellido.ilike.${queryTerm},dni.ilike.${queryTerm},telefono.ilike.${queryTerm}`)
      .order('nombre', { ascending: true })
      .limit(15); 
    if (error) throw error;
    return (data || []).map(p => normalizarPersona(p));
  },
  async insert(paciente) {
    const pacienteNormalizado = normalizarPersona(paciente);
    const { data, error } = await supabase
      .from('pacientes')
      .insert([pacienteNormalizado])
      .select();
    if (error) throw error;
    return normalizarPersona(data[0]);
  },
  async update(id, datos) {
    const datosNormalizados = normalizarPersona(datos);
    const { data, error } = await supabase
      .from('pacientes')
      .update(datosNormalizados)
      .eq('id', id)
      .select();
    if (error) throw error;
    return normalizarPersona(data[0]);
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