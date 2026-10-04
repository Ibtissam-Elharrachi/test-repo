import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

import {
  getSentFeedbacks,
  getReceivedFeedbacks,
} from "../../services/feedbackService";

import "../../styles/indicators.css";

function FeedbackListModal({ type, onClose }) {
  const { lang, t } = useLanguage();

  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load Feedbacks
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data = [];
        if (type === "envoyes") {
          data = await getSentFeedbacks();
        } else if (type === "recus") {
          data = await getReceivedFeedbacks();
        }

        setFeedbacks(data);
      } catch (err) {
        console.error("Erreur lors du chargement des feedbacks:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, [type]);

  // ESCAPE KEY
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // BACKGROUND CLICK
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const title = type === "envoyes" ? t("list.sentTitle") : t("list.receivedTitle");
  const description = type === "envoyes" ? t("list.sentDesc") : t("list.receivedDesc");

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // GET AVATAR FROM GENDER
  const getCurrentPersonGender = (person) => {
    const userGender = person?.gender || "FEMALE";

    return userGender === "MALE"
      ? "/icone compte homme.png"
      : "/icone compte femme.png";
  };

  const getFeedbackTypeLabel = (feedbackType) => {
    if (feedbackType === "POSITIVE") return t("list.positive");
    if (feedbackType === "IMPROVEMENT") return t("list.improvement");
    return feedbackType;
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment === "SATISFAIT") return t("list.satisfied");
    if (sentiment === "NEUTRE") return t("list.neutral");
    if (sentiment === "AMELIORER") return t("list.improve");
    return sentiment;
  };

  const getSentimentClass = (sentiment) => {
    if (sentiment === "SATISFAIT") return "satisfait";
    if (sentiment === "NEUTRE") return "neutre";
    if (sentiment === "AMELIORER") return "ameliorer";
    return "";
  };

  return (
    <div className="feedback-list-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="feedback-list-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-list-modal-title"
      >
        {/* HEADER */}
        <div className="feedback-list-modal-header">
          <div>
            <h2 id="feedback-list-modal-title" className="feedback-list-modal-title">
              {title}
            </h2>

            <p className="feedback-list-modal-description">{description}</p>
          </div>

          <button
            type="button"
            className="feedback-list-modal-close"
            onClick={onClose}
            aria-label={t("list.close")}
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="feedback-list-modal-content">
          {/* LOADING */}
          {isLoading && (
            <div className="feedback-list-state">
              <div className="feedback-list-spinner"></div>
              <p>{t("list.loading")}</p>
            </div>
          )}

          {/* ERROR */}
          {!isLoading && error && (
            <div className="feedback-list-state error">
              <div className="feedback-list-state-icon">!</div>
              <p>{t("list.error")}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="feedback-list-retry-btn"
              >
                {t("list.retry")}
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !error && feedbacks.length === 0 && (
            <div className="feedback-list-state">
              <div className="feedback-list-empty-icon">💬</div>
              <h3>{t("list.emptyTitle")}</h3>
              <p>
                {type === "envoyes" ? t("list.emptySent") : t("list.emptyReceived")}
              </p>
            </div>
          )}

          {/* FEEDBACK LIST */}
          {!isLoading && !error && feedbacks.length > 0 && (
            <div className="feedback-list">
              {feedbacks.map((feedback) => {
                const person =
                  type === "envoyes" ? feedback.recipient : feedback.sender;

                return (
                  <article key={feedback.id} className="feedback-list-card">
                    {/* USER */}
                    <div className="feedback-list-card-header">
                      <div className="feedback-list-user">
                        <img
                          src={getCurrentPersonGender(person)}
                          alt={person?.full_name || t("list.user")}
                          className="feedback-list-avatar"
                        />

                        <div className="feedback-list-user-info">
                          <strong>{person?.full_name || t("list.user")}</strong>

                          <span>{person?.email || ""}</span>

                          <small>
                            {person?.department?.name || t("list.noDepartment")}
                          </small>
                        </div>
                      </div>

                      {/* DATE */}
                      <time
                        className="feedback-list-date"
                        dateTime={feedback.created_at}
                      >
                        {formatDate(feedback.created_at)}
                      </time>
                    </div>

                    {/* BADGES */}
                    <div className="feedback-list-badges">
                      <span
                        className={`feedback-type-badge ${
                          feedback.type === "POSITIVE" ? "positive" : "improvement"
                        }`}
                      >
                        {getFeedbackTypeLabel(feedback.type)}
                      </span>

                      <span
                        className={`feedback-sentiment-badge ${getSentimentClass(
                          feedback.sentiment
                        )}`}
                      >
                        {getSentimentLabel(feedback.sentiment)}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="feedback-list-message">
                      <p>{feedback.content}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="feedback-list-modal-footer">
          <span>
            {feedbacks.length}{" "}
            {feedbacks.length > 1 ? t("list.many") : t("list.one")}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="feedback-list-modal-footer-btn"
          >
            {t("list.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackListModal;