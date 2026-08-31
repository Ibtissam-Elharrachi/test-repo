import React, { useState } from "react";

// IMPORT LIBS / SERVICES & UTILS 
import {supabase} from '../../services/supabaseClient';

function AuthModal({ onAuth }) {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [gender, setGender] = useState("");
const [authMode, setAuthMode] = useState("login");


const handleSubmit = (event) => {
event.preventDefault();

const userData = {
  name,
  email,
  password,
  gender,
  mode: authMode
};

// HANDLE AUTH FORM DATA TO SUPABASE 
if (onAuth) {
  onAuth(userData);
}
};

// AUTH MODE
const isLogin = authMode === "login";

return (
<div className="login-overlay" id="loginModal">
<div className="login-popup-wrapper">

    <div className="title-container">
      <h2>Révélez votre potentiel !</h2>
      <div className="title-divider"></div>
    </div>

    <p>
      Inscrivez-vous dans une démarche de progrès continu et
      d'échange constructif.
    </p>

    <form id="authForm" onSubmit={handleSubmit}>

      {!isLogin && (
        <input
            type="text"
            id="userInput"
            placeholder="Prénom et nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
        />
        )}

        <input
        type="email"
        id="userEmailInput"
        placeholder="prenom.nom@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        />

        <input
        type="password"
        id="userPasswordInput"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        />

        {!isLogin && (
        <select
            id="userGenderInput"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
        >
            <option value="" disabled>
            Sélectionnez votre genre
            </option>
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
        </select>
        )}


      <button
        type="submit"
        id="submitBtn"
      >
        Commencer mon accompagnement
      </button>

    </form>

    <img
      src="/stella.png"
      alt="Stella"
      className="stella-img"
      id="stellaImg"
    />

    <div className="auth-mode-switch">
        {isLogin ? (
            <>
            <span>Vous n'avez pas encore de compte ?</span>
            <button
                type="button"
                onClick={() => setAuthMode("signup")}
            >
                Créer un compte
            </button>
            </>
        ) : (
            <>
            <span>Vous avez déjà un compte ?</span>
            <button
                type="button"
                onClick={() => setAuthMode("login")}
            >
                Se connecter
            </button>
            </>
        )}
     </div>

  </div>
</div>


);
}

export default AuthModal;