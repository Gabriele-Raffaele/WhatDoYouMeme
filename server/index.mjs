/*** Importing modules ***/
import express from 'express';
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware
import UserDao from "./Dao/UserDao.mjs"; // module for accessing the films table in the DB
import GameDao from "./Dao/GameDao.mjs"; // module for accessing the films table in the DB
import Game from "./Models/Game.mjs"; // module for accessing the films table in the DB
/*** init express and set up the middlewares ***/
import passport from 'passport'; // authentication middleware
import LocalStrategy from 'passport-local'; // authentication strategy (username and password)
import session from 'express-session'; // session middleware
import {check, validationResult} from 'express-validator'; // validation middleware



const gameDao = new GameDao();
const userDao = new UserDao();
const app = express();
const port = 3001;
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));
/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials : true
};
app.use(cors(corsOptions));

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});


app.use(session({
  secret: "I'm an engineer, I'm not trying to argue, I'm just explaining why I'm right",
  resave: false,
  saveUninitialized: false,
  maxAge: 3600000
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}
 

/*** Utility Functions ***/

// This function is used to handle validation errors
const onValidationErrors = (validationResult, res) => {
  const errors = validationResult.formatWith(errorFormatter);
  return res.status(422).json({validationErrors: errors.mapped()});
};

// Only keep the error message in the response
const errorFormatter = ({msg}) => {
  return msg;
};
const gameValidation = [
  check('game.id').isNumeric().notEmpty(),
  check('game.round').isNumeric().notEmpty(),
  check('game.score').isNumeric().notEmpty(),
  check('game.meme_id').isNumeric().notEmpty(),
  check('game.choice').isNumeric().notEmpty(),
  check('game.user').isNumeric().notEmpty(),];


/*** API ***/
/*** Game APIs ***/
// 1. Retrieve all games.
// GET /api/games
app.get('/api/games', isLoggedIn,
async  (req, res) => {
    try {

      const result = await gameDao.getAllGamesByUsername(req.user.id)

      res.status(200).json(result);
} catch (err) {
  res.status(500).end();
}
  }
);

// 2. Retrieve a specific game.
// GET /api/games/<id>
// This route returns the game with the specified id.
app.get('/api/games/:id', isLoggedIn,
  async (req, res) => {
      try {
          const result = await gameDao.getGameById(req.params.id, req.user.id);
          res.status(200).json(result);
      } catch (err) {
          res.status(500).end();
      }
  }
);


// 3. Add a new round to the game.
// POST /api/round
// This route is used to add a new round to the game.
app.post('/api/round', isLoggedIn, gameValidation,
  async (req, res) => {
      const invalidFields = validationResult(req);

      if (!invalidFields.isEmpty()) {
          return onValidationErrors(invalidFields, res);
      }
      const { id, round, score, meme_id, choice } = req.body.game;
      const game = new Game(id, req.user.id, round, score, meme_id, choice);
      const captions = req.body.captions.map(caption => ({
        id: caption.id,
        description: caption.description,
      }));
      try {
          const result = await gameDao.addRound(game, captions); // NOTE: addFilm returns the new created object
          res.status(200).json(result);
      } catch (err) {
          res.status(503).json({error: `Database error during the creation of new Round: ${err}`});
      }
  }
);
//4. Get the random captions
//GET /api/round/<meme_id>/random
//This route returns the random captions of the game .
app.get('/api/round/:memeId/random',
  async (req, res) => {
      try {
          const result = await gameDao.getRandomCaptions(req.params.memeId);
          if (result.error)
              res.status(404).json(result);
          else
              res.status(200).json(result);
      } catch (err) {
          res.status(500).end();
      }
  }
);
//5. Get the random meme
//GET /api/game/random
//This route returns the random meme for a guest user.
app.get('/api/game/random',
  async (req, res) => {
      try {
          const result = await gameDao.getRandomMeme();
          if (result.error)
              res.status(404).json(result);
          else
              res.status(200).json(result);
      } catch (err) {
          res.status(500).end();
      }
  }
);

// 6. Get the meme of the round
// POST /api/game/<gameId>/<round>/meme/<userId>
// This route returns the meme of the round with the specified id round.
app.get('/api/game/:gameId/:round/meme',isLoggedIn,
  async (req, res) => {
      try {
          const result = await gameDao.getMeme(req.params.gameId, req.params.round, req.user.id);
          if (result.error)
              res.status(404).json(result);
          else
              res.status(200).json(result);
      } catch (err) {
          res.status(500).end();
      }
  }
);

//7. get the id of the last game
//GET /api/game/last
//This route returns the id of the last game.
app.get('/api/game/last',isLoggedIn,
  async (req, res) => {
      try {
          const result = await gameDao.getLastGameId(req.user.id);
          res.status(200).json(result);
      } catch (err) {
          res.status(500).end();
      }
  }
);
//8. Get the review of the user
//GET /api/review
//This route returns the review of the user.
app.get('/api/review',isLoggedIn,
  async (req, res) => {
      try {
          const result = await gameDao.getReview(req.user.id);
          if (result.error)
              res.status(404).json(result);
          else
              res.status(200).json(result);
      } catch (err) {
          res.status(500).end();
      }
  }
);

//9 get guest correct captions
//POST /api/game/guest
//This route returns the correct captions of the guest user.
app.post('/api/game/guest',
  async (req, res) => {
      try {
        const captions = req.body.captions.map(caption => ({
          id: caption.id,
          description: caption.description,
        }));
          const result = await gameDao.checkGuestCaptions(req.body.memeId, captions, req.body.choice);
          res.status(200).json(result);
      } catch (err) {
          res.status(503).json({error: `Database error during the validation of the correct captions: ${err}`});
      }
  }
);

  
  
//----------------------AUTHENTICATION APIs----------------------//
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) { 
    res.json(req.user);
  }else {
    res.status(401).json({error: 'No user is currently logged in'});
  }
});


app.delete('/api/sessions/current', (req, res)=> {
  req.logout(()=>{
    res.status(200).json({});
  });
});


app.listen(port, () => {console.log(`Server listening at http://localhost:${port}`);});