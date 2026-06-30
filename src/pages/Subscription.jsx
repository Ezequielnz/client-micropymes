import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';

function Subscription() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState(null);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralSuccessMsg, setReferralSuccessMsg] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const statusRes = await saasSubscriptionAPI.getStatus();
      setSubStatus(statusRes);
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
        setReferralSuccessMsg(`¡Código válido! Referido por: ${res.referrer_name} (1 mes gratis)`);
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

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      await saasSubscriptionAPI.cancelSubscription();
      // Reload status after cancellation
      await loadData();
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err.response?.data?.detail || 'Error al cancelar la suscripción.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const trialEndDate = subStatus?.trial_end ? new Date(subStatus.trial_end) : null;
  const trialActuallyExpired =
    subStatus?.subscription_status === 'trial' && trialEndDate && trialEndDate <= new Date();
  const isExpired =
    trialActuallyExpired ||
    ['trial_expired', 'cancelled'].includes(subStatus?.subscription_status);
  const isPastDue = subStatus?.subscription_status === 'past_due';
  const isActive = subStatus?.subscription_status === 'active' || subStatus?.is_exempt;
  const isTrial = subStatus?.subscription_status === 'trial' && !trialActuallyExpired;
  // Users who need payment action (can still navigate the app but are prompted)
  const needsAction = isExpired || isPastDue;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  // Status banner at top of the subscription card
  const StatusBanner = () => {
    if (subStatus?.is_exempt) {
      return (
        <div className="p-4 border rounded-xl flex items-start gap-4 shadow-sm bg-emerald-50 border-emerald-100 text-emerald-800">
          <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Cuenta Exenta</h2>
            <p className="text-sm mt-0.5 text-gray-600">Tu cuenta tiene acceso especial sin requerir suscripción.</p>
          </div>
        </div>
      );
    }
    if (isActive) {
      return (
        <div className="p-4 border rounded-xl flex items-start gap-4 shadow-sm bg-emerald-50 border-emerald-100 text-emerald-800">
          <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Suscripción Activa</h2>
            <p className="text-sm mt-0.5 text-gray-600">¡Gracias por usar nuestro servicio! Tu cuenta está completamente activa.</p>
          </div>
        </div>
      );
    }
    if (isTrial) {
      return (
        <div className="p-4 border rounded-xl flex items-start gap-4 shadow-sm bg-blue-50 border-blue-100 text-blue-800">
          <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Período de Prueba Activo</h2>
            <p className="text-sm mt-0.5 text-gray-600">
              Tenés acceso total de prueba hasta el <strong>{formatDate(subStatus?.trial_end)}</strong>.
            </p>
          </div>
        </div>
      );
    }
    if (isPastDue) {
      return (
        <div className="p-4 border rounded-xl flex items-start gap-4 shadow-sm bg-red-50 border-red-200">
          <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
            <CreditCard className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Pago Rechazado</h2>
            <p className="text-sm mt-0.5 text-gray-600">
              Tu tarjeta o cuenta de Mercado Pago no pudo ser debitada. Por favor actualizá tu método de pago para continuar.
              Mercado Pago reintentará el cobro automáticamente. Podés también iniciar una nueva suscripción abajo.
            </p>
          </div>
        </div>
      );
    }
    // Expired / cancelled
    return (
      <div className="p-4 border rounded-xl flex items-start gap-4 shadow-sm bg-amber-50 border-amber-100 text-amber-800">
        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">
            {subStatus?.subscription_status === 'cancelled' ? 'Suscripción Cancelada' : 'Suscripción Requerida'}
          </h2>
          <p className="text-sm mt-0.5 text-gray-600">
            {subStatus?.subscription_status === 'cancelled'
              ? 'Tu suscripción fue cancelada. Podés reactivar tu plan en cualquier momento.'
              : 'Tu período de prueba ha expirado. Por favor seleccioná un método de pago para continuar.'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors self-center flex-shrink-0"
        >
          <LogOut className="h-3.5 w-3.5 text-gray-500" />
          Cerrar sesión
        </button>
      </div>
    );
  };

  // Cancel confirmation modal
  const CancelModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Cancelar suscripción</h2>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          ¿Estás seguro que querés cancelar tu suscripción de OperixML?
        </p>
        <ul className="text-sm text-gray-500 space-y-1 mb-5 list-disc list-inside">
          <li>Perderás acceso a todas las funciones premium al vencer el ciclo actual.</li>
          <li>Podés volver a suscribirte en cualquier momento.</li>
          <li>El cobro automático de Mercado Pago quedará detenido.</li>
        </ul>
        {cancelError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {cancelError}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => { setShowCancelConfirm(false); setCancelError(''); }}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Mantener suscripción
          </button>
          <button
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {cancelLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Cancelando...</>
            ) : (
              'Sí, cancelar'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const subscriptionContent = (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Banner */}
      <StatusBanner />

      {/* Pricing Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Header */}
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 relative">
            <div className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
              Popular
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">Plan Premium</h3>
            <p className="text-gray-500 text-xs mb-4">Todo lo que necesitás para gestionar tu micro pyme</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">$35.000</span>
              <span className="text-gray-500 text-xs font-medium">/ mes</span>
            </div>
          </div>

          <div className="p-6">
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-4">
              Incluye todas las funcionalidades:
            </h4>
            <ul className="space-y-3 mb-6">
              {[
                'Ventas POS sin límites y reportes diarios',
                'Control de inventario y stock automatizado',
                'Órdenes de compra y gestión de proveedores',
                'Facturación fiscal integrada',
                'Panel centralizado de finanzas y analítica',
                'Soporte prioritario por WhatsApp',
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-sm">
                  <div className="p-0.5 bg-emerald-50 rounded text-emerald-600 mt-0.5 flex-shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="leading-tight">{feat}</span>
                </li>
              ))}
            </ul>

            {/* Referral input (only for non-active users) */}
            {!isActive && !isPastDue && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  ¿Tenés un código de referido?
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
                {referralError && <p className="text-xs text-red-600 font-semibold mt-2">{referralError}</p>}
                {referralSuccessMsg && <p className="text-xs text-emerald-600 font-semibold mt-2">{referralSuccessMsg}</p>}
              </div>
            )}

            {checkoutError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* CTA Button */}
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
                  <><Loader2 className="h-4 w-4 animate-spin" /><span>Procesando...</span></>
                ) : (
                  <><CreditCard className="h-4 w-4" /><span>Suscribirse con Mercado Pago</span><ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel subscription section (only for active subscribers or past_due — not for expired/cancelled) */}
      {(isActive || isPastDue) && !subStatus?.is_exempt && (
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Darse de baja</h3>
            <p className="text-xs text-gray-500 mb-4">
              Podés cancelar tu suscripción en cualquier momento. El acceso continuará hasta el fin del ciclo de facturación actual.
            </p>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Cancelar suscripción
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const pageContent = (
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
  );

  // Always show inside Layout so users can navigate even when expired
  return (
    <>
      {showCancelConfirm && <CancelModal />}
      <Layout activeSection="subscription">
        {pageContent}
      </Layout>
    </>
  );
}

export default Subscription;
