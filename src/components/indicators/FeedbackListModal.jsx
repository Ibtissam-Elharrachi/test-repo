import React, { useEffect, useState } from "react";

import {
  getSentFeedbacks,
  getReceivedFeedbacks,
} from "../../services/feedbackService";

import "../../styles/indicators.css";


function FeedbackListModal({
  type,
  onClose,
}) {
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

      } catch (error) {
        console.error(
          "Erreur lors du chargement des feedbacks:",
          error
        );
        setError(
          "Impossible de charger les feedbacks."
        );

      } finally {
        setIsLoading(false);
      }
    };


    loadFeedbacks();
  }, [type]);


  // ==========================================================
  // ESCAPE KEY
  // ==========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };

  }, [onClose]);


  // ==========================================================
  // BACKGROUND CLICK
  // ==========================================================

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };


  // ==========================================================
  // TITLE
  // ==========================================================

  const title =
    type === "envoyes"
      ? "Mes feedbacks envoyés"
      : "Mes feedbacks reçus";


  const description =
    type === "envoyes"
      ? "Retrouvez les feedbacks que vous avez envoyés à vos collaborateurs."
      : "Retrouvez les feedbacks reçus de vos collaborateurs.";


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };

  // GET CURRENT USER GENDER TYPE
  const getCurrentPersonGender = (person) => {
     const userGender = person?.gender || "FEMALE";

    const avatar =
    userGender === "MALE"
    ? "/icone compte homme.png"
    : "/icone compte femme.png";

    return avatar;
  }


  // ==========================================================
  // FEEDBACK TYPE LABEL
  // ==========================================================

  const getFeedbackTypeLabel = (feedbackType) => {
    if (feedbackType === "POSITIVE") {
      return "Feedback positif";
    }

    if (feedbackType === "IMPROVEMENT") {
      return "Axe d’amélioration";
    }

    return feedbackType;

  };


  // ==========================================================
  // SENTIMENT LABEL
  // ==========================================================

  const getSentimentLabel = (sentiment) => {
    if (sentiment === "SATISFAIT") {
      return "Satisfait";
    }
    if (sentiment === "NEUTRE") {
      return "Neutre";
    }

    if (sentiment === "AMELIORER") {
      return "À améliorer";
    }

    return sentiment;

  };


  // ==========================================================
  // SENTIMENT CLASS
  // ==========================================================

  const getSentimentClass = (sentiment) => {

    if (sentiment === "SATISFAIT") {
      return "satisfait";
    }

    if (sentiment === "NEUTRE") {
      return "neutre";
    }

    if (sentiment === "AMELIORER") {
      return "ameliorer";
    }

    return "";

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="feedback-list-modal-overlay"
      onClick={handleOverlayClick}
    >

      <div
        className="feedback-list-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-list-modal-title"
      >

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="feedback-list-modal-header">

          <div>

            <h2
              id="feedback-list-modal-title"
              className="feedback-list-modal-title"
            >
              {title}
            </h2>

            <p className="feedback-list-modal-description">
              {description}
            </p>

          </div>


          <button
            type="button"
            className="feedback-list-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>

        </div>


        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="feedback-list-modal-content">

          {/* LOADING */}

          {isLoading && (
            <div className="feedback-list-state">
              <div className="feedback-list-spinner"></div>
              <p>
                Chargement des feedbacks...
              </p>
            </div>

          )}

          {/* ERROR */}

          {!isLoading && error && (
            <div className="feedback-list-state error">
              <div className="feedback-list-state-icon">
                !
              </div>
              <p>
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="feedback-list-retry-btn"
              >
                Réessayer
              </button>

            </div>

          )}


          {/* EMPTY */}

          {!isLoading &&
            !error &&
            feedbacks.length === 0 && (
              <div className="feedback-list-state">
                <div className="feedback-list-empty-icon">
                  💬
                </div>
                <h3>
                  Aucun feedback
                </h3>
                <p>
                  {type === "envoyes"
                    ? "Vous n'avez encore envoyé aucun feedback."
                    : "Vous n'avez encore reçu aucun feedback."}
                </p>

              </div>

          )}


          {/* FEEDBACK LIST */}
          {!isLoading &&
            !error &&
            feedbacks.length > 0 && (
              <div className="feedback-list">
                {feedbacks.map((feedback) => {
                  const person =
                    type === "envoyes"
                      ? feedback.recipient
                      : feedback.sender;

                  return (

                    <article
                      key={feedback.id}
                      className="feedback-list-card"
                    >

                      {/* ================================= */}
                      {/* USER */}
                      {/* ================================= */}

                      <div className="feedback-list-card-header">
                        <div className="feedback-list-user">

                          <img
                            src={
                             getCurrentPersonGender(person)
                            }
                            alt={
                              person?.full_name ||
                              "Utilisateur"
                            }
                            className="feedback-list-avatar"
                          />


                          <div className="feedback-list-user-info">

                            <strong>
                              {person?.full_name ||
                                "Utilisateur"}
                            </strong>

                            <span>
                              {person?.email || ""}
                            </span>

                            <small>
                              {person?.department?.name ||
                                "Département non renseigné"}
                            </small>

                          </div>

                        </div>


                        {/* DATE */}

                        <time
                          className="feedback-list-date"
                          dateTime={feedback.created_at}
                        >
                          {formatDate(
                            feedback.created_at
                          )}
                        </time>

                      </div>


                      {/* ================================= */}
                      {/* BADGES */}
                      {/* ================================= */}

                      <div className="feedback-list-badges">

                        <span
                          className={`feedback-type-badge ${
                            feedback.type === "POSITIVE"
                              ? "positive"
                              : "improvement"
                          }`}
                        >
                          {getFeedbackTypeLabel(
                            feedback.type
                          )}
                        </span>


                        <span
                          className={`feedback-sentiment-badge ${getSentimentClass(
                            feedback.sentiment
                          )}`}
                        >
                          {getSentimentLabel(
                            feedback.sentiment
                          )}
                        </span>

                      </div>


                      {/* ================================= */}
                      {/* CONTENT */}
                      {/* ================================= */}

                      <div className="feedback-list-message">

                        <p>
                          {feedback.content}
                        </p>

                      </div>

                    </article>

                  );

                })}

              </div>

          )}

        </div>


        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="feedback-list-modal-footer">

          <span>
            {feedbacks.length}{" "}
            {feedbacks.length > 1
              ? "feedbacks"
              : "feedback"}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="feedback-list-modal-footer-btn"
          >
            Fermer
          </button>

        </div>

      </div>

    </div>

  );

}


export default FeedbackListModal;
