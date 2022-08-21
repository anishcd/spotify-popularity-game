import './App.css';
import {useEffect, useState} from 'react';
import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

function App() {
    const CLIENT_ID = "7bedd495cf6a43b49f1655cbbc2be4c4"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const SCOPE = "user-read-private user-top-read"

    const [token, setToken] = useState("")

    const [searchKey, setSearchKey] = useState("")
    const [artists, setArtists] = useState([])
    const [topSongs, setTopSongs] = useState([])
    const [track1, setTrack1] = useState()
    const [track2, setTrack2] = useState()
    const [score, setScore] = useState(0)

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
    }

    const searchArtists = async (e) => {
        e.preventDefault()
        const {data} = await axios.get("https://api.spotify.com/v1/search", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                q: searchKey,
                type: "artist"
            }
        })
    
        setArtists(data.artists.items)
    }

    const getTopSongs = async () => {
        const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                time_range: "long_term",
                limit: 50
            }
        })
        setTopSongs(data.items)
        if (topSongs.length > 2) {
            setTrack1(topSongs[parseInt(Math.random() * (topSongs.length - 1))])
            setTrack2(topSongs[parseInt(Math.random() * (topSongs.length - 1))])
        }

    }

    const renderArtists = () => {
        artists.map(artist => (
            <div key={artist.id}>
                {artist.images.length ? <img width={"50%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
                {artist.name}
            </div>
        ))
    }

    const gameSelection = (choice, other) => {
        
    }


    const renderTopSongs = () => {
        topSongs.map(track => (
            <div key={track.id}>
                {track.album.images.length ? <img width={"20%"} src={track.album.images[0].url} alt=""/> : <div>No Image</div>}
                {track.name}
            </div>
        ))

        if (track1 && track2 && track1.id===track2.id) {
            console.log(track1.name + "    " + track2.name)
            setTrack2(topSongs[parseInt(Math.random() * (topSongs.length - 1))]) 
        }

    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Spotify Guess</h1>
                <h2>Score: {score}</h2>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
                    : <button onClick={logout}>Logout</button>}
                <form onSubmit={searchArtists}>
                    <input type="text" onChange={e => setSearchKey(e.target.value)}/>
                    <button type={"submit"}>Search</button>
                </form>
                <div>
                    <button onClick={getTopSongs}>Get Top Tracks</button>
                </div>
                {renderTopSongs()}
                <div className="container">
                    <div>
                        {track1 ? <img width={"30%"} src={track1.album.images[0].url} onClick={gameSelection(track1, track2)} alt=""/> : <div></div>}
                        {track1 ? <p>{track1.name}</p> : <div></div>}
                        {track1 ? <p>{track1.popularity}</p> : <div></div>}
                    </div>
                    <div>
                        {track2 ? <img width={"30%"} src={track2.album.images[0].url} onClick={gameSelection(track2, track1)} alt=""/> : <div></div>}
                        {track2 ? <p>{track2.name}</p> : <div></div>}
                        {track2 ? <p>{track2.popularity}</p> : <div></div>}
                    </div>
                </div>
                {renderArtists()}

            </header>
        </div>
    );
}

export default App;
