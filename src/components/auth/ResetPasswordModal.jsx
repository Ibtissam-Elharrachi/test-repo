import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";

function ResetPasswordModal({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({ type: "success", text: "Mot de passe mis à jour. Redirection..." });
    setTimeout(() => onDone && onDone(), 1500);
  };

  return (
    <div className="login-overlay">
      <div className="login-popup-wrapper">
        <div className="title-container">
          <h2>Nouveau mot de passe</h2>
          <div className="title-divider"></div>
        </div>

        <p>Choisissez un nouveau mot de passe pour votre compte.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {message && <div className={`auth-message ${message.type}`}>{message.text}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Veuillez patienter..." : "Enregistrer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordModal;