import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { translate } from "../../i18n";

function ResetPasswordModal({ onDone }) {
  const tr = (key) => translate("fr", key);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: "error", text: tr("reset.short") });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: tr("reset.mismatch") });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: tr("errors.generic") });
      return;
    }

    setMessage({ type: "success", text: tr("reset.success") });
    setTimeout(() => onDone && onDone(), 1500);
  };

  return (
    <div className="login-overlay">
      <div className="login-popup-wrapper">
        <div className="title-container">
          <h2>{tr("reset.title")}</h2>
          <div className="title-divider"></div>
        </div>

        <p>{tr("reset.intro")}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder={tr("reset.newPh")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={tr("reset.confirmPh")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {message && <div className={`auth-message ${message.type}`}>{message.text}</div>}

          <button type="submit" disabled={loading}>
            {loading ? tr("reset.wait") : tr("reset.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordModal;