import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/local-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import AuthShell, { AuthInput, AuthSubmit } from "@/react-app/components/auth/AuthShell";

export default function LoginPage() {
  const { login, user, isPending } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
    else navigate("/dashboard");
  };

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para continuar organizando seu casamento."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-primary font-medium hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
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
          label="E-mail"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
          autoFocus
        />

        <div>
          <AuthInput
            label="Senha"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
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
          <div className="mt-1.5 text-right">
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>
          <AnimatePresence>
            {showHelp && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-xs text-muted-foreground bg-muted/60 rounded-lg p-2.5 overflow-hidden"
              >
                Ainda não há redefinição automática. Fale com o suporte pela{" "}
                <Link to="/faq" className="text-primary hover:underline">
                  central de ajuda
                </Link>{" "}
                para receber uma senha temporária.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AuthSubmit loading={loading} loadingLabel="Entrando…">Entrar</AuthSubmit>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ao continuar, você concorda com os{" "}
        <Link to="/faq" className="hover:text-primary hover:underline">Termos</Link> e a{" "}
        <Link to="/faq" className="hover:text-primary hover:underline">Política de Privacidade</Link>.
      </p>
    </AuthShell>
  );
}
