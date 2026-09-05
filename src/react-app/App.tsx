import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/local-auth/react";
import HomePage from "@/react-app/pages/Home";
import TemplateDemo from "@/react-app/pages/TemplateDemo";
import LoginPage from "@/react-app/pages/Login";
import RegisterPage from "@/react-app/pages/Register";
import Dashboard from "@/react-app/pages/Dashboard";
import GiftCatalog from "@/react-app/pages/GiftCatalog";
import Templates from "@/react-app/pages/Templates";
import ThemeEditor from "@/react-app/pages/ThemeEditor";
import SiteSettings from "@/react-app/pages/SiteSettings";
import CouplePage from "@/react-app/pages/CouplePage";
import PublicGiftList from "@/react-app/pages/PublicGiftList";
import RSVPOnline from "@/react-app/pages/RSVPOnline";
import GuestManagement from "@/react-app/pages/GuestManagement";
import About from "@/react-app/pages/About";
import PhotoAlbum from "@/react-app/pages/PhotoAlbum";
import DigitalInvites from "@/react-app/pages/DigitalInvites";
import FAQ from "@/react-app/pages/FAQ";
import GuestConfirmation from "@/react-app/pages/GuestConfirmation";
import GuestFindConfirmation from "@/react-app/pages/GuestFindConfirmation";
import AdminDashboard from "@/react-app/pages/AdminDashboard";
import GravataPage from "@/react-app/pages/GravataPage";
import GuestGalleryUpload from "@/react-app/pages/GuestGalleryUpload";
import GiftCheckout from "@/react-app/pages/GiftCheckout";
import NotFound from "@/react-app/pages/NotFound";
import SupportBanner from "@/react-app/components/SupportBanner";
import ScrollToTop from "@/react-app/components/ScrollToTop";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <SupportBanner />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo/:templateId" element={<TemplateDemo />} />
          <Route path="/demo" element={<TemplateDemo />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/presentes" element={<GiftCatalog />} />
          <Route path="/rsvp" element={<RSVPOnline />} />
          <Route path="/convidados" element={<GuestManagement />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/album" element={<PhotoAlbum />} />
          <Route path="/convites" element={<DigitalInvites />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/dashboard/tema" element={<ThemeEditor />} />
          <Route path="/dashboard/configuracoes" element={<SiteSettings />} />
          <Route path="/c/:customUrl" element={<CouplePage />} />
          <Route path="/c/:customUrl/presentes" element={<PublicGiftList />} />
          <Route path="/c/:customUrl/gravata" element={<GravataPage />} />
          <Route path="/c/:customUrl/galeria" element={<GuestGalleryUpload />} />
          <Route path="/c/:customUrl/checkout" element={<GiftCheckout />} />
          <Route path="/c/:customUrl/confirmar" element={<GuestFindConfirmation />} />
          <Route path="/c/:customUrl/confirmar/:code" element={<GuestConfirmation />} />
          <Route path="/confirmar/:code" element={<GuestConfirmation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
