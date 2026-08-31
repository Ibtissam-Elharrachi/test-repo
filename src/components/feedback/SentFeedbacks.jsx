import React, { useEffect, useState } from "react";

import { getSentFeedbacks } from "../../services/feedbackService";

function SentFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSentFeedbacks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getSentFeedbacks();

        setFeedbacks(data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des feedbacks envoyés:",
          error
        );

        setError(
          "Impossible de charger vos feedbacks envoyés."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSentFeedbacks();
  }, []);

  if (isLoading) {
    return (
      <div className="feedback-list-loading">
        Chargement de vos feedbacks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-list-error">
        {error}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="feedback-list-empty">
        Vous n'avez encore envoyé aucun feedback.
      </div>
    );
  }

  return (
    <div className="feedback-list">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="feedback-list-item"
        >
          <div className="feedback-user">
            <img
              src={
                feedback.recipient?.avatar_url ||
                "/default-avatar.png"
              }
              alt={feedback.recipient?.full_name}
              className="feedback-user-avatar"
            />

            <div className="feedback-user-info">
              <strong>
                {feedback.recipient?.full_name}
              </strong>

              <span>
                {feedback.recipient?.email}
              </span>

              <small>
                {feedback.recipient?.department?.name ||
                  "Département non renseigné"}
              </small>
            </div>
          </div>

          <div className="feedback-content">
            <span className={`feedback-type ${feedback.type}`}>
              {feedback.type}
            </span>

            <p>{feedback.content}</p>

            <span className="feedback-sentiment">
              {feedback.sentiment}
            </span>
          </div>

          <div className="feedback-date">
            {new Date(
              feedback.created_at
            ).toLocaleDateString("fr-FR")}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SentFeedbacks;
