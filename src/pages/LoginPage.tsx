import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Globe, ArrowLeft, Eye, EyeOff } from "lucide-react";

const sliderImages = [
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop", // truck
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop", // highway
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop", // driving
];

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@imparo.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "bg" ? "en" : "bg";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { success, data } = response.data;

      if (success && data?.access_token) {
        if (data.user && data.user.preferred_language) {
          i18n.changeLanguage(data.user.preferred_language);
          localStorage.setItem("lang", data.user.preferred_language);
        }
        login(data.access_token, data.user);
        navigate("/dashboard");
      } else {
        setError(t("invalid_credentials"));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("login_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) text-(--foreground) p-4 md:p-8">
      {/* Main Container */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-(--card) rounded-2xl overflow-hidden min-h-[600px] xl:min-h-[750px] border border-(--border)">
        {/* Left Side: Image Slider */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden m-4 rounded-xl">
          {sliderImages.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={src}
                alt="Slider"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10"></div>
            </div>
          ))}

          <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <div className="text-white text-3xl font-black">Imparo</div>
          </div>

          <div className="absolute bottom-16 left-8 right-8 z-10">
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-4 tracking-tight text-white max-w-[90%]">
              {t("landing_title")}
            </h1>
            <p className="text-white/80 text-sm max-w-sm">
              {t("landing_subtitle")}
            </p>
          </div>

          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentImage
                    ? "w-8 bg-white"
                    : "w-4 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 relative xl:px-20">
          <div className="flex justify-between items-center w-full mb-12">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 rounded-full hover:bg-(--input) transition-colors flex items-center justify-center text-(--foreground) cursor-pointer"
            >
              <ArrowLeft size={20} className="opacity-70" />
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded hover:bg-(--input) transition-colors flex items-center gap-2 text-sm font-medium border border-(--border) cursor-pointer"
            >
              <Globe size={16} />
              {i18n.language.toUpperCase()}
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-(--foreground)">
                {t("login")}
              </h2>
              <div className="text-sm opacity-70">
                Welcome back! Please enter your details.
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded block text-sm font-medium border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground) opacity-80 pl-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t("email_address")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-(--input) border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#ef5350] outline-none placeholder:text-gray-500 font-medium transition-shadow"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground) opacity-80 pl-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-(--input) border-none px-4 py-3.5 pr-12 rounded-xl focus:ring-1 focus:ring-[#ef5350] outline-none placeholder:text-gray-500 tracking-widest transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-medium py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t("login")
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
