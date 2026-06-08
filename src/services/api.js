// src/services/api.js
import { supabase } from '../lib/supabase'; // Usamos tu ruta original de importación

export const apiCitas = {
  // Descarga las citas respetando el formato plano que tu App.jsx original ya sabe manejar
  async getAll() {
    const { data, error } = await supabase.from('citas').select('*');
    if (error) throw error;
    return (data || []).map(cita => ({
      ...cita,
      id: String(cita.id)
    }));
  },

  // Inserta una cita tal cual la calcula tu manejador
  async insert(nuevaCita) {
    const { data, error } = await supabase.from('citas').insert([nuevaCita]).select();
    if (error) throw error;
    return data[0];
  },

  // Actualiza la cita en base de datos
  async update(id, citaActualizadaEstructura) {
    const { data, error } = await supabase
      .from('citas')
      .update(citaActualizadaEstructura)
      .eq('id', parseInt(id))
      .select();
    if (error) throw error;
    return data[0];
  },

  // Elimina la cita
  async delete(id) {
    const { error } = await supabase.from('citas').delete().eq('id', parseInt(id));
    if (error) throw error;
    return true;
  }
};