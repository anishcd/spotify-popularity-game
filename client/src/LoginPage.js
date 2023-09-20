import React from 'react';
import './LoginPage.css';
import headshot from '../src/img/about-me.jpg';
import { FaGithub, FaSpotify, FaTwitter, FaLinkedin, FaRegAddressCard } from 'react-icons/fa';

const LoginPage = () => {
  const CLIENT_ID = "7bedd495cf6a43b49f1655cbbc2be4c4";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-read-private user-top-read user-read-email";

  const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="login-page">
      <h1 className="title">Welcome to the Spotify Song Game!</h1>
      <div className="instruction-box">
        <div className="instructions">
          <div className="instructions-container">
            <h2 className="instructions-title">Instructions:</h2>
          </div>
          <p>
            The Spotify Song Game is a personalized challenge where you guess which songs in your personal catalog are higher or lower in popularity.
          </p>
          <p>
          The game references Spotify's internal popularity index, which is a value assigned to each track between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are.
          </p>
          <p>
          Test your knowledge of your favorite songs and see how high you can score!
          </p>
          <button className="login-button" onClick={() => (window.location = loginUrl)}>
              Start
            </button>
        </div>
      </div>
      <div className="about-section">
        <h2>About Me</h2>
        <p>
          Hi, I'm Anish Devineni, a software developer who loves music and coding! Feel free to connect with me on social media!
        </p>
        <div className="about-image-container">
          <img src={headshot} alt="Anish Devineni" className="about-image" />
        </div>
        <div className="social-links">
        <a href="https://github.com/anishcd" className="social-link">
          <FaGithub className="social-icon" />
        </a>
        <a href="https://twitter.com/_anishdevineni" className="social-link">
          <FaTwitter className="social-icon" />
        </a>
        <a href="https://www.linkedin.com/in/anishdevineni/" className="social-link">
          <FaLinkedin className="social-icon" />
        </a>
        <a href="https://open.spotify.com/user/anishcdevineni?si=d7c3483390f24d9b" className="social-link">
          <FaSpotify className="social-icon" />
        </a>
        <a href="https://anishd.com" className="social-link">
          <FaRegAddressCard className="social-icon" />
        </a>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
