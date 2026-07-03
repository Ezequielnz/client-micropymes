import React, { useState, useEffect } from 'react';
import { saasSubscriptionAPI } from '../utils/api';
import Layout from '../components/Layout';
import {
  Users,
  Gift,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Calendar,
  UserCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

function Referidos() {
  const [loading, setLoading] = useState(true);
  const [referralDetails, setReferralDetails] = useState(null);
  const [referralsList, setReferralsList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load referral details (code, months pending, commission)
      try {
        const details = await saasSubscriptionAPI.getReferralDetails();
        setReferralDetails(details);
      } catch (e) {
        console.warn('Could not load referral details:', e);
      }

      // Load referred users list
      try {
        const list = await saasSubscriptionAPI.getReferrals();
        setReferralsList(list || []);
      } catch (e) {
        console.warn('Could not load referrals list:', e);
      }

    } catch (err) {
      console.error('Error loading referrals data:', err);
      setError('No se pudieron cargar los datos del programa de referidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = () => {
    if (!referralDetails?.referral_code) return;
    const origin = window.location.origin;
    const link = `${origin}/register?ref=${referralDetails.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Activo (Pago)
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Período de Prueba
          </span>
        );
      case 'trial_expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Expirado
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Falta de Pago
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {status || 'Desconocido'}
          </span>
        );
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  if (loading) {
    return (
      <Layout activeSection="referrals">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium animate-pulse">Cargando panel de referidos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeSection="referrals">
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="border-b bg-white border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Referidos</h1>
            <p className="text-slate-500 text-sm mt-1">Sigue el estado de tus referidos y administra tus comisiones y beneficios.</p>
          </div>

          {/* Referral Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-100/80 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tu Código:</span>
              <span className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">{referralDetails?.referral_code || '---'}</span>
            </div>
            <button
              onClick={handleCopyLink}
              disabled={!referralDetails?.referral_code}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Compartir Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Referrals */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Registros Referidos
                </span>
                <span className="text-3xl font-black text-slate-800">
                  {referralsList.length}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* Free Months Pending */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Meses Gratis Pendientes
                </span>
                <span className="text-3xl font-black text-indigo-600">
                  {referralDetails?.free_months_pending ?? 0}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Gift className="h-6 w-6" />
              </div>
            </div>

            {/* Total Commissions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Comisiones Ganadas
                </span>
                <span className="text-3xl font-black text-emerald-600">
                  ${(referralDetails?.total_comision_ganada ?? 0).toLocaleString('es-ES')}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Referrals List / Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Listado de Cuentas Referidas</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {referralsList.length} total
              </span>
            </div>

            {referralsList.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
                  <Share2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-slate-700 mb-1">Aún no tienes referidos</h4>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Comparte tu enlace de referido con otros negocios para obtener meses gratis de suscripción.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/20">
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Fecha de Registro</th>
                      <th className="px-6 py-4">Estado Suscripción</th>
                      <th className="px-6 py-4">Beneficio Aplicado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referralsList.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {ref.nombre} {ref.apellido}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {ref.email}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {formatDate(ref.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(ref.subscription_status)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {ref.subscription_status === 'active' ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <UserCheck className="h-4 w-4" />
                              Mes Gratis Aplicado
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Esperando Primer Pago
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick FAQ / Info */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-blue-900">¿Cómo funciona el programa de referidos?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-800">
                <div>
                  <h5 className="font-bold mb-1">1. Comparte tu código</h5>
                  <p className="opacity-90">
                    Copia tu código o tu enlace único y compártelo con colegas, conocidos o en tus redes sociales.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold mb-1">2. Obtienen 1 mes gratis</h5>
                  <p className="opacity-90">
                    Cualquier pyme que se registre usando tu código recibirá automáticamente 30 días de prueba gratuita.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold mb-1">3. Gana meses gratis</h5>
                  <p className="opacity-90">
                    Cuando tu referido pague su primera suscripción, recibirás 1 mes de servicio gratuito que se aplicará en tu siguiente período.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Referidos;
