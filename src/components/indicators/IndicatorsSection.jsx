import React, { useEffect, useState, useCallback } from "react";
import "../../styles/indicators.css";
import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../services/supabaseClient";

// Réglages d'affichage (modifiables) :
// fontSize = taille par rapport à "4" et "1" (1em = identique), fontWeight = épaisseur (400 fin, 600 moyen, 800 très gras)
const SCORE_STYLE = { fontSize: "0.85em", fontWeight: 600 };
const LAST_INTERACTION_STYLE = { fontSize: "0.7em", fontWeight: 600 };

const IndicatorsSection = ({ onOpenFeedbackList, user }) => {
  const { t, lang } = useLanguage();

  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadIndicators = useCallback(async () => {
    try {
      setError(null);

      const { data, error: rpcError } = await supabase.rpc("get_my_indicators");

      if (rpcError) throw rpcError;

      setIndicators(data);
    } catch (err) {
      console.error("Erreur lors du chargement des indicateurs:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadIndicators();
  }, [user?.id, loadIndicators]);

  // Rafraîchit les indicateurs juste après l'envoi d'un feedback
  useEffect(() => {
    if (!user?.id) return;

    const refresh = () => loadIndicators();
    window.addEventListener("feedback:sent", refresh);

    return () => window.removeEventListener("feedback:sent", refresh);
  }, [user?.id, loadIndicators]);

  const formatLastInteraction = (date) => {
    if (!date) {
      return "—";
    }

    const diffMs = Date.now() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return t("indicators.justNow");
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} ${t("indicators.minutes")}`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} ${t("indicators.hours")}`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} ${t("indicators.days")}`;
  };

  // Un clic sur "Score global" descend vers la section historique du score
  const goToScoreHistory = () => {
    document
      .getElementById("indicateurs")
      ?.nextElementSibling?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (error) {
    return (
      <section className="section-card" id="indicateurs">
        <div className="indicators-error">{t("indicators.loadError")}</div>
      </section>
    );
  }

  // Display Score Evolution to UI
  const displayScoreEvolution = () => {
    const evolutionValue = indicators?.evolutionPercentage;

    return evolutionValue === null || evolutionValue === undefined
      ? "—"
      : `${evolutionValue >= 0 ? "+" : ""}${Number(evolutionValue).toFixed(0)}%`;
  };

  const globalScore = indicators?.globalScore;

  return (
    <section className="section-card" id="indicateurs">
      <div className="indicators-header">
        <div className="indicators-header-left">
          <div className="section-icon-wrapper">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0066cc"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 14l3-3" />
              <path d="M3.34 19a10 10 0 1 1 17.32 0" />
              <circle cx="12" cy="14" r="2" />
            </svg>
          </div>

          <h3 className="box-main-title title-with-orange-line">
            {t("indicators.title")}
          </h3>
        </div>
      </div>

      <div className="indicators-grid">
        {/* SCORE GLOBAL */}
        <div className="indicator-card clickable" onClick={goToScoreHistory}>
          <div className="indicator-card-top">
            <div className="indicator-icon-circle">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066cc"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            <span className="indicator-card-title">{t("indicators.global")}</span>
          </div>

          <div>
            <div className="indicator-value">
              <span style={SCORE_STYLE}>
                {loading
                  ? "..."
                  : globalScore !== null && globalScore !== undefined
                    ? `${Number(globalScore).toFixed(2)} / 5`
                    : "—"}
              </span>
            </div>

            <div className="click-hint">
              {lang === "fr"
                ? "Cliquez pour voir l'historique →"
                : "Click to see the history →"}
            </div>
          </div>
        </div>

        {/* FEEDBACK ENVOYÉS */}
        <div
          className="indicator-card clickable"
          onClick={() => onOpenFeedbackList?.("envoyes")}
        >
          <div className="indicator-card-top">
            <div className="indicator-icon-circle">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066cc"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>

            <span className="indicator-card-title">{t("indicators.sent")}</span>
          </div>

          <div>
            <div className="indicator-value" id="envoyesCountDisplay">
              {loading ? "..." : indicators?.sentCount}
            </div>

            <div className="click-hint">{t("indicators.clickList")}</div>
          </div>
        </div>

        {/* FEEDBACK REÇUS */}
        <div
          className="indicator-card clickable"
          onClick={() => onOpenFeedbackList?.("recus")}
        >
          <div className="indicator-card-top">
            <div className="indicator-icon-circle">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066cc"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            <span className="indicator-card-title">{t("indicators.received")}</span>
          </div>

          <div>
            <div className="indicator-value" id="recusCountDisplay">
              {loading ? "..." : indicators?.receivedCount}
            </div>

            <div className="click-hint">{t("indicators.clickList")}</div>
          </div>
        </div>
      </div>

      {/* BOTTOM INDICATORS */}
      <div className="indicators-bottom-grid">
        {/* ÉVOLUTION */}
        <div className="indicator-card">
          <div className="indicator-card-top">
            <div className="indicator-icon-circle">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066cc"
                strokeWidth="2"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>

            <span className="indicator-card-title">{t("indicators.evolution")}</span>
          </div>

          <div>
            <div className="evolution-card-value">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>

              {displayScoreEvolution()}
            </div>

            <div className="evolution-subtext">{t("indicators.vsLastMonth")}</div>

            <div className="evolution-desc">{t("indicators.evolutionDesc")}</div>
          </div>
        </div>

        {/* DERNIÈRE INTERACTION */}
        <div className="indicator-card">
          <div className="indicator-card-top">
            <div className="indicator-icon-circle">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066cc"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <span className="indicator-card-title">
              {t("indicators.lastInteraction")}
            </span>
          </div>

          <div>
            <div className="indicator-value">
              <span style={LAST_INTERACTION_STYLE}>
                {loading ? "..." : formatLastInteraction(indicators?.lastInteraction)}
              </span>
            </div>

            <div className="time-subtext">
              {indicators?.lastInteraction
                ? t("indicators.lastInteractionDesc")
                : t("indicators.noInteraction")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndicatorsSection;