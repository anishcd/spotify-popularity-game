import React from 'react';
import './LoginPage.css';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

const LoginPage = () => {
  const CLIENT_ID = "7bedd495cf6a43b49f1655cbbc2be4c4";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-read-private user-top-read";

  const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

  return (
    <div className="login-page">
      <h1 className="title">Welcome to the Spotify Song Game!</h1>
      <button className="login-button" onClick={() => (window.location = loginUrl)}>
        Login to Spotify
      </button>
      <div className="instructions">
        <h2 className="instructions-title">Instructions:</h2>
        <p>
          The Spotify Song Game is a fun challenge where you guess whether the next song is higher or lower in popularity compared to the current song. Test your knowledge of popular songs and see how high you can score!
        </p>
      </div>
      <div className="social-links">
        <a href="https://www.instagram.com/example" className="social-link">
          <FaInstagram className="social-icon" />
        </a>
        <a href="https://www.twitter.com/example" className="social-link">
          <FaTwitter className="social-icon" />
        </a>
        <a href="https://www.facebook.com/example" className="social-link">
          <FaFacebook className="social-icon" />
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
