import React from "react";
import { useLanguage } from "../../context/LanguageContext";

function HeroSection({ user }) {
  const { t } = useLanguage();

  return (
    <>
      {/* HERO BANNER */}
      <div className="hero-banner-wrapper">
        <div className="hero-container">
          <div className="hero-header-text">
            <h1 id="welcomeHeading">
              {t("hero.hello")} <span id="userNameSpan">{user?.name}</span>,
            </h1>

            <p className="welcome-subtext">{t("hero.welcome")}</p>
          </div>
        </div>
      </div>

      {/* OVERLAP BOX */}
      <div className="hero-overlap-box-wrapper">
        <div className="left-content-block">
          <div className="custom-badge-header">
            <span className="badge-title">{t("hero.badge")}</span>
            <div className="orange-line"></div>
          </div>

          <h2 className="custom-hero-title">
            {t("hero.title1")}
            <br />
            {t("hero.title2")}
            <br />
            <span className="highlight-blue">{t("hero.highlight1")}</span>
            <br />
            <span className="highlight-blue">{t("hero.highlight2")}</span>
          </h2>

          <p className="custom-hero-paragraph">{t("hero.paragraph")}</p>
        </div>

        <img
          src="/Stella teleq.png"
          alt="Stella Feedback"
          className="stella-tele-hero-img"
        />
      </div>
    </>
  );
}

export default HeroSection;