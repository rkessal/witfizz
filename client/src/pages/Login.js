import React, { useEffect, useState } from "react";
import "./login.css";
import "./index.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { SET_USER } from "../reducers/mapReducer";
import { BsGithub } from "react-icons/bs";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    axios.get("/user").then((data) => {
      console.log(data);
      dispatch(SET_USER(data.data));
    });
  }, [dispatch]);

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
    try {
      if (isRegistering) {
        await axios.post("/auth/register", { email, password, name });
      }
      const response = await axios.post("/auth/login", { email, password });
      if (response.data.user) {
        dispatch(SET_USER(response.data.user));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite");
    }
  };

  const userState = useSelector((state) => {
    console.log("state:", state);
    return state.user;
  });

  console.log(userState)
  return (
    <div className="background">
      <div className="login-container">
        <div className="login">
          <BsGithub className="github" />
          <a href={process.env.REACT_APP_GITHUB_LOGIN}>
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
