import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { translate } from "../../i18n";

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
  // La page de connexion est en français par défaut (indépendante de la langue de l'application)
  const [lang, setLang] = useState("fr");
  const tr = (key) => translate(lang, key);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup" | "forgot"

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type, key }
  const [errors, setErrors] = useState({}); // { champ: clé de traduction }

  const isLogin = authMode === "login";
  const isSignup = authMode === "signup";
  const isForgot = authMode === "forgot";

  // Charge la liste des départements pour l'inscription
  useEffect(() => {
    if (!isSignup || departments.length > 0) return;

    const loadDepartments = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Erreur départements:", error);
        return;
      }
      setDepartments(data || []);
    };

    loadDepartments();
  }, [isSignup, departments.length]);

  const changeMode = (mode) => {
    setAuthMode(mode);
    setMessage(null);
    setErrors({});
    setShowPassword(false);
  };

  const validate = () => {
    const newErrors = {};

    if (isSignup && name.trim().length < 2) newErrors.name = "auth.errName";

    if (!email.trim()) newErrors.email = "auth.errEmailRequired";
    else if (!EMAIL_REGEX.test(email.trim())) newErrors.email = "auth.errEmailInvalid";

    if (!isForgot) {
      if (!password) newErrors.password = "auth.errPwdRequired";
      else if (isSignup && password.length < 6) newErrors.password = "auth.errPwdShort";
    }

    if (isSignup && !departmentId) newErrors.department = "auth.errDepartment";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!validate()) return;

    if (isForgot) {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      setLoading(false);

      setMessage(
        error
          ? { type: "error", key: "auth.resetFail" }
          : { type: "success", key: "auth.resetSent" }
      );
      return;
    }

    if (onAuth) {
      setLoading(true);
      const result = await onAuth({
        name: name.trim(),
        email: email.trim(),
        password,
        department_id: departmentId,
        mode: authMode,
      });
      setLoading(false);

      if (result?.errorKey) {
        setMessage({ type: "error", key: result.errorKey });
      }
    }
  };

  const fieldError = (field) =>
    errors[field] ? <div className="field-error">{tr(errors[field])}</div> : null;

  return (
    <div className="login-overlay" id="loginModal">
      <div className="login-popup-wrapper">
        <div className="title-container">
          <h2>{isForgot ? tr("auth.forgotTitle") : tr("auth.title")}</h2>
          <div className="title-divider"></div>
        </div>

        <p>{isForgot ? tr("auth.forgotIntro") : tr("auth.intro")}</p>

        <form id="authForm" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <>
              <input
                type="text"
                id="userInput"
                placeholder={tr("auth.namePh")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "input-error" : ""}
              />
              {fieldError("name")}
            </>
          )}

          <input
            type="email"
            id="userEmailInput"
            placeholder={tr("auth.emailPh")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "input-error" : ""}
          />
          {fieldError("email")}

          {!isForgot && (
            <>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="userPasswordInput"
                  placeholder={tr("auth.passwordPh")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? tr("auth.hidePwd") : tr("auth.showPwd")}
                  title={showPassword ? tr("auth.hidePwd") : tr("auth.showPwd")}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldError("password")}
            </>
          )}

          {isSignup && (
            <>
              <select
                id="userDepartmentInput"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className={errors.department ? "input-error" : ""}
              >
                <option value="" disabled>{tr("auth.departmentPh")}</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {fieldError("department")}
            </>
          )}

          {isLogin && (
            <button type="button" className="forgot-link" onClick={() => changeMode("forgot")}>
              {tr("auth.forgotLink")}
            </button>
          )}

          {message && (
            <div className={`auth-message ${message.type}`} role="alert">
              {tr(message.key)}
            </div>
          )}

          <button type="submit" id="submitBtn" disabled={loading}>
            {loading
              ? tr("auth.wait")
              : isForgot
              ? tr("auth.submitForgot")
              : isSignup
              ? tr("auth.submitSignup")
              : tr("auth.submitLogin")}
          </button>
        </form>

        <img src="/stella.png" alt="Stella" className="stella-img" id="stellaImg" />

        <div className="auth-mode-switch">
          {isForgot ? (
            <button type="button" onClick={() => changeMode("login")}>
              {tr("auth.backToLogin")}
            </button>
          ) : isLogin ? (
            <>
              <span>{tr("auth.noAccount")}</span>
              <button type="button" onClick={() => changeMode("signup")}>
                {tr("auth.createAccount")}
              </button>
            </>
          ) : (
            <>
              <span>{tr("auth.haveAccount")}</span>
              <button type="button" onClick={() => changeMode("login")}>
                {tr("auth.signIn")}
              </button>
            </>
          )}
        </div>

        {/* Sélecteur de langue discret, centré en bas */}
        <div className="auth-lang-bottom">
          <button
            type="button"
            className={lang === "fr" ? "active" : ""}
            onClick={() => setLang("fr")}
          >
            FR
          </button>
          <span>|</span>
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;