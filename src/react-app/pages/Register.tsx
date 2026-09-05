import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/local-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import AuthShell, { AuthInput } from "@/react-app/components/auth/AuthShell";

const FEATURES = [
  "Site personalizado do casamento",
  "Lista de presentes e PIX",
  "Confirmação de presença online",
  "Galeria colaborativa de fotos",
];

export default function RegisterPage() {
  const { register, user, isPending } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
    else navigate("/dashboard");
  };

  const pwOk = password.length >= 6;

  return (
    <AuthShell
      title="Crie sua conta grátis"
      subtitle="Comece a organizar seu casamento em minutos."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/entrar" className="text-primary font-medium hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        100% gratuito para começar
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 20, x: [0, -6, 6, -4, 4, 0] }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ x: { duration: 0.4 } }}
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Nome completo"
          icon={User}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
          autoFocus
        />
        <AuthInput
          label="E-mail"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
        />
        <div>
          <AuthInput
            label="Senha"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            adornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          {password.length > 0 && (
            <p className={`mt-1.5 text-xs flex items-center gap-1 ${pwOk ? "text-green-600" : "text-muted-foreground"}`}>
              <Check className="w-3.5 h-3.5" /> {pwOk ? "Senha válida" : "Pelo menos 6 caracteres"}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.985 }}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-gold-light shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:brightness-[1.03] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Criando conta…
            </>
          ) : (
            "Criar minha conta"
          )}
        </motion.button>
      </form>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {f}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Ao criar a conta, você concorda com os{" "}
        <Link to="/faq" className="hover:text-primary hover:underline">Termos</Link> e a{" "}
        <Link to="/faq" className="hover:text-primary hover:underline">Política de Privacidade</Link>.
      </p>
    </AuthShell>
  );
}
