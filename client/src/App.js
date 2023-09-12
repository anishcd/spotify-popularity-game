import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import GamePage from './GamePage';

const App = () => {
  const [token, setToken] = useState("");

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  }

  useEffect(() => {
    const hash = window.location.hash
    let localToken = window.localStorage.getItem("token")

    if (!localToken && hash) {
        localToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
        window.location.hash = ""
        window.localStorage.setItem("token", localToken)
    }

    if (localToken) {
        setToken(localToken)
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={ token ? <Navigate to="/game" /> : <LoginPage /> } />
        <Route path="/game" element={ token ? <GamePage onLogout={logout} token={token} /> : <Navigate to="/" /> } />
      </Routes>
    </Router>
  );
};

export default App;