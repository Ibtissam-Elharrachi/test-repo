import React, { useState } from "react";

// IMPORT LIBS / SERVICES & UTILS
import { supabase } from "../../services/supabaseClient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AuthModal({ onAuth }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup" | "forgot"

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [errors, setErrors] = useState({});

  const isLogin = authMode === "login";
  const isSignup = authMode === "signup";
  const isForgot = authMode === "forgot";

  const changeMode = (mode) => {
    setAuthMode(mode);
    setMessage(null);
    setErrors({});
    setShowPassword(false);
  };

  // VALIDATION
  const validate = () => {
    const newErrors = {};

    if (isSignup && name.trim().length < 2) {
      newErrors.name = "Veuillez saisir votre prénom et nom.";
    }

    if (!email.trim()) {
      newErrors.email = "L'adresse email est obligatoire.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Veuillez saisir une adresse email valide.";
    }

    if (!isForgot) {
      if (!password) {
        newErrors.password = "Le mot de passe est obligatoire.";
      } else if (isSignup && password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
      }
    }

    if (isSignup && !gender) {
      newErrors.gender = "Veuillez sélectionner votre genre.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!validate()) return;

    // MOT DE PASSE OUBLIÉ
    if (isForgot) {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      setLoading(false);

      if (error) {
        setMessage({
          type: "error",
          text: "Impossible d'envoyer le lien pour le moment. Veuillez réessayer plus tard.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Si cette adresse existe, un lien de réinitialisation vient d'être envoyé. Vérifiez votre boîte mail.",
        });
      }
      return;
    }

    // LOGIN / SIGNUP
    const userData = { name: name.trim(), email: email.trim(), password, gender, mode: authMode };
    if (onAuth) {
      setLoading(true);
      const result = await onAuth(userData);
      setLoading(false);

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      }
    }
  };

  return (
    <div className="login-overlay" id="loginModal">
      <div className="login-popup-wrapper">
        <div className="title-container">
          <h2>{isForgot ? "Mot de passe oublié ?" : "Révélez votre potentiel !"}</h2>
          <div className="title-divider"></div>
        </div>

        <p>
          {isForgot
            ? "Saisissez votre adresse email, nous vous enverrons un lien pour choisir un nouveau mot de passe."
            : "Inscrivez-vous dans une démarche de progrès continu et d'échange constructif."}
        </p>

        <form id="authForm" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <>
              <input
                type="text"
                id="userInput"
                placeholder="Prénom et nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </>
          )}

          <input
            type="email"
            id="userEmailInput"
            placeholder="prenom.nom@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}

          {!isForgot && (
            <>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="userPasswordInput"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  title={showPassword ? "Masquer" : "Afficher"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </>
          )}

          {isSignup && (
            <>
              <select
                id="userGenderInput"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={errors.gender ? "input-error" : ""}
              >
                <option value="" disabled>
                  Sélectionnez votre genre
                </option>
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
              </select>
              {errors.gender && <div className="field-error">{errors.gender}</div>}
            </>
          )}

          {isLogin && (
            <button
              type="button"
              className="forgot-link"
              onClick={() => changeMode("forgot")}
            >
              Mot de passe oublié ?
            </button>
          )}

          {message && (
            <div className={`auth-message ${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          <button type="submit" id="submitBtn" disabled={loading}>
            {loading
              ? "Veuillez patienter..."
              : isForgot
              ? "Envoyer le lien"
              : isSignup
              ? "Créer mon compte"
              : "Commencer mon accompagnement"}
          </button>
        </form>

        <img src="/stella.png" alt="Stella" className="stella-img" id="stellaImg" />

        <div className="auth-mode-switch">
          {isForgot ? (
            <button type="button" onClick={() => changeMode("login")}>
              Retour à la connexion
            </button>
          ) : isLogin ? (
            <>
              <span>Vous n'avez pas encore de compte ?</span>
              <button type="button" onClick={() => changeMode("signup")}>
                Créer un compte
              </button>
            </>
          ) : (
            <>
              <span>Vous avez déjà un compte ?</span>
              <button type="button" onClick={() => changeMode("login")}>
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;