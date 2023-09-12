// Note: Add the code that you have previously written for the game inside this component
import './GamePage.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCircleInfo, FaTrophy } from 'react-icons/fa6';
import $ from 'jquery'; 
import { wait } from '@testing-library/user-event/dist/utils';

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
    const [currentCount, setCurrentCount] = useState(0);

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

    const handleButtonClick = async (choice) => {
        setChoice(choice);
        setChoiceMade(true);
        setCurrentCount(0);
        
        await countUp(song2.popularity);

        setTimeout(() => {
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
        }, 1000)
    };

    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
      };

    const logout = () => {
        onLogout();
    };

    const countUp = (count) => {
        return new Promise((resolve) => {
            let run_count = 0;
            const int_speed = 24;
        
            const int = setInterval(() => {
              if (run_count < count) {
                run_count++;
                setCurrentCount(run_count);
              } else {
                clearInterval(int);
                resolve();
              }
            }, int_speed);
          });
    };

    useEffect(() => {
        if (choiceMade && song2) {
            countUp(song2.popularity); // Call countUp function with song2.popularity as the target
        }
    }, [choiceMade, song2]); // Dependency array

    return (
        <div className="App">
          <header className="App-header">
            <h1 className="game-title">Higher or Lower: Songs Edition</h1>
            <div className="score-card">
              <div className="score">Score:<div class="score-count">{score}</div></div>
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
                <FaCircleInfo className="social-icon" />
              </button>
              <button className="leaderboard-button" onClick={toggleInstructions}>
                <FaTrophy className="social-icon" />
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
                    <div class="count">{song1.popularity}</div>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
              <div className="animation-container">
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
                </div>
                <div className="song-card">
                {song2 ? (
                  <>
                    <img src={song2.album.images[0].url} alt={song2.name} />
                    <h2>{song2.name}</h2>
                    <p>{song2.artists.map((artist) => artist.name).join(", ")}</p>
                    {choiceMade && <div class="count">{currentCount}</div>}
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