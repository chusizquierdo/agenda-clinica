// src/services/auth.js
import { supabase } from './api';

export const apiAuth = {
  /**
   * Inicia sesión con correo electrónico y contraseña en Supabase Auth
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>} Datos del usuario autenticado
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      // Personalizamos los errores para que sean claros y amigables en recepción
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('El correo electrónico o la contraseña son incorrectos.');
      }
      throw error;
    }

    return data.user;
  },

  /**
   * Cierra la sesión activa en Supabase y destruye los tokens de seguridad del navegador
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  /**
   * Obtiene los datos del usuario conectado actualmente (si existe sesión)
   * @returns {Promise<object|null>} Datos del usuario o null si no hay nadie dentro
   */
  async getUsuarioActual() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  /**
   * Escucha en tiempo real si el usuario inicia o cierra sesión
   * @param {function} callback Función que reacciona al cambio de estado
   */
  onEstadoSesionCambia(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return subscription;
  }
};