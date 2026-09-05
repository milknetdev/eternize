import { useState } from "react";
import { Link } from "react-router";
import {
  Camera,
  Upload,
  Image,
  Grid3X3,
  Heart,
  Download,
  Share2,
  Lock,
  Sparkles,
  ArrowRight,
  ZoomIn,
  Play,
  Shield,
  CloudUpload,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import MoreFeatures from "@/react-app/components/marketing/MoreFeatures";

const demoPhotos = [
  { id: 1, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop", caption: "Nossa história começa" },
  { id: 2, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop", caption: "O pedido" },
  { id: 3, src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop", caption: "Ensaio pré-wedding" },
  { id: 4, src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop", caption: "Detalhes especiais" },
  { id: 5, src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=300&fit=crop", caption: "Alianças" },
  { id: 6, src: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400&h=300&fit=crop", caption: "Buquê da noiva" },
  { id: 7, src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop", caption: "Cerimônia" },
  { id: 8, src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop", caption: "Primeiro beijo" },
];

const benefits = [
  {
    icon: CloudUpload,
    title: "Upload Ilimitado",
    description: "Carregue quantas fotos quiser sem se preocupar com espaço.",
  },
  {
    icon: Grid3X3,
    title: "Layouts Elegantes",
    description: "Escolha entre diferentes estilos de galeria para suas fotos.",
  },
  {
    icon: Lock,
    title: "Privacidade Total",
    description: "Controle quem pode ver seu álbum de fotos.",
  },
  {
    icon: Share2,
    title: "Fácil de Compartilhar",
    description: "Envie o link para convidados verem as fotos do casamento.",
  },
];

const features = [
  { icon: Upload, title: "Arrastar e Soltar", desc: "Upload fácil de múltiplas fotos" },
  { icon: Image, title: "Alta Qualidade", desc: "Fotos em resolução original" },
  { icon: ZoomIn, title: "Visualização Ampliada", desc: "Galeria com zoom elegante" },
  { icon: Play, title: "Slideshow", desc: "Apresentação automática de fotos" },
  { icon: Download, title: "Download", desc: "Convidados podem baixar fotos" },
  { icon: Smartphone, title: "Responsivo", desc: "Perfeito em qualquer dispositivo" },
];

const stats = [
  { value: "Ilimitado", label: "Fotos no álbum" },
  { value: "500MB", label: "Por foto (máx)" },
  { value: "100%", label: "Gratuito" },
  { value: "4K", label: "Resolução suportada" },
];

export default function PhotoAlbum() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set([1, 3, 5]));

  const toggleLike = (id: number) => {
    setLikedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gold-light blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Camera className="w-4 h-4" />
                Galeria de Fotos
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
                Suas <span className="text-primary">memórias</span> em um só lugar
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Compartilhe os momentos mais especiais do seu casamento com uma galeria 
                elegante e fácil de usar. Upload ilimitado, alta qualidade e total privacidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cadastro">
                  <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-8 py-6 rounded-xl font-semibold text-lg">
                    Criar Meu Álbum
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/demo/ana-e-joao">
                  <Button variant="outline" className="px-8 py-6 rounded-xl font-medium text-lg border-2">
                    Ver Exemplo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Demo Gallery */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Nosso Álbum</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Image className="w-4 h-4" />
                    {demoPhotos.length} fotos
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {demoPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedPhoto(photo.id)}
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {likedPhotos.has(photo.id) && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    <Heart className="w-4 h-4 inline mr-1 text-red-500" />
                    {likedPhotos.size} curtidas
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Upload className="w-4 h-4 mr-1" />
                    Adicionar fotos
                  </Button>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CloudUpload className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agora</p>
                  <p className="text-sm font-semibold text-green-600">+24 fotos enviadas!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={demoPhotos.find(p => p.id === selectedPhoto)?.src?.replace('w=400&h=300', 'w=800&h=600')}
              alt=""
              className="w-full rounded-lg"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white font-medium">
                {demoPhotos.find(p => p.id === selectedPhoto)?.caption}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  className="text-white hover:text-red-400 transition-colors"
                  onClick={() => toggleLike(selectedPhoto)}
                >
                  <Heart className={`w-6 h-6 ${likedPhotos.has(selectedPhoto) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button className="text-white hover:text-primary transition-colors">
                  <Download className="w-6 h-6" />
                </button>
                <button className="text-white hover:text-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Tudo que você precisa para suas fotos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma galeria completa para guardar e compartilhar os melhores momentos
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary to-gold-light text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-serif text-4xl md:text-5xl font-semibold mb-2">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Simples de usar
            </h2>
            <p className="text-muted-foreground">
              Em poucos passos suas fotos estarão prontas para compartilhar
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Faça Upload", desc: "Arraste suas fotos ou selecione do seu dispositivo. Aceita JPG, PNG e até vídeos curtos." },
              { step: 2, title: "Organize", desc: "Adicione legendas, organize por categorias e escolha as fotos de destaque." },
              { step: 3, title: "Compartilhe", desc: "Seus convidados acessam a galeria pelo link do seu site de casamento." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-8 border border-border text-center hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-gold-light text-white flex items-center justify-center font-semibold text-xl">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Layouts Elegantes
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Mostre suas fotos do seu jeito
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Escolha entre diferentes estilos de galeria para exibir suas fotos da 
                melhor forma. Grade clássica, masonry, carrossel ou slideshow — você decide 
                como seus convidados vão explorar seus momentos especiais.
              </p>
              <ul className="space-y-4">
                {[
                  "Grade clássica com proporções uniformes",
                  "Layout masonry para fotos de tamanhos variados",
                  "Carrossel para destacar as melhores fotos",
                  "Slideshow automático com música de fundo",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {demoPhotos.slice(0, 6).map((photo, i) => (
                <div 
                  key={i}
                  className={`rounded-xl overflow-hidden ${
                    i === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <img
                    src={photo.src}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Recursos completos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar suas fotos de casamento
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/5 via-blush/30 to-champagne rounded-3xl p-8 md:p-12 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Suas fotos, sua privacidade
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Entendemos que suas fotos de casamento são pessoais. Por isso, você tem 
              total controle sobre quem pode vê-las. Configure sua galeria como pública, 
              apenas para convidados, ou protegida por senha.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Galeria pública", "Apenas convidados", "Proteção por senha", "Download controlado"].map((item, i) => (
                <span key={i} className="px-4 py-2 bg-white rounded-full text-sm font-medium border border-border">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Camera className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Comece a criar seu álbum
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crie seu site de casamento grátis e tenha uma galeria de fotos elegante 
            para compartilhar com seus convidados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-10 py-6 rounded-xl font-semibold text-lg">
                Criar Meu Site Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/demo/ana-e-joao">
              <Button variant="outline" className="px-10 py-6 rounded-xl font-medium text-lg border-2">
                Ver Demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MoreFeatures current="album" />

      <Footer />
    </div>
  );
}
