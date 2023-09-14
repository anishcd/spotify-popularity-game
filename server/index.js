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

// Define Schema and Model
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
    default: false,
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
  }
});

const User = mongoose.model("User", UserSchema);

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
    const { username } = req.body;
    const existingUser = await User.findOne({ username });
  
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }
  
    const user = new User({ username, highscore: 0, dateAchieved: Date.now(), gamesPlayed: 0});
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
