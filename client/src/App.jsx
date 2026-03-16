import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import BookingPage from "./pages/BookingPage";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Footer from "./components/Footer.jsx";
import Contact from "./pages/Contact.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import HardwarePage from "./pages/HardwarePage.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/hardware" element={<HardwarePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <WhatsAppButton floating />
      <Footer />
    </>
  );
}

export default App;
