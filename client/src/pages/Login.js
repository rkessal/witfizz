import React, { useEffect, useState } from "react";
import "./login.css";
import "./index.css";
import { BsGithub } from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";
import axios from "../config/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const { login, register, checkAuth } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, [checkAuth]);

  const fetchIp = async () => {
    const request = await fetch("https://ipinfo.io/json?token=faa3194d71c80a");
    const jsonResponse = await request.json();
    return jsonResponse.loc;
  };

  async function saveLoc(loc) {
    await axios
      .post("/loc", { loc })
      .then((res) => {})
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    const main = async () => {
      const location = await fetchIp();
      //await saveLoc(location);
    };
    main();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = isRegistering 
      ? await register(email, password, name)
      : await login(email, password);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="background">
      <div className="login-container">
        <div className="login">
          <BsGithub className="github" />
          <a href={`${process.env.REACT_APP_BACKEND_URL}/auth/github`}>
            {" Log in with Github"}
          </a>
        </div>

        <div className="login-form">
          <h2>{isRegistering ? "Inscription" : "Connexion"}</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <input
                  type="text"
                  className="nes-input"
                  placeholder="Nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                />
              </div>
            )}
            <div className="form-group">
              <input
                type="email"
                className="nes-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="nes-input"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="nes-btn is-primary">
              {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
          </form>
          <button
            className="nes-btn is-secondary toggle-form"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? "Déjà un compte ? Connectez-vous"
              : "Créer un compte"}
          </button>
        </div>
      </div>
      <div className="stars-login">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
    </div>
  );
};

export default Login;
