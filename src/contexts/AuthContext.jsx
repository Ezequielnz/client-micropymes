/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext.jsx — Contexto de autenticación local
 * ====================================================
 * FASE 2: Auth 100% local. Sin Supabase.
 *
 * Flujo de autenticación:
 *  1. Al montar, lee el token de localStorage.
 *  2. Si hay token, lo valida contra GET /auth/me (verifica JWT en el backend).
 *  3. Si el token expiró o es inválido → limpia sesión, redirige a /login.
 *  4. login(token)     → guarda token, carga perfil desde /auth/me, setea user.
 *  5. logout()         → llama POST /auth/logout, limpia localStorage + estado.
 *  6. refreshUser()    → recarga el perfil del usuario desde /auth/me.
 *  7. setupInitialUser(data) → llama POST /auth/setup (primer uso).
 *
 * Valores expuestos por el contexto:
 *  - user               {object|null}  — datos del usuario logueado
 *  - loading            {boolean}      — true mientras verifica el token inicial
 *  - isAuthenticated    {boolean}      — atajo para !!user
 *  - login(token)       {function}     — llama con el access_token del backend
 *  - logout()           {function}
 *  - refreshUser()      {function}
 *  - completeOnboarding() {function}
 *  - setupInitialUser(data) {function}
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI } from '../utils/api';

// ---------------------------------------------------------------------------
// Constantes de localStorage
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'token';
const USER_KEY  = 'user';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function saveSession(token, userData) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (e) {
    console.warn('[AuthContext] No se pudo escribir en localStorage:', e);
  }
}

function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn('[AuthContext] No se pudo limpiar localStorage:', e);
  }
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true mientras verifica el token inicial

  // ── Verificación del token al montar ──────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const token = readToken();

      if (!token) {
        // Sin token → no hay sesión
        setLoading(false);
        return;
      }

      try {
        // Validar el token JWT localmente contra el backend.
        // GET /auth/me devuelve 401 si el token es inválido/expirado.
        const userData = await authAPI.getCurrentUser();
        setUser({ ...userData, access_token: token });
      } catch (error) {
        // Token inválido o expirado → limpiar sesión
        console.warn('[AuthContext] Token inválido al iniciar sesión:', error?.response?.status);
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  /**
   * Inicia la sesión con el access_token devuelto por POST /auth/login.
   * Carga el perfil completo del usuario desde GET /auth/me y guarda en estado.
   *
   * @param {string} token - El access_token recibido del backend.
   * @returns {Promise<object>} Los datos del usuario cargados.
   */
  const login = useCallback(async (token) => {
    // Guardar token primero para que el interceptor de Axios lo adjunte
    localStorage.setItem(TOKEN_KEY, token);

    try {
      const userData = await authAPI.getCurrentUser();
      const userWithToken = { ...userData, access_token: token };
      setUser(userWithToken);
      saveSession(token, userData);
      return userData;
    } catch (error) {
      // Si /auth/me falla después de un login exitoso, limpiar y relanzar
      clearSession();
      setUser(null);
      throw error;
    }
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  /**
   * Cierra la sesión: notifica al backend y limpia el estado local.
   */
  const logout = useCallback(async () => {
    try {
      // Notificar al backend (best-effort, no bloquear si falla)
      await authAPI.logout();
    } catch (error) {
      console.warn('[AuthContext] Error al notificar logout al backend:', error);
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  // ── refreshUser ───────────────────────────────────────────────────────────
  /**
   * Recarga los datos del usuario desde GET /auth/me.
   * Útil después de actualizar el perfil.
   */
  const refreshUser = useCallback(async () => {
    const token = readToken();
    if (!token) return;

    try {
      const userData = await authAPI.getCurrentUser();
      const updated = { ...userData, access_token: token };
      setUser(updated);
      saveSession(token, userData);
      return updated;
    } catch (error) {
      console.error('[AuthContext] Error al refrescar usuario:', error);
      // Si el token ya no es válido, cerrar sesión
      if (error?.response?.status === 401) {
        clearSession();
        setUser(null);
      }
    }
  }, []);

  // ── completeOnboarding ────────────────────────────────────────────────────
  /**
   * Marca el onboarding como completado.
   * Actualiza el estado local sin requerir un endpoint dedicado
   * (el onboarding se completa al guardar la configuración del negocio).
   */
  const completeOnboarding = useCallback(async () => {
    try {
      // Actualizar estado local inmediatamente (optimistic update)
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, onboarding_completed: true };
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Intentar persistir en el backend si el endpoint existe
      const token = readToken();
      if (token) {
        try {
          const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
            .replace(/\/api\/v1$/, '').replace(/\/$/, '') + '/api/v1';
          await fetch(`${API_URL}/auth/complete-onboarding`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch {
          // No bloquear si el endpoint no está disponible todavía
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error en completeOnboarding:', error);
    }
  }, []);

  // ── setupInitialUser ──────────────────────────────────────────────────────
  /**
   * Llama a POST /auth/setup para crear el primer usuario + negocio.
   * Solo funciona si la DB está vacía (sin usuarios).
   *
   * @param {object} setupData
   * @param {string} setupData.nombre_negocio
   * @param {string} setupData.nombre
   * @param {string} setupData.apellido
   * @param {string} setupData.email
   * @param {string} setupData.password
   * @returns {Promise<object>} El token y los datos del usuario creado.
   */
  const setupInitialUser = useCallback(async (setupData) => {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
      .replace(/\/api\/v1$/, '').replace(/\/$/, '') + '/api/v1';

    const response = await fetch(`${API_URL}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setupData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${response.status} en setup`);
    }

    const { access_token } = await response.json();

    // Usar login() para cargar el perfil y setear el estado completo
    return await login(access_token);
  }, [login]);

  // ── Valor del contexto ────────────────────────────────────────────────────

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    completeOnboarding,
    setupInitialUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
