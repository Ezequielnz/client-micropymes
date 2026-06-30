import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saasSubscriptionAPI } from '../utils/api';
import Layout from '../components/Layout';
import { 
  Check, 
  AlertTriangle, 
  CreditCard, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  Clock 
} from 'lucide-react';

function Subscription() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState(null);
  const [referralDetails, setReferralDetails] = useState(null);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralSuccessMsg, setReferralSuccessMsg] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Load status and referral info
  const loadData = async () => {
    try {
      setLoading(true);
      const statusRes = await saasSubscriptionAPI.getStatus();
      setSubStatus(statusRes);
      
      try {
        const refRes = await saasSubscriptionAPI.getReferralDetails();
        setReferralDetails(refRes);
      } catch (e) {
        console.warn('Could not load referral details:', e);
      }
    } catch (err) {
      console.error('Error loading subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidateReferral = async () => {
    if (!referralCodeInput.trim()) return;
    setReferralLoading(true);
    setReferralError('');
    setReferralSuccessMsg('');
    try {
      const res = await saasSubscriptionAPI.validateReferralCode(referralCodeInput.trim());
      if (res.valid) {
        setReferralSuccessMsg(
          `¡Código válido! Referido por: ${res.referrer_name} (1 mes gratis)`
        );
      } else {
        setReferralError('El código no es válido.');
      }
    } catch (err) {
      setReferralError(err.response?.data?.detail || 'Error al validar el código.');
    } finally {
      setReferralLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const referralCode = referralSuccessMsg ? referralCodeInput.trim() : null;
      const res = await saasSubscriptionAPI.createCheckout(referralCode);
      if (res.init_point) {
        window.location.href = res.init_point;
      } else {
        setCheckoutError('No se recibió el enlace de pago de Mercado Pago.');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.detail || 'Error al iniciar la suscripción.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Cargando detalles de suscripción...</p>
        </div>
      </div>
    );
  }

  // Also treat 'trial' with past trial_end as expired (backend may not have updated yet)
  const trialEndDate = subStatus?.trial_end ? new Date(subStatus.trial_end) : null;
  const trialActuallyExpired = subStatus?.subscription_status === 'trial' && trialEndDate && trialEndDate <= new Date();
  const isExpired = trialActuallyExpired || subStatus?.subscription_status === 'trial_expired' || subStatus?.subscription_status === 'cancelled' || subStatus?.subscription_status === 'past_due';
  const isActive = subStatus?.subscription_status === 'active' || subStatus?.is_exempt;
  const isTrial = subStatus?.subscription_status === 'trial' && !isExpired;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  const subscriptionContent = (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upper Status Banner */}
      <div className={`p-4 border rounded-xl flex items-start gap-4 shadow-sm transition-all duration-300 ${
        isActive 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : isTrial 
            ? 'bg-blue-50 border-blue-100 text-blue-800' 
            : 'bg-amber-50 border-amber-100 text-amber-800'
      }`}>
        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
          {isActive ? (
            <Sparkles className="h-5 w-5 text-emerald-600" />
          ) : isTrial ? (
            <Clock className="h-5 w-5 text-blue-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900">
            {isActive 
              ? 'Suscripción Activa' 
              : isTrial 
                ? 'Período de Prueba Activo' 
                : 'Suscripción Requerida'}
          </h2>
          <p className="text-sm mt-0.5 text-gray-600 leading-relaxed">
            {subStatus?.is_exempt 
              ? 'Tu cuenta cuenta con una exención especial de suscripción.'
              : isActive 
                ? '¡Gracias por usar nuestro servicio! Tu cuenta está completamente activa.' 
                : isTrial 
                  ? `Tienes acceso total de prueba hasta el ${formatDate(subStatus?.trial_end)}.` 
                  : 'Tu período de prueba ha expirado. Por favor, selecciona un método de pago para continuar.'}
          </p>
        </div>
        {!isActive && !isTrial && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors self-center flex-shrink-0"
          >
            <LogOut className="h-3.5 w-3.5 text-gray-500" />
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Centered Pricing Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Header */}
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 relative">
            <div className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
              Popular
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">Plan Premium</h3>
            <p className="text-gray-500 text-xs mb-4">Todo lo que necesitas para gestionar tu micro pyme</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">$35.000</span>
              <span className="text-gray-500 text-xs font-medium">/ mes</span>
            </div>
          </div>
          
          <div className="p-6">
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-4">Incluye todas las funcionalidades:</h4>
            <ul className="space-y-3 mb-6">
              {[
                'Ventas POS sin límites y reportes diarios',
                'Control de inventario y stock automatizado',
                'Órdenes de compra y gestión de proveedores',
                'Facturación fiscal integrada',
                'Panel centralizado de finanzas y analítica',
                'Soporte prioritario por WhatsApp'
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-sm">
                  <div className="p-0.5 bg-emerald-50 rounded text-emerald-600 mt-0.5 flex-shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="leading-tight">{feat}</span>
                </li>
              ))}
            </ul>

            {/* Referral input for checkout */}
            {!isActive && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  ¿Tienes un código de referido?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CÓDIGO DE REFERIDO"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    disabled={checkoutLoading || !!referralSuccessMsg}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-gray-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleValidateReferral}
                    disabled={referralLoading || !referralCodeInput || !!referralSuccessMsg}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {referralLoading ? '...' : 'Validar'}
                  </button>
                </div>
                {referralError && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{referralError}</p>
                )}
                {referralSuccessMsg && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">{referralSuccessMsg}</p>
                )}
              </div>
            )}

            {checkoutError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {isActive ? (
              <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600" />
                Suscripción Activa
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-sm"
              >
                {checkoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Suscribirse con Mercado Pago</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isExpired && subStatus && (isActive || isTrial)) {
    // Active/trial users: Show nested inside navigation layout
    return (
      <Layout activeSection="subscription">
        <div className="flex-1 bg-gray-50 min-h-screen">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 md:h-16">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900">Suscripción</h1>
                  <p className="text-xs md:text-sm text-gray-500 truncate w-full">
                    Configuración del plan y programa de referidos de OperixML
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Page Content */}
          <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {subscriptionContent}
          </div>
        </div>
      </Layout>
    );
  }

  // Expired / Standalone mode
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-8">
          <img src="/operix_logo.png" alt="Logo" className="w-12 h-12 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">OperixML</h1>
          <p className="text-gray-500 mt-1 text-sm">Tu plataforma de gestión inteligente de micro pymes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {subscriptionContent}
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-8">
          ¿Necesitas asistencia técnica? Contacta a soporte a través de <a href="mailto:info@operixml.com" className="text-blue-600 hover:underline">info@operixml.com</a>
        </p>
      </div>
    </div>
  );
}

export default Subscription;
