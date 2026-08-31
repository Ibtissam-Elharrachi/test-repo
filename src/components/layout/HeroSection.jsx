import React from "react";

function HeroSection({ user }) {

return (
<>
{/* HERO BANNER */}
<div className="hero-banner-wrapper">
<div className="hero-container">

      <div className="hero-header-text">
        <h1 id="welcomeHeading">
          Bonjour{" "}
          <span id="userNameSpan">
            {user?.name}
          </span>,
        </h1>

        <p className="welcome-subtext">
          Bienvenue sur votre plateforme de feedback Evolve !
        </p>
      </div>

    </div>
  </div>

  {/* OVERLAP BOX */}
  <div className="hero-overlap-box-wrapper">

    <div className="left-content-block">

      <div className="custom-badge-header">
        <span className="badge-title">
          PLATEFORME INTERNE DE FEEDBACK
        </span>

        <div className="orange-line"></div>
      </div>

      <h2 className="custom-hero-title">
        Grandissez ensemble :
        <br />
        chaque retour est un
        <br />

        <span className="highlight-blue">
          mot qui peut propulser
        </span>

        <br />

        <span className="highlight-blue">
          une carrière.
        </span>
      </h2>

      <p className="custom-hero-paragraph">
        Inspirez vos équipes au quotidien et faites de chaque échange
        un moteur d'excellence. Donner un retour aujourd'hui, c'est
        construire un succès collectif et partagé pour demain.
      </p>

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