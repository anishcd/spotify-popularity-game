const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',  // replace with your frontend application's URL
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); // Enables CORS for all routes
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/highscores", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Updated User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    highscore: {
        type: Number,
        default: 0,
        required: true
    },
    global: {
        type: Boolean,
        default: true,
        required: true
    },
    dateAchieved: {
        type: Date,
        default: Date.now(),
        required: true
    },
    gamesPlayed: {
        type: Number,
        default: 0,
        required: true
    },
    profilePic: {
        type: String,
        default: '' // You can set a default image URL or keep it empty
    },
    country: {
        type: String,
        default: ''
    }
});

const User = mongoose.model("User", UserSchema);

// API Endpoint to get the top 5 high scores from the global leaderboard
app.get("/topHighscoresGlobal", async (req, res) => {
    try {
        // Find all users with global flag set to true, sort them in descending order by highscore,
        // and limit the result to the top 5 entries
        const topGlobalHighScores = await User.find({ global: true })
            .sort({ highscore: -1 }) // -1 for descending order
            .limit(5);
        
        res.status(200).json(topGlobalHighScores);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred.');
    }
});


app.post('/changeGlobal/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Toggle the global flag
        user.global = !user.global;
        await user.save();

        res.status(200).send({ global: user.global });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred.');
    }
});

// API Endpoints
// API Endpoint to save a new high score only if it's higher than the existing one
app.post("/updateHighscore", async (req, res) => {
    const { username, highscore } = req.body;
    const user = await User.findOne({ username });
  
    if (!user) {
      return res.status(404).send("User not found.");
    }
  
    // Only update if the new highscore is greater than the existing highscore
    if (highscore > user.highscore) {
      user.highscore = highscore;
      user.dateAchieved = Date.now();
      await user.save();
      res.send("Highscore updated");
    } else {
      res.send("Highscore not updated");
    }
  });

  app.post("/incrementGamesPlayed", async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
  
    if (!user) {
      return res.status(404).send("User not found.");
    }

    user.gamesPlayed+=1;
    await user.save()
    res.send("Games Played Incremented");
  });



app.get("/getUserByUsername/:username", async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  res.json(user);
});

// API Endpoint to add a new user with an initial high score of 0
app.post("/createUser", async (req, res) => {
    const { username, profilePic, country } = req.body; // Destructuring to get profilePic and country
    const existingUser = await User.findOne({ username });
  
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }

    // Creating a new user with the profilePic and country if provided
    const user = new User({ 
        username, 
        highscore: 0, 
        dateAchieved: Date.now(), 
        gamesPlayed: 0,
        profilePic: profilePic || '', // Use an empty string if profilePic is not provided
        country: country || '' // Use an empty string if country is not provided
    });
    await user.save();
    res.status(200).send(user);
});

app.get('/checkUsername/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
      const existingUser = await User.findOne({ username });
      
      if (existingUser) {
        res.json({ exists: true });
        console.log("User exists in database")
      } else {
        res.json({ exists: false });
        console.log("User does not exist in database")
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  });

  app.post('/changeGlobal/:username', async (req, res) => {

  });

// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
