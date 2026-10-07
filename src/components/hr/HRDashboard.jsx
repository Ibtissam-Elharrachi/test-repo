import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useLanguage } from "../../context/LanguageContext";
import "./HRDashboard.css";

function HRDashboard() {
  const { t, lang } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [search, setSearch] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setHasError(false);

    const { data, error } = await supabase.rpc("hr_dashboard_stats");

    if (error) {
      console.error("Erreur dashboard RH:", error);
      setHasError(true);
      setLoading(false);
      return;
    }

    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const people = useMemo(() => {
    const list = stats?.people || [];
    const query = search.trim().toLowerCase();
    if (!query) return list;

    return list.filter((person) =>
      [person.full_name, person.email, person.department]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [stats, search]);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatDay = (value) =>
    new Date(value).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
      day: "2-digit",
      month: "short",
    });

  const totals = stats?.totals;
  const byDay = stats?.by_day || [];
  const byDepartment = stats?.by_department || [];

  const participation =
    totals && totals.users > 0
      ? Math.round((totals.senders / totals.users) * 100)
      : 0;

  const maxPerDay = Math.max(
    1,
    ...byDay.map((day) => day.positive + day.improvement)
  );

  return (
    <section className="section-card hr-dashboard" id="dashboard-rh">
      <div className="hr-header">
        <div>
          <h3 className="box-main-title title-with-orange-line">{t("hr.title")}</h3>
          <p className="hr-subtitle">{t("hr.subtitle")}</p>
        </div>

        <button type="button" className="hr-refresh" onClick={loadStats} disabled={loading}>
          {t("hr.refresh")}
        </button>
      </div>

      {loading && !stats && <p className="hr-state">{t("hr.loading")}</p>}
      {hasError && <p className="hr-state hr-state-error">{t("hr.error")}</p>}

      {totals && (
        <>
          {/* INDICATEURS */}
          <div className="hr-kpis">
            <div className="hr-kpi">
              <span className="hr-kpi-value">{totals.users}</span>
              <span className="hr-kpi-label">{t("hr.kpiUsers")}</span>
            </div>
            <div className="hr-kpi">
              <span className="hr-kpi-value">{totals.feedbacks}</span>
              <span className="hr-kpi-label">{t("hr.kpiFeedbacks")}</span>
            </div>
            <div className="hr-kpi">
              <span className="hr-kpi-value">{totals.last_30_days}</span>
              <span className="hr-kpi-label">{t("hr.kpiLast30")}</span>
            </div>
            <div className="hr-kpi">
              <span className="hr-kpi-value">{participation}%</span>
              <span className="hr-kpi-label">{t("hr.kpiParticipation")}</span>
            </div>
            <div className="hr-kpi positive">
              <span className="hr-kpi-value">{totals.positive}</span>
              <span className="hr-kpi-label">{t("hr.kpiPositive")}</span>
            </div>
            <div className="hr-kpi improvement">
              <span className="hr-kpi-value">{totals.improvement}</span>
              <span className="hr-kpi-label">{t("hr.kpiImprovement")}</span>
            </div>
          </div>

          {/* GRAPHIQUE 30 JOURS */}
          <div className="hr-block">
            <div className="hr-block-head">
              <h4>{t("hr.chartTitle")}</h4>
              <div className="hr-legend">
                <span><i className="dot positive" />{t("hr.legendPositive")}</span>
                <span><i className="dot improvement" />{t("hr.legendImprovement")}</span>
              </div>
            </div>

            <div className="hr-chart">
              {byDay.map((day) => {
                const total = day.positive + day.improvement;
                return (
                  <div
                    key={day.day}
                    className="hr-bar-col"
                    title={`${formatDay(day.day)} : ${total}`}
                  >
                    <div className="hr-bar-stack">
                      <div
                        className="hr-bar improvement"
                        style={{ height: `${(day.improvement / maxPerDay) * 100}%` }}
                      />
                      <div
                        className="hr-bar positive"
                        style={{ height: `${(day.positive / maxPerDay) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hr-chart-axis">
              <span>{byDay.length > 0 ? formatDay(byDay[0].day) : ""}</span>
              <span>{byDay.length > 0 ? formatDay(byDay[byDay.length - 1].day) : ""}</span>
            </div>
          </div>

          {/* PAR DÉPARTEMENT */}
          <div className="hr-block">
            <h4>{t("hr.deptTitle")}</h4>

            <div className="hr-table-wrap">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>{t("hr.colDepartment")}</th>
                    <th>{t("hr.colUsers")}</th>
                    <th>{t("hr.colSent")}</th>
                    <th>{t("hr.colPositive")}</th>
                    <th>{t("hr.colImprovement")}</th>
                  </tr>
                </thead>
                <tbody>
                  {byDepartment.map((department) => (
                    <tr key={department.department}>
                      <td>{department.department}</td>
                      <td>{department.users}</td>
                      <td>{department.sent}</td>
                      <td>{department.positive}</td>
                      <td>{department.improvement}</td>
                    </tr>
                  ))}
                  {byDepartment.length === 0 && (
                    <tr>
                      <td colSpan="5">{t("hr.noData")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAR COLLABORATEUR */}
          <div className="hr-block">
            <div className="hr-block-head">
              <h4>{t("hr.peopleTitle")}</h4>
              <input
                type="search"
                className="hr-search"
                placeholder={t("hr.searchPlaceholder")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="hr-table-wrap hr-table-scroll">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>{t("hr.colPerson")}</th>
                    <th>{t("hr.colDepartment")}</th>
                    <th>{t("hr.colSent")}</th>
                    <th>{t("hr.colReceived")}</th>
                    <th>{t("hr.colLast")}</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.email}>
                      <td>
                        <strong>{person.full_name}</strong>
                        <small>{person.email}</small>
                      </td>
                      <td>{person.department}</td>
                      <td>{person.sent}</td>
                      <td>{person.received}</td>
                      <td>{formatDate(person.last_sent)}</td>
                    </tr>
                  ))}
                  {people.length === 0 && (
                    <tr>
                      <td colSpan="5">{t("hr.noData")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="hr-privacy">{t("hr.privacy")}</p>
        </>
      )}
    </section>
  );
}

export default HRDashboard;