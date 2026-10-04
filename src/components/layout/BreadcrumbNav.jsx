import React from "react";
import { useLanguage } from "../../context/LanguageContext";

function BreadcrumbNav({ onFeedbackClick, onReceivedFeedbackClick }) {
  const { t } = useLanguage();

  const handleFeedbackClick = (event) => {
    event.preventDefault();
    if (onFeedbackClick) {
      onFeedbackClick();
    }
  };

  const handleReceivedFeedbackClick = (event) => {
    event.preventDefault();
    if (onReceivedFeedbackClick) {
      onReceivedFeedbackClick();
    }
  };

  return (
    <div className="breadcrumb-container">
      {/* BREADCRUMB LEFT */}
      <div className="breadcrumb-left">
        <a href="#top" title={t("nav.homeTitle")}>
          <svg className="breadcrumb-home-icon" viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
          </svg>
        </a>

        <svg className="breadcrumb-separator" viewBox="0 0 6 10">
          <path d="M1 1l4 4-4 4" />
        </svg>

        <a href="#top" className="current-page">
          {t("nav.home")}
        </a>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="breadcrumb-nav-links">
        <a href="#pourquoi-feedback">{t("nav.why")}</a>

        <a href="#donner-feedback" onClick={handleFeedbackClick}>
          {t("nav.give")}
        </a>

        <a href="#indicateurs">{t("nav.indicators")}</a>

        <a href="#feedbacks-recus" onClick={handleReceivedFeedbackClick}>
          {t("nav.received")}
          <span className="nav-count-badge" id="navReceivedBadge">
            +5
          </span>
        </a>

        <a href="#historique">{t("nav.history")}</a>
      </nav>
    </div>
  );
}

export default BreadcrumbNav;