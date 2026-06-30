import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, CreditCard, Clock, XCircle } from 'lucide-react';
import { saasSubscriptionAPI } from '../utils/api';

/**
 * SubscriptionBanner
 *
 * Shows a persistent top-banner notification when the user's subscription
 * requires attention (trial expired, payment rejected / past_due, cancelled).
 * Users with active subscriptions or in an active trial see nothing.
 */
const SubscriptionBanner = () => {
  const navigate = useNavigate();
  const [subStatus, setSubStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const data = await saasSubscriptionAPI.getStatus();
        if (!cancelled) setSubStatus(data);
      } catch {
        // Silently fail — don't break the UI if this call fails
      }
    };

    fetchStatus();
    return () => { cancelled = true; };
  }, []);

  if (dismissed || !subStatus) return null;

  const status = subStatus.subscription_status;
  const isExempt = subStatus.is_exempt;

  // Do not show banner for exempt / active users or those on a valid trial
  if (isExempt || status === 'active') return null;

  const trialEndDate = subStatus.trial_end ? new Date(subStatus.trial_end) : null;
  const trialStillValid = status === 'trial' && trialEndDate && trialEndDate > new Date();
  if (trialStillValid) return null;

  // Determine banner variant
  let config = null;

  if (status === 'trial_expired' || (status === 'trial' && trialEndDate && trialEndDate <= new Date())) {
    config = {
      bg: 'bg-amber-50 border-amber-300',
      icon: <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />,
      text: (
        <span className="text-amber-900 text-sm">
          <strong>Período de prueba expirado.</strong> Para continuar usando OperixML activá tu suscripción.
        </span>
      ),
      btnLabel: 'Activar suscripción',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      btnDismissClass: 'hover:bg-amber-200 text-amber-700',
    };
  } else if (status === 'past_due') {
    config = {
      bg: 'bg-red-50 border-red-300',
      icon: <CreditCard className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />,
      text: (
        <span className="text-red-900 text-sm">
          <strong>Pago rechazado.</strong> Tu tarjeta o cuenta de Mercado Pago no pudo ser cobrada. Por favor actualizá tu método de pago.
        </span>
      ),
      btnLabel: 'Actualizar pago',
      btnClass: 'bg-red-600 hover:bg-red-700 text-white',
      btnDismissClass: 'hover:bg-red-200 text-red-700',
    };
  } else if (status === 'cancelled') {
    config = {
      bg: 'bg-gray-100 border-gray-300',
      icon: <XCircle className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />,
      text: (
        <span className="text-gray-800 text-sm">
          <strong>Suscripción cancelada.</strong> Tu acceso está limitado. Podés reactivar tu plan en cualquier momento.
        </span>
      ),
      btnLabel: 'Reactivar plan',
      btnClass: 'bg-gray-800 hover:bg-gray-900 text-white',
      btnDismissClass: 'hover:bg-gray-300 text-gray-600',
    };
  }

  if (!config) return null;

  return (
    <div className={`w-full border-b px-4 py-2.5 flex items-start gap-3 ${config.bg}`} role="alert">
      {config.icon}
      <div className="flex-1 min-w-0">
        {config.text}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/subscription')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${config.btnClass}`}
        >
          {config.btnLabel}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className={`p-1 rounded transition-colors ${config.btnDismissClass ?? 'hover:bg-black/10 text-gray-500'}`}
          aria-label="Cerrar notificación"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
