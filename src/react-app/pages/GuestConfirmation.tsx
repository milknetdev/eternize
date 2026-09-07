import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Check, Users, Loader2, AlertCircle, Utensils, MessageSquare, PartyPopper, Gift, ArrowRight, Baby, User } from 'lucide-react';

// Small age tag used for the guest and each companion — icon instead of an emoji.
function AgeTag({ child }: { child?: boolean | number }) {
  const Icon = child ? Baby : User;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
        child
          ? 'bg-[#FBEEF5] text-[#9D4E7C] border-[#EBD3E1]'
          : 'bg-[#EEF2FB] text-[#4A6099] border-[#D6DEF0]'
      }`}
    >
      <Icon className="w-3 h-3" />
      {child ? 'Criança' : 'Adulto'}
    </span>
  );
}

interface GuestData {
  id: number;
  name: string;
  phoneMask: string | null;
  hasPhone: boolean;
  isConfirmed: boolean;
  confirmedAt: string | null;
  isChild?: boolean;
  rsvpStatus?: string | null;
  dietaryRestrictions?: string | null;
  message?: string | null;
}

interface Companion {
  id: number;
  name: string;
  is_confirmed: number;
  is_child?: number;
}

interface WeddingData {
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  venue_name: string;
  custom_url: string;
  show_gifts: number;
}

type Step = 'loading' | 'verify' | 'confirm' | 'success' | 'declined' | 'error' | 'already_confirmed';

export default function GuestConfirmation() {
  const { code } = useParams<{ code: string }>();
  const [step, setStep] = useState<Step>('loading');
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [error, setError] = useState('');
  
  // Form state
  const [phoneLast4, setPhoneLast4] = useState('');
  const [selectedCompanions, setSelectedCompanions] = useState<number[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGuestInfo();
  }, [code]);

  const fetchGuestInfo = async () => {
    try {
      const res = await fetch(`/api/public/confirm/${code}`);
      if (!res.ok) {
        setStep('error');
        setError('Link de confirmação inválido ou expirado.');
        return;
      }
      const data = await res.json();
      setGuest(data.guest);
      setCompanions(data.companions);
      setWedding(data.wedding);
      
      // Pre-select confirmed companions
      const confirmedIds = data.companions
        .filter((c: Companion) => c.is_confirmed === 1)
        .map((c: Companion) => c.id);
      setSelectedCompanions(confirmedIds);

      // Pre-fill previously saved answers so editing doesn't wipe them
      setDietaryRestrictions(data.guest.dietaryRestrictions || '');
      setMessage(data.guest.message || '');

      if (data.guest.isConfirmed) {
        setStep('already_confirmed');
      } else if (data.guest.rsvpStatus === 'declined') {
        setStep('declined');
      } else {
        setStep(data.guest.hasPhone ? 'verify' : 'confirm');
      }
    } catch {
      setStep('error');
      setError('Erro ao carregar informações. Tente novamente.');
    }
  };

  const handleVerify = async () => {
    if (phoneLast4.length !== 4) {
      setError('Digite os 4 últimos dígitos do seu telefone');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/confirm/${code}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneLast4 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Os últimos 4 dígitos do telefone não conferem');
        return;
      }
      setStep('confirm');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/public/confirm/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneLast4,
          confirmedCompanionIds: selectedCompanions,
          dietaryRestrictions,
          message,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao confirmar presença');
        if (res.status === 401) {
          setStep('verify');
        }
        setSubmitting(false);
        return;
      }
      
      setStep('success');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setSubmitting(false);
  };

  const handleDecline = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/public/confirm/${code}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneLast4, message }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao enviar resposta');
        setSubmitting(false);
        return;
      }
      
      setStep('declined');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setSubmitting(false);
  };

  const toggleCompanion = (id: number) => {
    setSelectedCompanions(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleEditResponse = () => {
    setError('');
    // Re-verify the phone before letting the guest change a saved answer
    setPhoneLast4('');
    setStep(guest?.hasPhone ? 'verify' : 'confirm');
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Data a ser confirmada';
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T12:00:00` : dateStr;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Data a ser confirmada';
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-white to-[#FDF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Loader2 className="w-10 h-10 animate-spin text-[#D4A574] mx-auto mb-4" />
              <p className="text-gray-500">Carregando...</p>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-xl font-serif text-gray-900 mb-2">Link Inválido</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link 
                to="/"
                className="inline-block px-6 py-3 bg-[#D4A574] text-white rounded-full hover:bg-[#C49464] transition-colors"
              >
                Ir para o início
              </Link>
            </motion.div>
          )}

          {step === 'verify' && guest && wedding && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#D4A574]/20"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D4A574] to-[#E8C4A0] p-6 text-center text-white">
                <Heart className="w-10 h-10 mx-auto mb-2 fill-white/30" />
                <h1 className="text-2xl font-serif">
                  {wedding.partner1_name} & {wedding.partner2_name}
                </h1>
                <p className="text-white/80 text-sm mt-1">Confirmação de Presença</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-1">Olá,</p>
                  <p className="text-xl font-serif text-gray-900">{guest.name}</p>
                </div>

                <p className="text-gray-600 text-center text-sm mb-6">
                  Para confirmar sua presença, digite os 4 últimos dígitos do seu telefone cadastrado ({guest.phoneMask})
                </p>

                <div className="mb-6">
                  <input
                    type="text"
                    maxLength={4}
                    value={phoneLast4}
                    onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-full text-center text-3xl tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:border-[#D4A574] focus:ring-0 outline-none transition-colors font-mono"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}

                <button
                  onClick={handleVerify}
                  disabled={submitting || phoneLast4.length !== 4}
                  className="w-full py-3 bg-[#D4A574] text-white rounded-full font-medium hover:bg-[#C49464] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && guest && wedding && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#D4A574]/20"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D4A574] to-[#E8C4A0] p-6 text-white">
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 fill-white/30" />
                  <h1 className="text-xl font-serif">
                    {wedding.partner1_name} & {wedding.partner2_name}
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(wedding.wedding_date)}</span>
                  </div>
                  {wedding.venue_name && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{wedding.venue_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Guest name */}
                <div className="text-center pb-4 border-b">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Convite para</p>
                  <p className="mt-1 text-lg font-serif text-gray-900 flex flex-wrap items-center justify-center gap-2">
                    {guest.name}
                    <AgeTag child={guest.isChild} />
                  </p>
                </div>

                {/* Companions */}
                {companions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-[#D4A574]" />
                      <span className="font-medium text-gray-900">Acompanhantes</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Marque quem vai comparecer. Os nomes que ficarem desmarcados
                      serão registrados como ausentes.
                    </p>
                    <div className="space-y-2">
                      {companions.map((comp) => {
                        const checked = selectedCompanions.includes(comp.id);
                        return (
                          <label
                            key={comp.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              checked
                                ? 'border-[#D4A574] bg-[#D4A574]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCompanion(comp.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              checked ? 'border-[#D4A574] bg-[#D4A574]' : 'border-gray-300'
                            }`}>
                              {checked && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-gray-800 flex flex-wrap items-center gap-2">
                              {comp.name}
                              <AgeTag child={comp.is_child} />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dietary restrictions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="w-4 h-4 text-[#D4A574]" />
                    <span className="text-sm font-medium text-gray-700">Restrições alimentares</span>
                    <span className="text-xs text-gray-400">(opcional)</span>
                  </div>
                  <input
                    type="text"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="Ex.: vegetariano, alergia a amendoim, sem lactose"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#D4A574] focus:ring-0 outline-none text-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-[#D4A574]" />
                    <span className="text-sm font-medium text-gray-700">Mensagem para os noivos</span>
                    <span className="text-xs text-gray-400">(opcional)</span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Deixe uma mensagem especial..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#D4A574] focus:ring-0 outline-none text-sm resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                {/* Actions */}
                <div className="pt-1 space-y-2">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-3 text-sm font-semibold text-white rounded-full bg-[#D4A574] hover:bg-[#C49464] shadow-md shadow-[#D4A574]/25 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Confirmar presença
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={submitting}
                    className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    Não poderei comparecer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && wedding && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-6"
              >
                <PartyPopper className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-serif text-gray-900 mb-2">Presença Confirmada!</h1>
              <p className="text-gray-600 mb-6">
                Obrigado por confirmar! {wedding.partner1_name} & {wedding.partner2_name} estão ansiosos para celebrar com você.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm mb-6">
                <Check className="w-4 h-4" />
                Confirmação registrada
              </div>
              
              {/* Gift List CTA */}
              {wedding.show_gifts !== 0 && wedding.custom_url && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="bg-gradient-to-br from-[#FDF8F5] to-[#F9F0E8] rounded-xl p-6 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4A574]/20 flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-6 h-6 text-[#D4A574]" />
                    </div>
                    <h3 className="font-serif text-lg text-gray-900 mb-2">Que tal presentear os noivos?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Preparamos uma lista especial com muito carinho. Sua presença já é o maior presente, mas se quiser nos presentear...
                    </p>
                    <Link
                      to={`/c/${wedding.custom_url}/presentes`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A574] text-white rounded-full font-medium hover:bg-[#C49464] transition-all hover:scale-105"
                    >
                      <Gift className="w-4 h-4" />
                      Ver Lista de Presentes
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'declined' && wedding && (
            <motion.div
              key="declined"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-serif text-gray-900 mb-2">Resposta Registrada</h1>
              <p className="text-gray-600 mb-4">
                Que pena que não poderá comparecer. {wedding.partner1_name} & {wedding.partner2_name} agradecem por avisar!
              </p>
              <button
                onClick={handleEditResponse}
                className="text-sm font-medium text-[#D4A574] hover:underline"
              >
                Mudou de ideia? Confirmar presença
              </button>
            </motion.div>
          )}

          {step === 'already_confirmed' && guest && wedding && (
            <motion.div
              key="already_confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border border-[#D4A574]/20"
            >
              <div className="w-16 h-16 rounded-full bg-[#D4A574]/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-[#D4A574]" />
              </div>
              <h1 className="text-2xl font-serif text-gray-900 mb-2">Presença já Confirmada</h1>
              <p className="text-gray-600 mb-2">
                Olá, {guest.name}! Sua presença no casamento de {wedding.partner1_name} & {wedding.partner2_name} já foi confirmada.
              </p>
              {guest.confirmedAt && (
                <p className="text-sm text-gray-500 mb-4">
                  Confirmado em {new Date(guest.confirmedAt).toLocaleDateString('pt-BR')}
                </p>
              )}

              <button
                onClick={handleEditResponse}
                className="text-sm font-medium text-[#D4A574] hover:underline mb-2"
              >
                Precisa alterar? Atualizar minha resposta
              </button>

              {/* Gift List CTA */}
              {wedding.show_gifts !== 0 && wedding.custom_url && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="bg-gradient-to-br from-[#FDF8F5] to-[#F9F0E8] rounded-xl p-6">
                    <div className="w-12 h-12 rounded-full bg-[#D4A574]/20 flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-6 h-6 text-[#D4A574]" />
                    </div>
                    <h3 className="font-serif text-lg text-gray-900 mb-2">Que tal presentear os noivos?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Confira nossa lista de presentes especial. Sua presença já é o maior presente, mas se quiser nos presentear...
                    </p>
                    <Link
                      to={`/c/${wedding.custom_url}/presentes`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A574] text-white rounded-full font-medium hover:bg-[#C49464] transition-all hover:scale-105"
                    >
                      <Gift className="w-4 h-4" />
                      Ver Lista de Presentes
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
