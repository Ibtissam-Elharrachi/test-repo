import { useState, useEffect } from "react";

// IMPORT COMPONENTS
import AuthModal from "./components/auth/AuthModal";
import ResetPasswordModal from "./components/auth/ResetPasswordModal";
import ProfileModal from "./components/profile/ProfileModal";
import Header from "./components/layout/Header";
import Breadcrumb from "./components/layout/BreadcrumbNav";
import Chatbot from "./components/layout/ChatbotWidget";
import HeroSection from "./components/layout/HeroSection";
import FeedbackSection from "./components/feedback/FeedbackSection";
import IndicatorsSection from "./components/indicators/IndicatorsSection";
import ScoreHistory from "./components/history/ScoreHistory";
import FeedbackListModal from "./components/indicators/FeedbackListModal";
import HRDashboard from "./components/hr/HRDashboard";

// Import Services & Utils
import { supabase } from "./services/supabaseClient";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { useNotifications } from "./hooks/useNotifications";
import { SUBTITLES_FR, SUBTITLES_EN, SUBTITLE_TIMES } from "./data/subtitles";

// IMPORT STYLING
import "./App.css";

// Pistes de sous-titres disponibles (choisies depuis le bouton CC du lecteur vidéo)
const SUBTITLE_TRACKS = [
  { code: "fr", label: "Français", lines: SUBTITLES_FR },
  { code: "en", label: "English", lines: SUBTITLES_EN },
];

function AppContent() {
  const { lang, t } = useLanguage();

  const [showAuth, setShowAuth] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [showFeedbackList, setShowFeedbackList] = useState(false);
  const [feedbackListType, setFeedbackListType] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [welcomeToast, setWelcomeToast] = useState(false);

  // Sous-titres affichés au départ : suivent la langue de l'application
  const [subLang, setSubLang] = useState(lang);

  const notifications = useNotifications(user);

  const [showReset, setShowReset] = useState(() =>
    window.location.hash.includes("type=recovery")
  );

  useEffect(() => {
    setSubLang(lang);
  }, [lang]);

  const openFeedbackList = (type) => {
    setFeedbackListType(type);
    setShowFeedbackList(true);
  };

  const closeFeedbackList = () => {
    setShowFeedbackList(false);
    setFeedbackListType(null);
  };

  const openReceivedFeedbacks = () => {
    notifications.markAllAsRead();
    openFeedbackList("recus");
  };

  const handleProfileSaved = (updated) => {
    setUser((previous) => ({ ...previous, ...updated }));
  };

  const showWelcome = () => {
    setWelcomeToast(true);
    setTimeout(() => setWelcomeToast(false), 4000);
  };

  // Retourne une clé de traduction (AuthModal la traduit dans sa propre langue)
  const authErrorKey = (error) => {
    const msg = (error?.message || "").toLowerCase();

    if (msg.includes("invalid login credentials")) return "errors.invalidCredentials";
    if (msg.includes("already registered")) return "errors.alreadyRegistered";
    if (msg.includes("password should be at least")) return "errors.weakPassword";
    if (msg.includes("failed to fetch") || msg.includes("network")) return "errors.network";
    if (msg.includes("rate limit") || msg.includes("too many")) return "errors.rateLimit";
    if (msg.includes("email not confirmed")) return "errors.emailNotConfirmed";
    return "errors.generic";
  };

  const handleAuth = async (userData) => {
    try {
      const { name, email, password, department_id, mode } = userData;

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              department_id,
            },
          },
        });

        if (error) throw error;

        if (data.session?.user) {
          await loadUserProfile(data.user);
        }

        setShowAuth(false);
        showWelcome();
        return null;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user);
      }

      setShowAuth(false);
      return null;
    } catch (error) {
      console.error("Authentication error:", error);
      return { errorKey: authErrorKey(error) };
    }
  };

  const loadUserProfile = async (authUser) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors du chargement du profil :", error);
      return;
    }

    if (!data) {
      console.warn("Aucun profil trouvé pour cet utilisateur.");
      setShowAuth(false);
      return;
    }

    setUser({
      id: data.id,
      name: data.full_name,
      email: data.email,
      gender: data.gender,
      avatar_url: data.avatar_url,
      stellantis_id: data.stellantis_id,
      department_id: data.department_id,
      role: data.role,
      current_score: data.current_score,
    });

    setShowAuth(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        await loadUserProfile(session.user);
        setShowAuth(false);
      } else {
        setShowAuth(true);
      }

      setAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setShowReset(true);
      }

      if (event === "SIGNED_OUT") {
        setShowAuth(true);
        setShowProfile(false);
        setUser(null);
      } else if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        session?.user
      ) {
        await loadUserProfile(session.user);
        setShowAuth(false);
      }

      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Lecture automatique de la vidéo quand elle apparaît à l'écran
  useEffect(() => {
    if (authLoading) return;

    const video = document.getElementById("scrollAutoplayVideo");
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [authLoading]);

  // Sous-titres FR + EN (les deux pistes existent ; le bouton CC du lecteur permet de choisir)
  useEffect(() => {
    if (authLoading) return;

    const video = document.getElementById("scrollAutoplayVideo");
    if (!video) return;

    const applySubtitles = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) return;

      SUBTITLE_TRACKS.forEach(({ code, label, lines }) => {
        let track = Array.from(video.textTracks).find((item) => item.label === label);
        if (!track) {
          track = video.addTextTrack("subtitles", label, code);
        }

        // Ajoute les phrases une seule fois
        if (!track.cues || track.cues.length === 0) {
          lines.forEach((line, index) => {
            const start = SUBTITLE_TIMES[index];
            if (start === undefined) return;

            const nextStart =
              index < lines.length - 1 ? SUBTITLE_TIMES[index + 1] : duration;
            const end = Math.min(nextStart - 0.05, start + 8, duration);

            if (end > start) {
              track.addCue(new VTTCue(start, end, line));
            }
          });
        }

        track.mode = subLang === code ? "showing" : "hidden";
      });
    };

    if (video.readyState >= 1) {
      applySubtitles();
    } else {
      video.addEventListener("loadedmetadata", applySubtitles);
    }

    return () => {
      video.removeEventListener("loadedmetadata", applySubtitles);
    };
  }, [authLoading, subLang]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      alert(t("errors.logout"));
    }
  };

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-content">
          <div className="loading-spinner"></div>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="id">
      {welcomeToast && (
        <div className="welcome-toast" role="status">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-6" />
          </svg>
          <span>{t("toast.welcome")}</span>
        </div>
      )}

      {showAuth && <AuthModal onAuth={handleAuth} />}

      {showReset && (
        <ResetPasswordModal
          onDone={() => {
            window.history.replaceState(null, "", window.location.pathname);
            setShowReset(false);
          }}
        />
      )}

      {showProfile && user?.id && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onSaved={handleProfileSaved}
        />
      )}

      {showFeedbackList && (
        <FeedbackListModal type={feedbackListType} onClose={closeFeedbackList} />
      )}

      <Header
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfile(true)}
        notifications={notifications}
        onOpenReceived={openReceivedFeedbacks}
      />

      <Breadcrumb
        unreadCount={notifications.unreadCount}
        onFeedbackClick={() => {
          document
            .getElementById("donner-feedback")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        onReceivedFeedbackClick={openReceivedFeedbacks}
      />

      <HeroSection user={user} />

      <main className="main-content">
        <section className="section-card video-feature-card" id="pourquoi-feedback">
          <div className="video-feature-header">
            <h3 className="box-main-title title-with-orange-line">
              {t("video.title")}
            </h3>

            <p className="video-feature-subtitle">{t("video.subtitle")}</p>
          </div>

          <div className="video-player-container">
            <video
              id="scrollAutoplayVideo"
              controls
              muted
              playsInline
              preload="metadata"
            >
              <source src="/videos/stellantis.mp4" type="video/mp4" />
              {t("video.unsupported")}
            </video>
          </div>
        </section>

        <FeedbackSection />

        <IndicatorsSection onOpenFeedbackList={openFeedbackList} user={user} />

                <ScoreHistory user={user} />

        {user?.role === "ADMIN_HR" && <HRDashboard />}
      </main>

      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;