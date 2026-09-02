import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/local-auth/react";
import { Heart, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    exchangeCodeForSessionToken().then(() => {
      navigate("/dashboard");
    });
  }, [exchangeCodeForSessionToken, navigate]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  );
}
