import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

const LANGUAGES = [
  { code: "fr", flag: "fr", name: "Français" },
  { code: "en", flag: "gb", name: "English" },
];

// key = clé de traduction, target = id de la section dans la page
const SEARCH_ITEMS = [
  { key: "why", target: "pourquoi-feedback" },
  { key: "give", target: "donner-feedback" },
  { key: "indicators", target: "indicateurs" },
  { key: "received", target: "indicateurs" },
  { key: "history", target: "historique" },
];

const NOTIFICATIONS = ["welcome", "tip"];
const READ_STORAGE_KEY = "evolve_read_notifications";

// Ignore majuscules et accents pour la recherche
const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function Header({ user, onLogout }) {
  const { lang, setLang, t } = useLanguage();

  // Un seul panneau ouvert à la fois : "search" | "lang" | "info" | "help" | "notifications" | "account" | null
  const [openPanel, setOpenPanel] = useState(null);
  const [query, setQuery] = useState("");
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const currentLanguage =
    LANGUAGES.find((language) => language.code === lang) || LANGUAGES[0];

  const unreadCount = NOTIFICATIONS.filter(
    (id) => !readNotifications.includes(id)
  ).length;

  const listFrom = (key) => {
    const value = t(key);
    return Array.isArray(value) ? value : [];
  };

  // Mémorise les notifications lues
  useEffect(() => {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readNotifications));
  }, [readNotifications]);

  // Ferme les panneaux au clic à l'extérieur ou avec Échap
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-popover]")) {
        setOpenPanel(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenPanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const togglePanel = (name) => {
    setOpenPanel((previous) => (previous === name ? null : name));
  };

  // RECHERCHE
  const searchResults = query.trim()
    ? SEARCH_ITEMS.filter((item) => {
        const searched = normalize(query.trim());
        const label = normalize(t(`header.sections.${item.key}.label`));
        const keywords = normalize(t(`header.sections.${item.key}.keywords`));
        return label.includes(searched) || keywords.includes(searched);
      })
    : [];

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setOpenPanel(value.trim() ? "search" : null);
  };

  const goToSection = (targetId) => {
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: "smooth" });
    setQuery("");
    setOpenPanel(null);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchResults.length > 0) {
      goToSection(searchResults[0].target);
    }
  };

  // LANGUE
  const changeLanguage = (code) => {
    setLang(code);
    setOpenPanel(null);
  };

  // NOTIFICATIONS
  const markAsRead = (id) => {
    setReadNotifications((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );
  };

  const markAllAsRead = () => {
    setReadNotifications([...NOTIFICATIONS]);
  };

  // COMPTE
  const handleLogoutClick = async () => {
    setOpenPanel(null);

    if (onLogout) {
      await onLogout();
    }
  };

  const avatar =
    user?.gender === "MALE"
      ? "/icone compte homme.png"
      : "/icone compte femme.png";

  return (
    <header className="header">
      {/* LOGO */}
      <a href="#top" className="logo-container">
        <img
          src="/images/header-logo.png"
          alt="Stellantis Evolve"
          className="header-logo-img"
        />
      </a>

      {/* SEARCH */}
      <div className="search-wrapper" data-popover>
        <svg className="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>

        <input
          type="text"
          className="search-input"
          placeholder={t("header.searchPlaceholder")}
          value={query}
          onChange={handleSearchChange}
          onFocus={() => query.trim() && setOpenPanel("search")}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
        />

        {openPanel === "search" && query.trim() && (
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="search-result-item"
                  onClick={() => goToSection(item.target)}
                >
                  {t(`header.sections.${item.key}.label`)}
                </button>
              ))
            ) : (
              <div className="search-no-result">{t("header.noResults")}</div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">
        {/* LANGUAGE SELECTOR */}
        <div className="custom-lang-selector" data-popover>
          <div className="lang-trigger" onClick={() => togglePanel("lang")}>
            <img
              id="selectedFlagImg"
              src={`https://flagcdn.com/w40/${currentLanguage.flag}.png`}
              alt={currentLanguage.code.toUpperCase()}
              className="flag-icon"
            />

            <span id="selectedText">{currentLanguage.name}</span>

            <svg className="chevron-blue" viewBox="0 0 12 8">
              <path d="M1 1l5 5 5-5" />
            </svg>
          </div>

          {openPanel === "lang" && (
            <div className="lang-dropdown-menu show" id="langDropdownMenu">
              {LANGUAGES.map((language) => (
                <div
                  key={language.code}
                  className="lang-item"
                  onClick={() => changeLanguage(language.code)}
                >
                  <img
                    src={`https://flagcdn.com/w40/${language.flag}.png`}
                    alt={language.code.toUpperCase()}
                    className="flag-icon"
                  />
                  {language.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFORMATION */}
        <div className="header-popover" data-popover>
          <button
            type="button"
            className="icon-circle"
            onClick={() => togglePanel("info")}
            aria-label={t("header.tooltips.info")}
            title={t("header.tooltips.info")}
          >
            i
          </button>

          {openPanel === "info" && (
            <div className="header-panel">
              <h4 className="panel-title">{t("header.info.title")}</h4>
              <p className="panel-intro">{t("header.info.intro")}</p>

              {listFrom("header.info.points").map((point) => (
                <div key={point.title} className="panel-item">
                  <strong>{point.title}</strong>
                  <p>{point.text}</p>
                </div>
              ))}

              <div className="panel-tip">
                <strong>{t("header.info.tipTitle")}</strong>
                <p>{t("header.info.tip")}</p>
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="header-popover" data-popover>
          <button
            type="button"
            className="icon-circle bell"
            onClick={() => togglePanel("notifications")}
            aria-label={t("header.tooltips.notifications")}
            title={t("header.tooltips.notifications")}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 4.36 6 6.92 6 10v5l-2 2v1h16v-1l-2-2z" />
            </svg>

            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {openPanel === "notifications" && (
            <div className="header-panel">
              <div className="panel-header-row">
                <h4 className="panel-title">
                  {t("header.notifications.title")}
                </h4>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="panel-link-btn"
                    onClick={markAllAsRead}
                  >
                    {t("header.notifications.markAllRead")}
                  </button>
                )}
              </div>

              {NOTIFICATIONS.map((id) => {
                const isRead = readNotifications.includes(id);

                return (
                  <button
                    key={id}
                    type="button"
                    className="notif-item"
                    onClick={() => markAsRead(id)}
                  >
                    <div className={`notif-dot ${isRead ? "read" : ""}`} />
                    <div>
                      <strong>
                        {t(`header.notifications.items.${id}.title`)}
                      </strong>
                      <span>{t(`header.notifications.items.${id}.text`)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* HELP */}
        <div className="header-popover" data-popover>
          <button
            type="button"
            className="icon-circle"
            onClick={() => togglePanel("help")}
            aria-label={t("header.tooltips.help")}
            title={t("header.tooltips.help")}
          >
            ?
          </button>

          {openPanel === "help" && (
            <div className="header-panel">
              <h4 className="panel-title">{t("header.help.title")}</h4>

              {listFrom("header.help.items").map((item) => (
                <details key={item.q} className="help-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* ACCOUNT */}
        <div className="account-dropdown-wrapper" data-popover>
          <button
            type="button"
            className="account-section"
            onClick={() => togglePanel("account")}
            aria-expanded={openPanel === "account"}
            aria-haspopup="true"
          >
            <img
              id="userAvatar"
              src={avatar}
              alt="Avatar"
              className="avatar-img"
            />

            <div className="account-email" id="headerEmail">
              {user?.email}
            </div>

            <svg
              className={`account-chevron ${
                openPanel === "account" ? "open" : ""
              }`}
              viewBox="0 0 12 8"
              aria-hidden="true"
            >
              <path d="M1 1l5 5 5-5" />
            </svg>
          </button>

          {openPanel === "account" && (
            <div className="account-dropdown-menu">
              <div className="account-dropdown-header">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="account-dropdown-avatar"
                />

                <div className="account-dropdown-user">
                  <strong id="dropdownUserName">{user?.name}</strong>

                  <span id="dropdownUserEmail">{user?.email}</span>
                </div>
              </div>

              <div className="account-dropdown-divider" />

              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  setOpenPanel(null);
                  // Future: profile page
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>

                <span>{t("header.account.profile")}</span>
              </button>

              <button
                type="button"
                className="account-menu-item logout"
                onClick={handleLogoutClick}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M21 3v18" />
                </svg>

                <span>{t("header.account.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;