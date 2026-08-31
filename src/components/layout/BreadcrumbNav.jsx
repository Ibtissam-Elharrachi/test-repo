import React from "react";

function BreadcrumbNav({ onFeedbackClick, onReceivedFeedbackClick }) {

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
    <a
      href="#top"
      title="Accueil / Haut de page"
    >
      <svg
        className="breadcrumb-home-icon"
        viewBox="0 0 24 24"
      >
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    </a>
    <svg
      className="breadcrumb-separator"
      viewBox="0 0 6 10"
    >
      <path d="M1 1l4 4-4 4" />
    </svg>
    <a
      href="#top"
      className="current-page"
    >
      Accueil
    </a>

  </div>

  {/* NAVIGATION LINKS */}
  <nav className="breadcrumb-nav-links">

    <a href="#pourquoi-feedback">
      Pourquoi le feedback ?
    </a>

    <a
      href="#donner-feedback"
      onClick={handleFeedbackClick}
    >
      Donner un feedback
    </a>

    <a href="#indicateurs">
      Mes indicateurs
    </a>

    <a
      href="#feedbacks-recus"
      onClick={handleReceivedFeedbackClick}
    >
      Feedbacks reçus

      <span
        className="nav-count-badge"
        id="navReceivedBadge"
      >
        +5
      </span>
    </a>

    <a href="#historique">
      Historique de mes scores
    </a>


  </nav>

</div>


);
}

export default BreadcrumbNav;