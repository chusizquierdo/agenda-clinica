// src/services/vacaciones.js
import { supabase } from './api';

export const apiVacaciones = {
  /**
   * Obtiene todos los registros de vacaciones de la clínica
   * @returns {Promise<Array>} Lista de vacaciones
   */
  async getAll() {
    const { data, error } = await supabase
      .from('vacaciones')
      .select('*')
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Registra un nuevo periodo de vacaciones para un empleado
   * @param {object} nuevaVacacion { empleado_id, nombre_empleado, fecha_inicio, fecha_fin, notas }
   * @returns {Promise<object>} Registro insertado
   */
  async insert(nuevaVacacion) {
    const { data, error } = await supabase
      .from('vacaciones')
      .insert([nuevaVacacion])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Elimina un periodo de vacaciones por su ID
   * @param {number|string} id 
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async delete(id) {
    const { error } = await supabase
      .from('vacaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};