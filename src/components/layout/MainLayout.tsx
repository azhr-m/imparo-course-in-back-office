import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeProvider";
import { Sun, Moon, LogOut, Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function MainLayout() {
  const { token, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === "bg" ? "en" : "bg";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const handleThemeToggle = () => {
    // Basic spread animation handled in ThemeProvider but we can trigger it
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const navItems = [
    { name: t("dashboard"), path: "/dashboard" },
    { name: t("submissions"), path: "/submissions" },
    ...(user?.role === "admin" ? [{ name: t("agents"), path: "/agents" }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-(--background) text-(--foreground)">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-(--card) border-r border-(--border) flex flex-col transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-(--border)/50">
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <span
              className="text-[#d32f2f] bg-white px-1.5 py-0.5 rounded font-black leading-none text-xl"
              style={{ fontFamily: "Impact, var(--font-sans)" }}
            >
              Imparo
            </span>
          </div>
          {/* Mobile close button */}
          <button
            className="md:hidden ml-auto p-1 text-gray-400 hover:text-(--foreground)"
            onClick={() => setMobileMenuOpen(false)}
          >
            x
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#d32f2f]"
                    : "text-gray-500 hover:text-(--foreground)"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="my-4 border-t border-(--border)/50"></div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-(--foreground) transition-colors"
          >
            <LogOut size={16} className="mr-3 opacity-60" />
            {t("logout", "Logout")}
          </button>
        </nav>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-(--background)/80 backdrop-blur-md border-b border-(--border) h-16 flex items-center justify-between px-4 sm:px-6">
          <button
            className="md:hidden p-2 rounded-md hover:bg-(--border) transition-colors text-gray-500"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={toggleLanguage}
              className="w-9 h-9 flex items-center justify-center rounded border border-(--border) bg-(--card) hover:bg-(--input) transition-colors text-lg"
              title="Toggle Language"
            >
              {i18n.language === "bg" ? "EN" : "BG"}
            </button>

            <button
              onClick={handleThemeToggle}
              className="w-9 h-9 flex items-center justify-center rounded border border-(--border) bg-(--card) hover:bg-(--input) transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Moon size={16} className="text-indigo-400" />
              ) : (
                <Sun size={16} className="text-orange-400" />
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-(--border) bg-(--card) hover:bg-(--input) transition-colors h-9"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || "Admin Nodis"}
                </span>
                <ChevronDown size={14} className="opacity-70" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-(--card) border border-(--border) rounded-md shadow-lg py-1 z-50">
                  <button className="w-full text-left px-4 py-2 hover:bg-(--input) text-sm text-(--foreground) transition-colors">
                    User View
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-(--input) text-sm text-(--foreground) transition-colors">
                    Settings
                  </button>
                  <div className="border-t border-(--border) my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-(--input) text-sm text-(--foreground) transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
