// Note: Add the code that you have previously written for the game inside this component
import './GamePage.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCircleInfo, FaTrophy } from 'react-icons/fa6';
import $ from 'jquery'; 
import { wait } from '@testing-library/user-event/dist/utils';
import { countryCode } from 'emoji-flags';
import _ from 'lodash';

const GamePage = ({ token, onLogout }) => {
    const [userId, setUserId] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [song1, setSong1] = useState(null);
    const [song2, setSong2] = useState(null);
    const [score, setScore] = useState(0);
    const [choiceMade, setChoiceMade] = useState(false);
    const [highScore, setHighScore] = useState(null);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [choice, setChoice] = useState(null);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [showCrossmark, setShowCrossmark] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showLossPopup, setShowLossPopup] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const [activeTab, setActiveTab] = useState('personal');
    const [gamesPlayed, setGamesPlayed] = useState(null);
    const [country, setCountry] = useState(null);
    const [globalScope, setGlobalScope] = useState(true);
    const [profilePic, setProfilePic] = useState(null);
    const [displayName, setDisplayName] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isFadingIn, setIsFadingIn] = useState(false);
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);


    useEffect(() => {
        fetchGlobalLeaderboard();
    }, []);

    const fetchGlobalLeaderboard = async () => {
        try {
            const response = await axios.get("http://localhost:3001/topHighscoresGlobal")
            console.log(response.data);
            setGlobalLeaderboard(response.data)
        } catch (error) {
            console.error("Error fetching global leaderboard:", error);
        }
    };

    const pickRandomSongs = () => {
        const randomSongs = topTracks.sort(() => 0.5 - Math.random()).slice(0, 1);
        setSong1(song2);
        setSong2(randomSongs[0]);
        setIsFadingIn(true);  // Trigger fade-in for song2

        setTimeout(() => {
            setIsFadingIn(false);  // Reset fade-in state after animation is done
        }, 2000);  // 2000 ms or however long your fade-in animation takes
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
                        // Assuming you have profilePic and country variables available
                        // You need to fetch or define these values based on your application's logic
                        const proPic = profilePic;
                        const countryInit = country;
    
                        fetch("http://localhost:3001/createUser", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ 
                                username: userId,
                                profilePic: proPic,
                                country: countryInit
                            })
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

    const handleGuessMade = async (choice) => {
        setChoice(choice);
        setChoiceMade(true);
        setCurrentCount(0);
    
        await countUp(song2.popularity);
    
        setTimeout(async () => {
            if (song1.popularity === song2.popularity || (choice === "higher" && song2.popularity > song1.popularity) || (choice === "lower" && song2.popularity < song1.popularity)) {
                setScore(score + 1);
                if ((score + 1) > highScore && userId) {
                    await updateHighscore(userId, score + 1);
                    setIsNewHighScore(true);
                    await fetchGlobalLeaderboard();  // Refresh the leaderboard
                }
                setShowCheckmark(true);
                setShowCrossmark(false);
    
                setTimeout(() => {
                    setIsAnimating(true);
                    setShowCheckmark(false);
                    setShowCrossmark(false);
    
                    setTimeout(() => {
                        setIsAnimating(false);
                        pickRandomSongs();
                        setChoiceMade(false);
                        setChoice(null);
                    }, 2000);
                }, 2000);
            } else {
                setShowCheckmark(false);
                setShowCrossmark(true);
    
                setTimeout(async () => {
                    if ((score + 1) > highScore && userId) {
                        await fetchGlobalLeaderboard();  // Refresh the leaderboard
                    }
                    setShowLossPopup(true);
                    setShowCrossmark(false);
                }, 2000);
            }
        }, 1000);
    };
    
      

      const handlePlayAgain = () => {
        setShowLossPopup(false); // Hide the popup
        setScore(0);
        // Start Slide Animation
        setIsAnimating(true);

        incrementGamesPlayed(userId).then(() => {
            getHighscore(userId);
          });
      
        // End Slide Animation and proceed to the next card
        setTimeout(() => {
          setIsAnimating(false);
          pickRandomSongs();
          setChoiceMade(false);
          setChoice(null);
          setIsNewHighScore(false);
        }, 2000);  // Time taken for slide animation
      };
      

    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
    };

    const toggleLeaderboard = () => {
        setShowLeaderboard(!showLeaderboard);
    }

    async function toggleShareGlobal() {
        console.log('toggleShareGlobal called');
    
        const updatedGlobalScope = !globalScope;
        setGlobalScope(updatedGlobalScope);
    
        // Determine the endpoint based on the updated global scope
        const endpoint = `http://localhost:3001/changeGlobal/${userId}`;
    
        // Toggle the global flag for the user
        axios.post(endpoint)
            .then(response => {
                console.log(`Global scope ${updatedGlobalScope ? 'enabled' : 'disabled'} for user:`, response.data);
                // Refresh the global leaderboard after updating the global scope
                fetchGlobalLeaderboard();
            })
            .catch(error => {
                console.error('Error:', error);
            });
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


    const Leaderboard = ({ data }) => {
        return (
            <div className="leaderboard">
                {data.map((entry, index) => (
                    <div key={index} className="player">
                        <img src={entry.profilePic || 'default-profile.jpg'} alt={entry.username} className="profile-pic"/>
                        <span className="player-country">{getFlagEmoji(entry.country)}</span>
                        <span className="player-name">{entry.username}</span>
                        <span className="player-score">{entry.highscore}</span>
                    </div>
                ))}
            </div>
        );
    };

    const UserInfo = ({ profilePic, displayName, highScore, gamesPlayed, country }) => {
        return (
            <div className="user-info">
                <img src={profilePic} alt="Profile" className="self-profile-pic" />
                <span className="country-flag">{getFlagEmoji(country)}</span>
                <h1 className="display-name">{displayName}</h1>
                <h2>Highscore: <span className="highscore">{highScore}</span></h2>
                <h2>Games Played: <span className="games-played">{gamesPlayed}</span></h2>
            </div>
        );
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
              <div className={`song-card ${isAnimating ? 'fade-out' : ''}`}>
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
                    <path className={`checkmark ${isAnimating ? 'lower-z-index' : ''}`} d="M30,102L70,142L162,50"/>
                </svg>
                </div>
                )}
                {showCrossmark && (
                    <div className="c-markicon u-font-normal">
                        <svg viewBox="0 0 192 192">
                            <path className={`crossmark1 ${isAnimating ? 'lower-z-index' : ''}`} d="M30,30L162,162"/>
                            <path className={`crossmark2 ${isAnimating ? 'lower-z-index' : ''}`} d="M30,162L162,30"/>
                        </svg>
                    </div>
                )}
                </div>
                <div className={`song-card ${isAnimating ? 'slide-in' : ''} ${isFadingIn ? 'fade-in' : ''}`}>
                {song2 ? (
                  <>
                    <img src={song2.album.images[0].url} alt={song2.name} />
                    <h2>{song2.name}</h2>
                    <p>{song2.artists.map((artist) => artist.name).join(", ")}</p>
                    {choiceMade && <div className="count">{currentCount}</div>}
                    {!choiceMade ? (
                      <>
                        <button className="higher-button" onClick={() => handleGuessMade("higher")}>
                          Higher
                        </button>
                        <button className="lower-button" onClick={() => handleGuessMade("lower")}>
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
                <b><ins>How do I play?</ins></b>
                <p>Guess which song is higher or lower in popularity from your personal catalog of favorite songs and tracks from Spotify!</p>
                <b><ins>What does the number below the song mean?</ins></b>
                <p>The game references Spotify's internal popularity index, which is a value assigned to each track between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the <b>total number of plays</b> the track has had and how <b>recent</b> those plays are.</p>
                <button className="info-close-button" onClick={toggleInstructions}>
                Close
                </button>
            </div>
            </div>
            )}
            {showLossPopup && (
    <div className="loss-window">
        <div className={`loss-popup-content ${isNewHighScore ? 'new-high-score' : ''}`}>
            <div className="button-container">
                <button
                    className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => switchLeaderboard('personal')}
                >
                    Game Recap
                </button>
                <button
                    className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => switchLeaderboard('global')}
                >
                    Global Leaderboard
                </button>
            </div>

            {activeTab === 'global' ? (
                <div id="globalLeaderboard" className="global-popup">
                <h2>Global Leaderboard</h2>
                <Leaderboard data={globalLeaderboard} />
                {globalScope ? (
                            <button className="unshare-highscore-global-button" onClick={toggleShareGlobal}>
                                Unshare My High Score
                            </button>
                        ) : (
                            <button className="share-highscore-global-button" onClick={toggleShareGlobal}>
                                Share My High Score
                            </button>
                        )}

                        <h3>Your High Score is {globalScope ? "Public" : "Private"}</h3>
                </div>
            ) : (
                <>
                    {isNewHighScore ? (
                        <>
                            <h2>New High Score!</h2>
                            <div className="loss-count">{score}</div>
                            {globalScope ? (
                            <button className="share-highscore-global-button" onClick={(e) => { e.stopPropagation(); toggleShareGlobal(); }}>
                            Unshare My High Score
                        </button>
                            ) : (
                            <>
                                <h2>High Score Unshared</h2>
                                <button className="unshare-highscore-global-button" onClick={toggleShareGlobal}>
                                Share My High Score
                                </button>
                            </>
                            )}
                        </>
                    ) : (
                        <>
                            <h2>You have lost!</h2>
                            <h2>Score: <div className="loss-count">{score}</div></h2>
                            <h2>Your High Score: <div className="loss-count">{highScore}</div></h2>
                        </>
                    )}
                </>
            )}
            <button className="play-again-button" onClick={handlePlayAgain}>Play Again</button>
            <button className="loss-logout-button" onClick={logout}>Logout</button>
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
                    My Info
                    </button>
                    <button
                    className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => switchLeaderboard('global')}
                    >
                    Leaderboard
                    </button>
                </div>

                {activeTab === 'global' ? (
                    <div id="globalLeaderboard" className="global-popup">
                        <h2>Global Leaderboard</h2>
                        <Leaderboard data={globalLeaderboard} />

                        {globalScope ? (
                            <button className="unshare-highscore-global-button" onClick={toggleShareGlobal}>
                                Unshare My High Score
                            </button>
                        ) : (
                            <button className="share-highscore-global-button" onClick={toggleShareGlobal}>
                                Share My High Score
                            </button>
                        )}

                        <h3>Your High Score is {globalScope ? "Public" : "Private"}</h3>
                    </div>
                ) : (
                    <div id="myHighscores" className="highscores-container">
                        <UserInfo 
                            profilePic={profilePic} 
                            displayName={displayName} 
                            highScore={highScore} 
                            gamesPlayed={gamesPlayed} 
                            country={country} 
                        />
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