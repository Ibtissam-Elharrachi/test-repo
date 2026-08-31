import {useState, useEffect} from "react"

// IMPORT COMPONENTS 
import AuthModal from "./components/auth/AuthModal";
import Header from "./components/layout/Header";
import Breadcrumb from "./components/layout/BreadcrumbNav";
//import Chatbot from "./components/layout/ChatbotWidget";
import HeroSection from "./components/layout/HeroSection"
import FeedbackSection from "./components/feedback/FeedbackSection"
import IndicatorsSection from "./components/indicators/IndicatorsSection"
import ScoreHistory from "./components/history/ScoreHistory";
import FeedbackListModal from "./components/indicators/FeedbackListModal"
// Import Services & Utils
import {supabase} from "./services/supabaseClient";

// IMPORT STYLING 
import './App.css'

function App() {
  const [showAuth, setShowAuth] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [showFeedbackList, setShowFeedbackList] = useState(false);
  const [feedbackListType, setFeedbackListType] = useState(null);
  const [user, setUser] = useState(null);

  /*const [user, setUser] = useState({
    name: "prénom",
    email: "user@gmail.com",
    password: "",
    gender: "femme",
  });*/

  const openFeedbackList = (type) => {
    setFeedbackListType(type);
    setShowFeedbackList(true);
  };

  const closeFeedbackList = () => {
    setShowFeedbackList(false);
    setFeedbackListType(null);
  };

  const handleAuth = async (userData) => {

    try {
      const {
          name,
          email,
          password,
          gender,
          mode
      } = userData;


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

         // Email confirmation is currently disabled,
          /*if (!data.session) {
            alert(
              "Votre compte a été créé. Veuillez vérifier votre adresse email pour continuer."
            );
          } */

        if (data.session?.user) {
          await loadUserProfile(data.user);
          return
        }

        setShowAuth(false);

        return;
      }



      // LOGIN
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      console.log("Login successful:", data);

      if (data.user) {
        await loadUserProfile(data.user);
      }

      setShowAuth(false);


    }catch(error) {
      console.error("Authentication error:", error);
      alert(error.message);
    }
  };

  // Retreive User Profile State
  /*const loadUserProfile = async (authUser) => {

    if (!authUser) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          gender,
          department_id,
          avatar_url,
          role,
          current_score
        `)
        .eq("id", authUser.id)
        .single();

      if (error) {
        throw error;
      }

      setUser(profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };*/

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

  // Listent to Supabase Authentication
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
  } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event);

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
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

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
        alert(error.message);
    }
    };


  // Loading State Handling 
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-content">
          <div className="loading-spinner"></div>
          <p>Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="id">

      {/* AUTHENTIFICATION */}
      {showAuth && (
        <AuthModal onAuth={handleAuth} />
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
              Pourquoi le feedback ?
            </h3>

            <p className="video-feature-subtitle">
              Découvrez en vidéo l'importance du retour d'expérience et
              comment il transforme notre quotidien collectif chez Stellantis.
            </p>
          </div>

          <div className="video-player-container">
            <video
              id="scrollAutoplayVideo"
              controls
              muted
              playsInline
              preload="metadata"
            >
              <source
                src="/videos/stellantis.mp4"
                type="video/mp4"
              />

              Votre navigateur ne prend pas en charge la lecture de cette
              vidéo.
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

export default App;
