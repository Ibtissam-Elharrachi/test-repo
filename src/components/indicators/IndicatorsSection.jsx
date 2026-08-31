import React, {useEffect, useState} from "react";
import "../../styles/indicators.css";

// IMPORT SERVICES 
import { getUserIndicators, getScoreEvolution } from "../../services/userService";


const IndicatorsSection = ({
  onOpenFeedbackList,
  user,
}) => {

  const [indicators, setIndicators] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scoreEvolution, setScoreEvolution] = useState(null);
  const [scoreEvolutionLoading, setScoreEvolutionLoading] = useState(false);
  const [scoreEvolutionError, setScoreEvolutionError] = useState(null);


  /*useEffect(() => {
    const loadIndicators = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getUserIndicators(user.id);

        setIndicators((previous) => ({
          ...previous,
          globalScore: data.globalScore,
          sentCount: data.sentCount,
          receivedCount: data.receivedCount,
          lastInteraction: data.lastInteraction,
        }));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des indicateurs:",
          error
        );

        setError(
          "Impossible de charger vos indicateurs."
        );
      } finally {
        setLoading(false);
      }
    };


    loadIndicators();
  }, [user?.id]);*/

  useEffect(() => {
  if (!user?.id) {
        setLoading(false);
        return;
  };

  const loadIndicators = async () => {
    try {
      setScoreEvolutionLoading(true);
      setScoreEvolutionError(null);

      setLoading(true);
      setError(null);

      const [indicatorData, evolutionData] = await Promise.all([
        getUserIndicators(user.id),
        getScoreEvolution(user.id),
      ]);

      setIndicators(indicatorData);
      setScoreEvolution(evolutionData);
    } catch (error) {
      setError(
          "Impossible de charger vos indicateurs."
        );
      setScoreEvolutionError(error);
    } finally {
      setScoreEvolutionLoading(false);
      setLoading(false);
    }
  };

  loadIndicators();
}, [user?.id]);



  const formatLastInteraction = (date) => {
    if (!date) {
      return "—";
    }

    const diffMs = Date.now() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return "À l'instant";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} j`;
  };

  if (error) {
    return (
      <section className="section-card" id="indicateurs">
        <div className="indicators-error">
          {error}
        </div>
      </section>
    );
  }

  // Display Score Evolution to UI
  const displayScoreEvolution = () => {
    const evolutionValue = scoreEvolution?.evolutionPercentage;

    const evolutionDisplay =
      evolutionValue === null || evolutionValue === undefined
        ? "—"
        : `${evolutionValue >= 0 ? "+" : ""}${evolutionValue.toFixed(0)}%`;

    return evolutionDisplay;

  }

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
            Mes indicateurs
          </h3>
        </div>
      </div>

      <div className="indicators-grid">
        {/* SCORE GLOBAL */}
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
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            <span className="indicator-card-title">
              Score global
            </span>
          </div>

          <div className="indicator-value">
            {loading
              ? "..."
              : indicators?.globalScore !== null
                ? `${Number(indicators?.globalScore).toFixed(2)} / 5`
                : "—"
            }
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

            <span className="indicator-card-title">
              Feedback envoyés
            </span>
          </div>

          <div>
            <div
              className="indicator-value"
              id="envoyesCountDisplay"
            >
              {loading
                ? "..."
                : indicators?.sentCount
              }
            </div>

            <div className="click-hint">
              Cliquez pour voir la liste →
            </div>
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

            <span className="indicator-card-title">
              Feedback reçus
            </span>
          </div>

          <div>
            <div
              className="indicator-value"
              id="recusCountDisplay"
            >
              {loading
                ? "..."
                : indicators?.receivedCount
              }
            </div>

            <div className="click-hint">
              Cliquez pour voir la liste →
            </div>
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

            <span className="indicator-card-title">
              Mon évolution
            </span>
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

            <div className="evolution-subtext">
              vs. mois dernier
            </div>

            <div className="evolution-desc">
              Votre score progresse continuellement grâce au feedback.
            </div>
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
              Dernière interaction
            </span>
          </div>

          <div>
            <div className="time-value">
              {loading
                ? "..."
                : formatLastInteraction(
                    indicators?.lastInteraction
                  )
              }
            </div>

            <div className="time-subtext">
              {indicators?.lastInteraction
                ? "Dernier feedback envoyé ou reçu"
                : "Aucune interaction"
              }
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default IndicatorsSection;
