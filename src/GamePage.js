// Note: Add the code that you have previously written for the game inside this component
import './GamePage.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GamePage = ({ token, onLogout }) => {
    const [topTracks, setTopTracks] = useState([]);
    const [song1, setSong1] = useState(null);
    const [song2, setSong2] = useState(null);
    const [score, setScore] = useState(0);
    const [choiceMade, setChoiceMade] = useState(false);
    const [choice, setChoice] = useState(null);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [showCrossmark, setShowCrossmark] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const pickRandomSongs = () => {
        const randomSongs = topTracks.sort(() => 0.5 - Math.random()).slice(0, 1);
        setSong1(song2);
        setSong2(randomSongs[0]);
    };

    useEffect(() => {
        const userTracks = async () => {
            if (token) {
                try {
                    const timeRanges = ["short_term", "medium_term", "long_term"];
                    let allTracks = [];

                    for (let timeRange of timeRanges) {
                        const { data } = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            params: {
                                time_range: timeRange,
                                limit: 50
                            }
                        });

                        allTracks = [...allTracks, ...data.items];
                    }

                    setTopTracks(allTracks);
                    const randomSongs = allTracks.sort(() => 0.5 - Math.random()).slice(0, 2);
                    setSong1(randomSongs[0]);
                    setSong2(randomSongs[1]);

                } catch (error) {
                    console.error("Failed to fetch user's top tracks: ", error);
                }
            }
        };

        userTracks();
    }, [token]);

    const handleButtonClick = (choice) => {
        setChoice(choice);
        setChoiceMade(true);

        if (song1.popularity == song2.popularity) {
            setScore(score+1);
            setShowCheckmark(true);
            setShowCrossmark(false);
        }
        if (choice == "higher") {
            if (song2.popularity > song1.popularity) {
                setScore(score+1)
                setShowCheckmark(true);
                setShowCrossmark(false);
            } else {
                setScore(0);
                setShowCheckmark(false);
                setShowCrossmark(true);
            }
        } else {
            if (song2.popularity < song1.popularity) {
                setScore(score+1)
                setShowCheckmark(true);
                setShowCrossmark(false);
            } else {
                setScore(0);
                setShowCrossmark(true);
                setShowCheckmark(false);
            } 
        }

        setTimeout(() => {
            pickRandomSongs();
            setChoiceMade(false);
            setShowCheckmark(false);
            setShowCrossmark(false);
            setChoice(null);
        }, 4000);
    };

    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
      };

    const logout = () => {
        onLogout();
    };

    return (
        <div className="App">
          <header className="App-header">
            <h1 className="game-title">Higher or Lower: Songs Edition</h1>
            <div className="score-card">
              <div className="score">Score: {score}</div>
            </div>
            {!token ? (
              <a
                href={`https://accounts.spotify.com/authorize?client_id=7bedd495cf6a43b49f1655cbbc2be4c4&response_type=token&redirect_uri=http://localhost:3000&scope=user-read-private%20user-top-read`}
              >
                Login to Spotify
              </a>
            ) : (
            <>
              <button className="logout-button" onClick={logout}>Logout</button>
              <button className="popup-button" onClick={toggleInstructions}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                </svg>
              </button>
            </>
            )}
          </header>
          <div className="container">
            <div className="game-container">
              <div className="song-card">
                {song1 ? (
                  <>
                    <img src={song1.album.images[0].url} alt={song1.name} />
                    <h2>{song1.name}</h2>
                    <p>{song1.artists.map((artist) => artist.name).join(", ")}</p>
                    <p>Popularity: {song1.popularity}</p>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
              {showCheckmark && (
                <div className="c-markicon u-font-normal">
                <svg viewBox="0 0 192 192">
                    <path className="checkmark" d="M30,102L70,142L162,50"/>
                </svg>
                </div>
                )}
                {showCrossmark && (
                    <div className="c-markicon u-font-normal">
                        <svg viewBox="0 0 192 192">
                            <path class="crossmark1" d="M30,30L162,162"/>
                            <path class="crossmark2" d="M30,162L162,30"/>
                        </svg>
                    </div>
                )}
                <div className="song-card">
                {song2 ? (
                  <>
                    <img src={song2.album.images[0].url} alt={song2.name} />
                    <h2>{song2.name}</h2>
                    <p>{song2.artists.map((artist) => artist.name).join(", ")}</p>
                    {choiceMade && <p>Popularity: {song2.popularity}</p>}
                    {!choiceMade ? (
                      <>
                        <button className="higher-button" onClick={() => handleButtonClick("higher")}>
                          Higher
                        </button>
                        <button className="lower-button" onClick={() => handleButtonClick("lower")}>
                          Lower
                        </button>
                      </>
                    ) : null}
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
          {showInstructions && (
        <div className="popup-window">
          <div className="popup-content">
            <h3>Instructions:</h3>
            <p>Guess whether the next song is higher or lower in popularity compared to the current song.</p>
            <button className="close-button" onClick={toggleInstructions}>
              Close
            </button>
          </div>
        </div>
      )}
        </div>
      );
    };

export default GamePage;