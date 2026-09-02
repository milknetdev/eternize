import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/local-auth/react";
import { Heart, ArrowLeft, Loader2, Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

const features = [
  "Site personalizado para seu casamento",
  "Lista de presentes ilimitada",
  "Confirmação de presença online",
  "Galeria de fotos colaborativa",
  "Painel de controle completo",
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

    const result = await register(name, email, password);
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
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=1600&fit=crop"
          alt="Casamento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-serif text-4xl font-medium mb-6">
            Comece a planejar o dia mais especial da sua vida
          </h2>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
                Crie sua conta grátis
              </h1>
              <p className="text-muted-foreground">
                Comece a organizar seu casamento em minutos
              </p>
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Check className="w-4 h-4" />
                100% gratuito para começar
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
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
                  "Criar minha conta"
                )}
              </Button>
            </form>

            {/* Features Mobile */}
            <div className="lg:hidden mt-8 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div className="mt-8 bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ao criar sua conta, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </div>

            {/* Login Link */}
            <p className="text-center mt-8 text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/entrar" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
