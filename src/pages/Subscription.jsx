import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saasSubscriptionAPI } from '../utils/api';
import Layout from '../components/Layout';
import { 
  Check, 
  AlertTriangle, 
  CreditCard, 
  Users, 
  Share2, 
  Copy, 
  LogOut, 
  ArrowRight, 
  Lock, 
  Gift, 
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = () => {
    if (!referralDetails?.referral_code) return;
    const origin = window.location.origin;
    const link = `${origin}/register?ref=${referralDetails.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando detalles de suscripción...</p>
        </div>
      </div>
    );
  }

  const isExpired = subStatus?.subscription_status === 'trial_expired' || subStatus?.subscription_status === 'cancelled' || subStatus?.subscription_status === 'past_due';
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Upper Status Banner */}
      <div className={`mb-8 p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isActive 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : isTrial 
            ? 'bg-blue-50 border-blue-200 text-blue-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            isActive ? 'bg-emerald-100' : isTrial ? 'bg-blue-100' : 'bg-amber-100'
          }`}>
            {isActive ? (
              <Sparkles className={`h-6 w-6 ${isActive ? 'text-emerald-700' : 'text-amber-700'}`} />
            ) : isTrial ? (
              <Clock className="h-6 w-6 text-blue-700" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isActive 
                ? 'Suscripción Activa' 
                : isTrial 
                  ? 'Período de Prueba Activo' 
                  : 'Suscripción Requerida'}
            </h2>
            <p className="text-sm mt-1 opacity-90">
              {subStatus?.is_exempt 
                ? 'Tu cuenta cuenta con una exención especial de suscripción.'
                : isActive 
                  ? '¡Gracias por usar nuestro servicio! Tu cuenta está completamente activa.' 
                  : isTrial 
                    ? `Tienes acceso total de prueba hasta el ${formatDate(subStatus?.trial_end)}.` 
                    : 'Tu período de prueba ha expirado. Por favor, selecciona un método de pago para continuar.'}
            </p>
          </div>
        </div>
        {!isActive && !isTrial && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Centered Pricing Card */}
      <div className="max-w-md mx-auto">
        
        {/* Pricing Plan */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-8 bg-slate-900 text-white relative">
            <div className="absolute top-4 right-4 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Plan Premium</h3>
            <p className="text-slate-400 text-sm mb-6">Todo lo que necesitas para gestionar tu micro pyme</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight">$35.000</span>
              <span className="text-slate-400 text-lg">/ mes</span>
            </div>
          </div>
          
          <div className="p-8">
            <h4 className="font-bold text-slate-800 mb-4">Incluye todas las funcionalidades:</h4>
            <ul className="space-y-4 mb-8">
              {[
                'Ventas POS sin límites y reportes diarios',
                'Control de inventario y stock automatizado',
                'Órdenes de compra y gestión de proveedores',
                'Facturación fiscal integrada',
                'Panel centralizado de finanzas y analítica',
                'Soporte prioritario por WhatsApp'
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            {/* Referral input for checkout */}
            {!isActive && (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ¿Tienes un código de referido?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de referido"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    disabled={checkoutLoading || !!referralSuccessMsg}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleValidateReferral}
                    disabled={referralLoading || !referralCodeInput || !!referralSuccessMsg}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {referralLoading ? '...' : 'Validar'}
                  </button>
                </div>
                {referralError && (
                  <p className="text-xs text-rose-600 font-semibold mt-2">{referralError}</p>
                )}
                {referralSuccessMsg && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">{referralSuccessMsg}</p>
                )}
              </div>
            )}

            {checkoutError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {isActive ? (
              <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold py-3 px-4 rounded-2xl text-center flex items-center justify-center gap-2">
                <Check className="h-5 w-5" />
                Suscripción Activa
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {checkoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Suscribirse con Mercado Pago</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isExpired && subStatus) {
    // Active/trial users: Show nested inside navigation layout
    return (
      <Layout activeSection="subscription">
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white border-slate-200 px-8 py-6">
            <h1 className="text-3xl font-black text-slate-900">Gestión de Suscripción</h1>
            <p className="text-slate-500 text-sm mt-1">Configuración del plan y programa de referidos de OperixML.</p>
          </div>
          {subscriptionContent}
        </div>
      </Layout>
    );
  }

  // Expired / Standalone mode
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10">
        <div className="text-center mb-8">
          <img src="/operix_logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">OperixML</h1>
          <p className="text-slate-400 mt-2 text-lg">Tu plataforma de gestión inteligente de micro pymes</p>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800">
          {subscriptionContent}
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          ¿Necesitas asistencia técnica? Contacta a soporte a través de info@operixml.com
        </p>
      </div>
    </div>
  );
}

export default Subscription;
