import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

// IMPORT SERVICES
import {
  createFeedback,
  sentimentMap,
  feedbackTypeMap,
} from "../../services/feedbackService";
import { searchCollaborators } from "../../services/userService";

function SecureFooter({ style }) {
  const { t } = useLanguage();

  return (
    <div className="feedback-footer-row" style={style}>
      <div className="security-note">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0066cc"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>{t("feedback.secure")}</span>
      </div>

      <div className="teams-branding">
        <svg className="teams-official-logo" viewBox="0 0 48 48" fill="none">
          <path
            d="M37 12C37 10.34 35.66 9 34 9H24C22.34 9 21 10.34 21 12V36C21 37.66 22.34 39 24 39H34C35.66 39 37 37.66 37 36V12Z"
            fill="#5059C9"
          />
          <circle cx="34" cy="14" r="3" fill="#7B83EB" />
          <path
            d="M43 17C43 15.9 42.1 15 41 15H37V33H41C42.1 33 43 32.1 43 31V17Z"
            fill="#4B53BC"
          />
          <circle cx="39" cy="18" r="2" fill="#7B83EB" />
          <path
            d="M23 9H9C7.34 9 6 10.34 6 12V36C6 37.66 7.34 39 9 39H23V9Z"
            fill="#3F46A4"
          />
          <path d="M12 18H20V21H17.5V30H14.5V21H12V18Z" fill="white" />
        </svg>
        <span>Teams</span>
      </div>
    </div>
  );
}

function FeedbackSection() {
  const { t } = useLanguage();

  const [step, setStep] = useState("choice");
  const [feedbackType, setFeedbackType] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FEEDBACK COLLABORATORS SEARCH STATE
  const [users, setUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchError, setUserSearchError] = useState(null);

  const selectFeedbackCategory = (type) => {
    setFeedbackType(type);
    setStep("form");
  };

  const resetToChoiceStep = () => {
    setStep("choice");
    setFeedbackType(null);
    setSentiment(null);
    setFeedbackText("");
    setSearchValue("");
    setSelectedUser(null);
  };

  const selectSentiment = (value) => {
    setSentiment(value);
  };

  const handleSmartSearch = (value) => {
    setSearchValue(value);

    if (!value.trim()) {
      setSelectedUser(null);
    }
  };

  const clearSmartSearch = () => {
    setSearchValue("");
    setSelectedUser(null);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSearchValue(user.full_name);
    setUsers([]);
    setUserSearchError(null);
  };

  useEffect(() => {
    const searchUsers = async () => {
      const value = searchValue.trim();

      if (!value) {
        setUsers([]);
        setUserSearchError(null);
        return;
      }

      // Don't search while a user is already selected
      if (selectedUser) {
        return;
      }

      try {
        setIsSearchingUsers(true);
        setUserSearchError(null);

        const collaborators = await searchCollaborators(value);
        setUsers(collaborators);
      } catch (error) {
        console.error("Erreur lors de la recherche des collaborateurs:", error);

        setUsers([]);
        setUserSearchError("error");
      } finally {
        setIsSearchingUsers(false);
      }
    };

    const timeout = setTimeout(searchUsers, 300);

    return () => clearTimeout(timeout);
  }, [searchValue, selectedUser]);

  // CREATE NEW FEEDBACK
  const sendFeedback = async () => {
    if (!feedbackText.trim()) {
      alert(t("feedback.alertWrite"));
      return;
    }

    if (!sentiment) {
      alert(t("feedback.alertSentiment"));
      return;
    }

    if (!selectedUser) {
      alert(t("feedback.alertRecipient"));
      return;
    }

    try {
      setIsSubmitting(true);

      await createFeedback({
        recipientId: selectedUser.id,
        content: feedbackText.trim(),
        type: feedbackTypeMap[feedbackType],
        sentiment: sentimentMap[sentiment],
      });

      alert(t("feedback.alertSent"));

      setFeedbackText("");
      setSentiment(null);

      // Return to feedback type selection
      resetToChoiceStep();
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error);

      alert(error.message || t("feedback.alertError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOf = (user) =>
    user?.department_name || user?.departments?.name || t("feedback.noDepartment");

  return (
    <div className="section-card" id="donner-feedback">
      {/* ÉTAPE 1 : CHOIX DU TYPE DE FEEDBACK */}
      {step === "choice" && (
        <div id="feedbackStepChoice" className="feedback-type-selection-container">
          <div className="feedback-selection-header">
            <button
              className="back-btn-circle"
              title={t("feedback.back")}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <svg width="12" height="18" viewBox="0 0 10 16" fill="none">
                <path
                  d="M8.5 15L1.5 8L8.5 1"
                  stroke="#0066cc"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="type-title-block">
              <h2>{t("feedback.typeTitle")}</h2>

              <p>
                {t("feedback.typeSubtitle1")}
                <br />
                {t("feedback.typeSubtitle2")}
              </p>
            </div>
          </div>

          <div className="feedback-cards-grid">
            {/* FEEDBACK POSITIF */}
            <div
              className="feedback-choice-card"
              onClick={() => selectFeedbackCategory("positif")}
            >
              <div className="choice-icon-bg positif">
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="7"
                  />
                  <circle cx="34" cy="38" r="5" fill="#22c55e" />
                  <circle cx="66" cy="38" r="5" fill="#22c55e" />
                  <path
                    d="M 30 60 Q 50 80 70 60"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path d="M 75 22 L 78 15 L 85 12 L 78 9 L 75 2 Z" fill="#38bdf8" />
                  <path d="M 22 28 L 24 23 L 29 21 L 24 19 L 22 14 Z" fill="#38bdf8" />
                </svg>
              </div>

              <div className="choice-title positif">{t("feedback.positiveTitle")}</div>
              <div className="choice-desc">{t("feedback.positiveDesc")}</div>
              <div className="choice-arrow-btn positif">→</div>
            </div>

            {/* AXE D'AMÉLIORATION */}
            <div
              className="feedback-choice-card"
              onClick={() => selectFeedbackCategory("amelioration")}
            >
              <div className="choice-icon-bg amelioration">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#db2777"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>

              <div className="choice-title amelioration">{t("feedback.improveTitle")}</div>
              <div className="choice-desc">{t("feedback.improveDesc")}</div>
              <div className="choice-arrow-btn amelioration">→</div>
            </div>
          </div>

          <SecureFooter style={{ marginTop: "10px" }} />
        </div>
      )}

      {/* ÉTAPE 2 : FORMULAIRE */}
      {step === "form" && (
        <div id="feedbackStepForm">
          {/* HEADER */}
          <div className="feedback-header-title">
            <div className="header-left-title">
              <button
                className="back-btn-circle"
                onClick={resetToChoiceStep}
                title={t("feedback.changeType")}
              >
                <svg width="12" height="18" viewBox="0 0 10 16" fill="none">
                  <path
                    d="M8.5 15L1.5 8L8.5 1"
                    stroke="#0066cc"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <h3 className="box-main-title title-with-orange-line">
                {feedbackType === "positif"
                  ? t("feedback.positiveTitle")
                  : t("feedback.improveTitle")}
              </h3>
            </div>

            <div className="header-selected-emoji">
              {feedbackType === "positif" ? "😊" : "📈"}
            </div>
          </div>

          {/* TEXTAREA */}
          <div className="feedback-input-box">
            <textarea
              className="feedback-textarea"
              id="feedbackText"
              placeholder={t("feedback.placeholder")}
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
            />

            <button
              className="send-btn-icon"
              onClick={sendFeedback}
              disabled={isSubmitting}
              title={t("feedback.send")}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#0066cc">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          {/* SENTIMENT */}
          <div className="sentiment-question">{t("feedback.feeling")}</div>

          <div className="sentiment-options">
            {/* SATISFAIT */}
            <div
              className={`sentiment-item satisfait ${
                sentiment === "satisfait" ? "selected" : ""
              }`}
              onClick={() => selectSentiment("satisfait")}
            >
              <div className="emoji-svg-wrapper">
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#22c55e" strokeWidth="7" />
                  <circle cx="34" cy="38" r="5" fill="#22c55e" />
                  <circle cx="66" cy="38" r="5" fill="#22c55e" />
                  <path
                    d="M 30 60 Q 50 82 70 60"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="sentiment-label">{t("feedback.satisfied")}</span>
            </div>

            {/* NEUTRE */}
            <div
              className={`sentiment-item neutre ${
                sentiment === "neutre" ? "selected" : ""
              }`}
              onClick={() => selectSentiment("neutre")}
            >
              <div className="emoji-svg-wrapper">
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#0284c7" strokeWidth="7" />
                  <circle cx="34" cy="38" r="5" fill="#0284c7" />
                  <circle cx="66" cy="38" r="5" fill="#0284c7" />
                  <line
                    x1="30"
                    y1="65"
                    x2="70"
                    y2="65"
                    stroke="#0284c7"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="sentiment-label">{t("feedback.neutral")}</span>
            </div>

            {/* À AMÉLIORER */}
            <div
              className={`sentiment-item ameliorer ${
                sentiment === "ameliorer" ? "selected" : ""
              }`}
              onClick={() => selectSentiment("ameliorer")}
            >
              <div className="emoji-svg-wrapper">
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#ec4899" strokeWidth="7" />
                  <circle cx="34" cy="38" r="5" fill="#ec4899" />
                  <circle cx="66" cy="38" r="5" fill="#ec4899" />
                  <path
                    d="M 30 68 Q 50 48 70 68"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="sentiment-label">{t("feedback.improve")}</span>
            </div>
          </div>

          {/* RECIPIENT QUESTION */}
          <div className="sentiment-question">{t("feedback.recipientQuestion")}</div>

          <div className="recipient-section">
            {/* SEARCH */}
            <div className="search-user-wrapper">
              <div className="smart-search-input-container">
                <svg className="search-icon-small" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16" y1="16" x2="21" y2="21" />
                </svg>

                <input
                  type="text"
                  id="targetUserSearch"
                  className="smart-search-input"
                  placeholder={t("feedback.searchPlaceholder")}
                  value={searchValue}
                  onChange={(event) => handleSmartSearch(event.target.value)}
                />

                <button className="clear-search-btn" onClick={clearSmartSearch}>
                  ✕
                </button>
              </div>

              {isSearchingUsers && (
                <div className="search-loading">{t("feedback.searching")}</div>
              )}

              {userSearchError && (
                <div className="search-error">{t("feedback.searchError")}</div>
              )}

              {/* AUTOCOMPLETE */}
              {searchValue.trim() && users.length > 0 && !selectedUser && (
                <div className="autocomplete-results" id="searchResultsDropdown">
                  {users.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="autocomplete-result-item"
                      onClick={() => selectUser(user)}
                    >
                      <img
                        src={
                          user.avatar_url ||
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
                        }
                        alt=""
                        className="autocomplete-user-avatar"
                      />

                      <div className="autocomplete-user-info">
                        <strong>{user.full_name}</strong>
                        <span>{user.email}</span>
                        <small>{departmentOf(user)}</small>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ARROW */}
            <div className="flow-arrow-icon">
              <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                <path
                  d="M0 6H26M26 6L21 1M26 6L21 11"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>

            {/* SELECTED USER */}
            <div
              className={`selected-user-card ${selectedUser ? "has-user" : "empty"}`}
              id="selectedUserCard"
            >
              <div className="user-avatar-wrapper">
                <img
                  src={selectedUser?.avatar_url || "/icone compte femme.png"}
                  alt={selectedUser?.full_name || t("feedback.selectedAlt")}
                  className="user-avatar-img"
                />
              </div>

              <div className="user-details-text">
                <span className="user-name-text">
                  {selectedUser?.full_name || t("feedback.noRecipient")}
                </span>

                {selectedUser && (
                  <>
                    <span className="user-email-text">{selectedUser.email}</span>
                    <span className="user-dept-text">{departmentOf(selectedUser)}</span>
                  </>
                )}
              </div>

              {selectedUser && (
                <svg className="selected-check-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 5-6" />
                </svg>
              )}
            </div>
          </div>

          <SecureFooter />
        </div>
      )}
    </div>
  );
}

export default FeedbackSection;