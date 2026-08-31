import React, { useState, useEffect, useRef } from "react";

function Header({ user, onLogout }) {
const [isLangOpen, setIsLangOpen] = useState(false);
const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
const [selectedLanguage, setSelectedLanguage] = useState(
    {
    code: "fr",
    name: "Français",
    },
    {
    code: "en",
    name: "English",
    },
);

const changeLanguage = (code, name) => {
setSelectedLanguage({
code,
name,
});

setIsLangOpen(false);

};

const handleLogoutClick = async () => {
  setIsAccountMenuOpen(false);

  if (onLogout) {
    await onLogout();
  }
};


// Toggle for Header account dropdown 
const toggleAccountMenu = () => {
  setIsAccountMenuOpen((previous) => !previous);
};

const accountDropdownRef = useRef(null);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      accountDropdownRef.current &&
      !accountDropdownRef.current.contains(event.target)
    ) {
      setIsAccountMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);


const toggleLanguageMenu = (event) => {
event.stopPropagation();
setIsLangOpen((previous) => !previous);
};

//const userGender = user?.gender || "FEMALE";

const avatar =
user?.gender === "MALE"
? "/icone compte homme.png"
: "/icone compte femme.png";

return (
<header className="header">

  {/* LOGO */}
  <a href="#top" className="logo-container">
    <img
      src="/images/stellantis_brand.png"
      alt="Stellantis Logo"
      className="header-logo-img"
    />
  </a>

  {/* SEARCH */}
  <div className="search-wrapper">
    <svg
      className="search-icon"
      viewBox="0 0 24 24"
    >
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>

    <input
      type="text"
      className="search-input"
      placeholder="Que souhaitez-vous explorer aujourd'hui ?"
    />
  </div>

  {/* RIGHT SIDE */}
  <div className="header-right">

    {/* LANGUAGE SELECTOR */}
    <div className="custom-lang-selector">

      <div
        className="lang-trigger"
        onClick={toggleLanguageMenu}
      >
        <img
          id="selectedFlagImg"
          src={`https://flagcdn.com/w40/${selectedLanguage.code}.png`}
          alt={selectedLanguage.code.toUpperCase()}
          className="flag-icon"
        />

        <span id="selectedText">
          {selectedLanguage.name}
        </span>

        <svg
          className="chevron-blue"
          viewBox="0 0 12 8"
        >
          <path d="M1 1l5 5 5-5" />
        </svg>
      </div>

      {isLangOpen && (
        <div
          className="lang-dropdown-menu"
          id="langDropdownMenu"
        >
          <div
            className="lang-item"
            onClick={() =>
              changeLanguage("fr", "Français")
            }
          >
            <img
              src="https://flagcdn.com/w40/fr.png"
              alt="FR"
              className="flag-icon"
            />
            Français
          </div>

          <div
            className="lang-item"
            onClick={() =>
              changeLanguage("gb", "English")
            }
          >
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="GB"
              className="flag-icon"
            />
            English
          </div>
        </div>
      )}
    </div>

    {/* INFORMATION */}
    <div className="icon-circle">
      i
    </div>

    {/* NOTIFICATIONS */}
    <div className="icon-circle bell">
      <svg viewBox="0 0 24 24">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 4.36 6 6.92 6 10v5l-2 2v1h16v-1l-2-2z" />
      </svg>

      <span className="notification-badge">
        1
      </span>
    </div>

    {/* HELP */}
    <div className="icon-circle">
      ?
    </div>

    {/* ACCOUNT */}
    <div 
    className="account-dropdown-wrapper"
    ref={accountDropdownRef}
    >
    <button
        type="button"
        className="account-section"
        onClick={toggleAccountMenu}
        aria-expanded={isAccountMenuOpen}
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
            isAccountMenuOpen ? "open" : ""
        }`}
        viewBox="0 0 12 8"
        aria-hidden="true"
        >
        <path d="M1 1l5 5 5-5" />
        </svg>
    </button>

    {isAccountMenuOpen && (
        <div className="account-dropdown-menu">
        <div className="account-dropdown-header">
            <img
            src={avatar}
            alt="Avatar"
            className="account-dropdown-avatar"
            />

            <div className="account-dropdown-user">
            <strong id="dropdownUserName">
                {user?.name }
            </strong>

            <span id="dropdownUserEmail">
                {user?.email}
            </span>
            </div>
        </div>

        <div className="account-dropdown-divider" />

        <button
            type="button"
            className="account-menu-item"
            onClick={() => {
            setIsAccountMenuOpen(false);
            // Future: profile page
            }}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>

            <span>Mon profil</span>
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

            <span>Se déconnecter</span>
        </button>
        </div>
    )}
    </div>


  </div>
</header>


);
}

export default Header;