// Note: Add the code that you have previously written for the game inside this component
import './GamePage.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCircleInfo, FaTrophy } from 'react-icons/fa6';
import $ from 'jquery'; 
import { wait } from '@testing-library/user-event/dist/utils';
import { countryCode } from 'emoji-flags';

const GamePage = ({ token, onLogout }) => {
    const [userId, setUserId] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [song1, setSong1] = useState(null);
    const [song2, setSong2] = useState(null);
    const [score, setScore] = useState(0);
    const [choiceMade, setChoiceMade] = useState(false);
    const [highScore, setHighScore] = useState(null);
    const [choice, setChoice] = useState(null);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [showCrossmark, setShowCrossmark] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const [activeTab, setActiveTab] = useState('personal');
    const [gamesPlayed, setGamesPlayed] = useState(null);
    const [country, setCountry] = useState(null);
    const [globalScope, setGlobalScope] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [displayName, setDisplayName] = useState(null);



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
        const init = async () => {
            await getUser(); // Ensure userId is fetched first
            userTracks(); // Then fetch the user's tracks
        };
    
        init();
    }, [token]);

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/checkUsername/${userId}`)
                .then(response => {
                    if (response.data.exists) {
                        // Call getHighscore only if the username exists
                        getHighscore(userId);
                    } else {
                        fetch("http://localhost:3001/createUser", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ username: userId })
                        })
                        .then(response => response.json()) // Assuming server responds with json
                        .then(data => {
                            console.log("User creation response:", data);
                            if (data) {
                                getHighscore(userId);
                            } else {
                                console.log("User not created. Not fetching high score.");
                            }
                        })
                        .catch(error => {
                            console.log("Error in user creation:", error);
                        });
                    }
                })
                .catch(error => {
                    console.error('There was an error checking if the user exists:', error);
                });
        }
    }, [userId]);

    const getUser = async() => {
        if (token) {
            try {
                const { data } = await axios.get("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
                });
                setUserId(data.id);
                setCountry(data.country);
                setProfilePic(data.images[0].url);
                setDisplayName(data.display_name);
            } catch (error) {
                console.error("Failed to fetch user's Id ", error);
            }
        } 
    } 

    const handleButtonClick = async (choice) => {
        setChoice(choice);
        setChoiceMade(true);
        setCurrentCount(0);
        
        await countUp(song2.popularity);

        setTimeout(() => {
            if (song1.popularity == song2.popularity || (choice == "higher" && song2.popularity > song1.popularity) || (choice == "lower" && song2.popularity < song1.popularity)) {
                setScore(score+1);
                if ((score + 1) > highScore && userId){  // +1 because you're about to increment the score
                    updateHighscore(userId, score + 1).then(() => {
                        getHighscore(userId); // Get updated high score from database
                      });
                }
                setShowCheckmark(true);
                setShowCrossmark(false);
            } else {
                setScore(0);
                incrementGamesPlayed(userId).then(() => {
                    getHighscore(userId); // Get updated high score from database
                  });
                setShowCheckmark(false);
                setShowCrossmark(true); 
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

    const toggleLeaderboard = () => {
        setShowLeaderboard(!showLeaderboard);
    }

    const logout = () => {
        onLogout();
    };

    const updateHighscore = async (username, highscore) => {
        try{
        await axios.post("http://localhost:3001/updateHighscore", {
          username,
          highscore,
        });
        } catch (error) {
            console.error(`Failed to update high score: ${error}`);
        }
      };

      const incrementGamesPlayed = async (username) => {
        try{
        await axios.post("http://localhost:3001/incrementGamesPlayed", {
          username
        });
        } catch (error) {
            console.error(`Failed to update high score: ${error}`);
        }
      };
      
      
    const getHighscore = async (username) => {
        try {
            const response = await axios.get(`http://localhost:3001/getUserByUsername/${username}`);
            console.log(response);
            setHighScore(response.data.highscore); // assuming setHighScore is the setter of a state variable
            setGamesPlayed(response.data.gamesPlayed);
            setGlobalScope(response.data.global);
          } catch (error) {
            console.error(`Failed to fetch high score: ${error}`);
          }
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

    function getFlagEmoji(countryCode) {
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char =>  127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
      }

    const switchLeaderboard = (type) => {
        setActiveTab(type);
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
              <div className="score">Score:<div className="score-count">{score}</div></div>
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
              <button className="info-button" onClick={toggleInstructions}>
                <FaCircleInfo className="social-icon" />
              </button>
              <button className="leaderboard-button" onClick={toggleLeaderboard}>
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
                    <div className="count">{song1.popularity}</div>
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
                            <path className="crossmark1" d="M30,30L162,162"/>
                            <path className="crossmark2" d="M30,162L162,30"/>
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
                    {choiceMade && <div className="count">{currentCount}</div>}
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
            <div className="info-window">
            <div className="info-popup-content">
                <b>How do I play?</b>
                <p>Guess which song is higher or lower in popularity from your personal favorite songs and tracks from Spotify!</p>
                <b>What does the number below the song mean?</b>
                <p>The game references Spotify's internal popularity index, which is a value assigned to each track between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the <b>total number of plays</b> the track has had and how <b>recent</b> those plays are.</p>
                <button className="info-close-button" onClick={toggleInstructions}>
                Close
                </button>
            </div>
            </div>
            )}
            {showLeaderboard && (
                <div className="leaderboard-window">
                <div className="leaderboard-popup-content">
                <div className="button-container">
                    <button
                    className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => switchLeaderboard('personal')}
                    >
                    My Highscores
                    </button>
                    <button
                    className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => switchLeaderboard('global')}
                    >
                    Global
                    </button>
                </div>

                {activeTab === 'global' ? (
                    <div id="globalLeaderboard">
                        <h2>Leaderboard</h2>
                        <div className="leaderboard">
                            <div className="player">
                            <img src="profile1.jpg" alt="Player 1" className="profile-pic"/>
                            <span className="player-name">Player 1</span>
                            <span className="player-score">100</span>
                            </div>
                            <div className="player">
                            <img src="profile2.jpg" alt="Player 2" className="profile-pic"/>
                            <span className="player-name">Player 2</span>
                            <span className="player-score">90</span>
                            </div>
                            <div className="player">
                            <img src="profile2.jpg" alt="Player 2" className="profile-pic"/>
                            <span className="player-name">Player 2</span>
                            <span className="player-score">90</span>
                            </div>
                            <div className="player">
                            <img src="profile2.jpg" alt="Player 2" className="profile-pic"/>
                            <span className="player-name">Player 2</span>
                            <span className="player-score">90</span>
                            </div>
                            <div className="player">
                            <img src="profile2.jpg" alt="Player 2" className="profile-pic"/>
                            <span className="player-name">Player 2</span>
                            <span className="player-score">90</span>
                            </div>
                        </div>
                    </div>
                    ) : (
                        <div id="myHighscores" className="highscores-container">
                        <div className="user-info">
                            <img src={profilePic} alt="Profile" className="self-profile-pic" />
                            <span className="country-flag">{/* Your flag emoji or icon will go here */}</span>
                        </div>
                        <h1>{displayName}</h1>
                        <h2>Your Highscore: <span className="highscore">{highScore}</span></h2>
                        <h2>Games Played: <span className="games-played">{gamesPlayed}</span></h2>
                    </div>
                )}
                  <button className="leaderboard-close-button" onClick={toggleLeaderboard}>Close</button>
                </div>
              </div>
            )}
        </div>
      );
    };

export default GamePage;