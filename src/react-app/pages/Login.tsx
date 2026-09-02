import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/local-auth/react";
import { Heart, ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

export default function LoginPage() {
  const { login, user, isPending } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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

    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-blush/20 to-champagne flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=1600&fit=crop"
          alt="Casamento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-serif text-4xl font-medium mb-4">
            Organize o casamento dos seus sonhos
          </h2>
          <p className="text-white/80">
            Junte-se a milhares de casais que já criaram sites incríveis e
            organizaram casamentos inesquecíveis.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 justify-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="font-serif text-3xl font-semibold">Eternize</span>
            </Link>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-medium mb-2">
                Bem-vindo de volta!
              </h1>
              <p className="text-muted-foreground">
                Entre na sua conta para continuar organizando seu casamento
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white shadow-lg shadow-primary/20 py-6 rounded-xl font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Terms */}
            <div className="mt-8 bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ao continuar, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </div>

            {/* Register Link */}
            <p className="text-center mt-8 text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="text-primary font-medium hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
