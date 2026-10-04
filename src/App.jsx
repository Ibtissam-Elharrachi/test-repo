import { useState, useEffect } from "react";

// IMPORT COMPONENTS
import AuthModal from "./components/auth/AuthModal";
import ResetPasswordModal from "./components/auth/ResetPasswordModal";
import Header from "./components/layout/Header";
import Breadcrumb from "./components/layout/BreadcrumbNav";
//import Chatbot from "./components/layout/ChatbotWidget";
import HeroSection from "./components/layout/HeroSection";
import FeedbackSection from "./components/feedback/FeedbackSection";
import IndicatorsSection from "./components/indicators/IndicatorsSection";
import ScoreHistory from "./components/history/ScoreHistory";
import FeedbackListModal from "./components/indicators/FeedbackListModal";

// Import Services & Utils
import { supabase } from "./services/supabaseClient";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import {
  SUBTITLES_FR,
  SUBTITLES_EN,
  SUBTITLE_TIMES,
  SUBTITLE_TRACK_LABEL,
} from "./data/subtitles";

// IMPORT STYLING
import "./App.css";

function AppContent() {
  const { lang, t } = useLanguage();

  const [showAuth, setShowAuth] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [showFeedbackList, setShowFeedbackList] = useState(false);
  const [feedbackListType, setFeedbackListType] = useState(null);
  const [user, setUser] = useState(null);
  const [welcomeToast, setWelcomeToast] = useState(false);

  // RESET PASSWORD (s'affiche quand l'utilisateur vient du lien email)
  const [showReset, setShowReset] = useState(() =>
    window.location.hash.includes("type=recovery")
  );

  const openFeedbackList = (type) => {
    setFeedbackListType(type);
    setShowFeedbackList(true);
  };

  const closeFeedbackList = () => {
    setShowFeedbackList(false);
    setFeedbackListType(null);
  };

  // Message de bienvenue après inscription
  const showWelcome = () => {
    setWelcomeToast(true);
    setTimeout(() => setWelcomeToast(false), 4000);
  };

  // Traduit les erreurs Supabase en messages clairs pour l'utilisateur
  const translateAuthError = (error) => {
    const msg = (error?.message || "").toLowerCase();

    if (msg.includes("invalid login credentials")) {
      return t("errors.invalidCredentials");
    }
    if (msg.includes("already registered")) {
      return t("errors.alreadyRegistered");
    }
    if (msg.includes("password should be at least")) {
      return t("errors.weakPassword");
    }
    if (msg.includes("failed to fetch") || msg.includes("network")) {
      return t("errors.network");
    }
    if (msg.includes("rate limit") || msg.includes("too many")) {
      return t("errors.rateLimit");
    }
    if (msg.includes("email not confirmed")) {
      return t("errors.emailNotConfirmed");
    }
    return t("errors.generic");
  };

  const handleAuth = async (userData) => {
    try {
      const { name, email, password, gender, mode } = userData;

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              gender: gender,
            },
          },
        });

        if (error) throw error;

        console.log("Signup successful:", data);

        if (data.session?.user) {
          await loadUserProfile(data.user);
        }

        setShowAuth(false);
        showWelcome();
        return null;
      }

      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Login successful:", data);

      if (data.user) {
        await loadUserProfile(data.user);
      }

      setShowAuth(false);
      return null;
    } catch (error) {
      console.error("Authentication error:", error);
      return { error: translateAuthError(error) };
    }
  };

  // Retrieve User Profile State
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

    // Si le profil n'existe pas encore, on évite le crash
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
      role: data.role,
      current_score: data.current_score,
    });

    setShowAuth(false);
  };

  // Listen to Supabase Authentication
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

      console.log("Auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        setShowReset(true);
      }

      if (event === "SIGNED_OUT") {
        setShowAuth(true);

        setUser({
          name: "prénom",
          email: "user@gmail.com",
          gender: "femme",
        });
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

  // Sous-titres synchronisés (français ou anglais selon la langue choisie)
  useEffect(() => {
    if (authLoading) return;

    const video = document.getElementById("scrollAutoplayVideo");
    if (!video) return;

    const lines = lang === "en" ? SUBTITLES_EN : SUBTITLES_FR;

    const buildSubtitles = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) return;

      // Réutilise la piste si elle existe déjà, sinon la crée
      let track = Array.from(video.textTracks).find(
        (item) => item.label === SUBTITLE_TRACK_LABEL
      );
      if (!track) {
        track = video.addTextTrack("subtitles", SUBTITLE_TRACK_LABEL, lang);
      }

      // Vide les anciens sous-titres
      if (track.cues) {
        Array.from(track.cues).forEach((cue) => track.removeCue(cue));
      }

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

      // Désactivés par défaut ; si l'utilisateur les a activés, on les garde affichés
      track.mode = track.mode === "showing" ? "showing" : "hidden";
    };

    if (video.readyState >= 1) {
      buildSubtitles();
    } else {
      video.addEventListener("loadedmetadata", buildSubtitles);
    }

    return () => {
      video.removeEventListener("loadedmetadata", buildSubtitles);
    };
  }, [authLoading, lang]);

  // LOGOUT SESSION
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("User signed out");
    } catch (error) {
      console.error("Logout error:", error);
      alert(t("errors.logout"));
    }
  };

  // Loading State Handling
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
      {/* MESSAGE DE BIENVENUE */}
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

      {/* AUTHENTIFICATION */}
      {showAuth && <AuthModal onAuth={handleAuth} />}

      {/* NOUVEAU MOT DE PASSE */}
      {showReset && (
        <ResetPasswordModal
          onDone={() => {
            window.history.replaceState(null, "", window.location.pathname);
            setShowReset(false);
          }}
        />
      )}

      {/* FEEDBACK LIST MODAL */}
      {showFeedbackList && (
        <FeedbackListModal
          type={feedbackListType}
          onClose={closeFeedbackList}
        />
      )}

      {/* HEADER */}
      <Header user={user} onLogout={handleLogout} />

      {/* BREADCRUMB */}
      <Breadcrumb
        onFeedbackClick={() => {
          document
            .getElementById("donner-feedback")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        onReceivedFeedbackClick={() => {
          // Temporary behavior.
          // We'll connect this to the received-feedback list later.
          document
            .getElementById("indicateurs")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* HERO */}
      <HeroSection user={user} />

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* POURQUOI LE FEEDBACK */}
        <section
          className="section-card video-feature-card"
          id="pourquoi-feedback"
        >
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

        {/* DONNER UN FEEDBACK */}
        <FeedbackSection />

        {/* INDICATEURS */}
        <IndicatorsSection
          onOpenFeedbackList={openFeedbackList}
          user={user}
        />

        {/* HISTORIQUE */}
        <ScoreHistory user={user} />
      </main>
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