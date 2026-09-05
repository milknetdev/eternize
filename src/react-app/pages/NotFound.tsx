import { Link } from "react-router";
import { Heart, ArrowLeft } from "lucide-react";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center mx-auto mb-6">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <p className="font-serif text-5xl font-semibold text-primary mb-2">404</p>
          <h1 className="font-serif text-2xl font-medium mb-3">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            O endereço que você tentou abrir não existe ou foi movido.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-gold-light text-white font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-border font-medium"
            >
              Ver templates
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
