import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useLanguage } from "../../context/LanguageContext";

function ProfileModal({ user, onClose, onSaved }) {
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(user?.name || "");
  const [stellantisId, setStellantisId] = useState(user?.stellantis_id || "");
  const [departmentId, setDepartmentId] = useState(user?.department_id || "");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (fullName.trim().length < 2) {
      setMessage({ type: "error", text: t("profile.errName") });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        stellantis_id: stellantisId.trim() || null,
        department_id: departmentId || null,
      })
      .eq("id", user.id)
      .select()
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: t("profile.error") });
      return;
    }

    setMessage({ type: "success", text: t("profile.saved") });
    onSaved({
      name: data.full_name,
      stellantis_id: data.stellantis_id,
      department_id: data.department_id,
    });
  };

  return (
    <div
      className="login-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="login-popup-wrapper profile-modal">
        <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="title-container">
          <h2>{t("profile.title")}</h2>
          <div className="title-divider"></div>
        </div>

        <p>{t("profile.subtitle")}</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field-label">{t("profile.fullName")}</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <label className="field-label">{t("profile.email")}</label>
          <input type="email" value={user?.email || ""} disabled />

          <label className="field-label">{t("profile.department")}</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">{t("profile.departmentPh")}</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <label className="field-label">{t("profile.stellantisId")}</label>
          <input
            type="text"
            value={stellantisId}
            onChange={(e) => setStellantisId(e.target.value)}
          />

          {message && <div className={`auth-message ${message.type}`}>{message.text}</div>}

          <button type="submit" disabled={loading}>
            {loading ? t("profile.saving") : t("profile.save")}
          </button>
          <button type="button" className="secondary-btn" onClick={onClose}>
            {t("profile.cancel")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;