import React from "react";
import { useLanguage } from "../../context/LanguageContext";

function BreadcrumbNav({ onFeedbackClick, onReceivedFeedbackClick, unreadCount = 0 }) {
  const { t } = useLanguage();

  const handleFeedbackClick = (event) => {
    event.preventDefault();
    onFeedbackClick?.();
  };

  const handleReceivedFeedbackClick = (event) => {
    event.preventDefault();
    onReceivedFeedbackClick?.();
  };

  return (
    <div className="breadcrumb-container">
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

      <nav className="breadcrumb-nav-links">
        <a href="#pourquoi-feedback">{t("nav.why")}</a>

        <a href="#donner-feedback" onClick={handleFeedbackClick}>
          {t("nav.give")}
        </a>

        <a href="#indicateurs">{t("nav.indicators")}</a>

        <a href="#feedbacks-recus" onClick={handleReceivedFeedbackClick}>
          {t("nav.received")}
          {unreadCount > 0 && (
            <span className="nav-count-badge" id="navReceivedBadge">
              +{unreadCount}
            </span>
          )}
        </a>

        <a href="#historique">{t("nav.history")}</a>
      </nav>
    </div>
  );
}

export default BreadcrumbNav;