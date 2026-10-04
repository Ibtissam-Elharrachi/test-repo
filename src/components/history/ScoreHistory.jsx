import React, { useState, useEffect } from "react";
import "../../styles/history.css";
import { useLanguage } from "../../context/LanguageContext";

// IMPORT SERVICES
import { getScoreHistory } from "../../services/userService";

const FILTERS = ["1M", "3M", "1A", "TOUT"];

const ScoreHistory = ({ user }) => {
  const { lang, t } = useLanguage();

  const [selectedRange, setSelectedRange] = useState("TOUT");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadScoreHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getScoreHistory(user?.id, selectedRange);

        setHistory(data);
      } catch (err) {
        console.error("Error loading score history:", err);
        setError(err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadScoreHistory();
  }, [user?.id, selectedRange]);

  const dateLocale = lang === "en" ? "en-GB" : "fr-FR";

  const chartData = history.map((item) => ({
    score: Number(item.score),
    recordedAt: new Date(item.recorded_at),
  }));

  const latestScore =
    chartData.length > 0 ? chartData[chartData.length - 1].score : null;

  const previousScore =
    chartData.length > 1 ? chartData[chartData.length - 2].score : null;

  const scoreChange =
    latestScore !== null && previousScore !== null
      ? latestScore - previousScore
      : null;

  const scoreChangeLabel =
    scoreChange === null
      ? "—"
      : `${scoreChange >= 0 ? "+" : ""}${scoreChange.toFixed(2)}`;

  const chartWidth = 605;
  const chartHeight = 180;

  const minScore = 1;
  const maxScore = 5;

  const getY = (score) => {
    const normalized = (score - minScore) / (maxScore - minScore);
    return 200 - normalized * chartHeight;
  };

  const getX = (index) => {
    if (chartData.length <= 1) {
      return 10;
    }

    return 10 + (index / (chartData.length - 1)) * chartWidth;
  };

  const chartPoints = chartData.map((item, index) => ({
    x: getX(index),
    y: getY(item.score),
    score: item.score,
    date: item.recordedAt,
  }));

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    chartPoints.length > 0
      ? `
      ${linePath}
      L ${chartPoints[chartPoints.length - 1].x} 200
      L ${chartPoints[0].x} 200
      Z
    `
      : "";

  const formatDate = (date) =>
    date.toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="section-card" id="historique">
      {/* HEADER */}
      <div className="history-header">
        <div className="history-header-left">
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
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <path d="M4 11l4-4 4 4 6-6" />
            </svg>
          </div>

          <div className="history-title-group">
            <h3 className="box-main-title title-with-orange-line">
              {t("history.title")}
            </h3>

            <p>{t("history.subtitle")}</p>
          </div>
        </div>

        {/* SCORE CHANGE */}
        <div
          className={
            scoreChange === null
              ? "neutral-change-badge"
              : scoreChange > 0
                ? "positive-change-badge"
                : scoreChange < 0
                  ? "negative-change-badge"
                  : "neutral-change-badge"
          }
        >
          {scoreChange !== null && scoreChange !== 0 && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              {scoreChange > 0 ? (
                <polyline points="6 15 12 9 18 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          )}

          {scoreChangeLabel}
        </div>
      </div>

      {/* CHART */}
      <div className="chart-box-frame">
        {!loading && !error && history.length === 0 && (
          <div className="history-empty-state">{t("history.empty")}</div>
        )}

        {loading && <div className="history-loading">{t("history.loading")}</div>}

        {error && <div className="history-error">{t("history.error")}</div>}

        <svg
          className="chart-svg-container"
          viewBox="0 0 700 240"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="grid" width="700" height="42" patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1="0"
                x2="700"
                y2="0"
                stroke="#e2e8f0"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            </pattern>

            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* GRID */}
          <rect width="640" height="210" fill="url(#grid)" />

          {/* Y-AXIS VALUES */}
          {[
            { y: 15, label: "5.0" },
            { y: 60, label: "4.0" },
            { y: 105, label: "3.0" },
            { y: 150, label: "2.0" },
            { y: 195, label: "1.0" },
          ].map((tick) => (
            <text
              key={tick.label}
              x="670"
              y={tick.y}
              className="chart-date-label"
              fontSize="13"
              fill="#64748b"
            >
              {tick.label}
            </text>
          ))}

          {/* AREA */}
          {chartPoints.length > 0 && <path d={areaPath} fill="url(#blueGradient)" />}

          {/* LINE */}
          {chartPoints.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke="#1d70f5"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* CURRENT POINT */}
          {chartPoints.length > 0 && (
            <circle
              cx={chartPoints[chartPoints.length - 1].x}
              cy={chartPoints[chartPoints.length - 1].y}
              r="6"
              fill="#1d70f5"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          )}
        </svg>

        {/* DATES */}
        <div className="chart-dates-row">
          {chartPoints.length > 0 && (
            <>
              <span className="chart-date-label">{formatDate(chartPoints[0].date)}</span>

              <span className="chart-date-label">
                {formatDate(chartPoints[chartPoints.length - 1].date)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="filter-buttons-row">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`time-filter-btn ${selectedRange === filter ? "active" : ""}`}
            onClick={() => setSelectedRange(filter)}
          >
            {t(`history.filters.${filter}`)}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ScoreHistory;