import Game from "../Models/Game.mjs";
import JoinedGame from "../Models/JoinedGame.mjs";
import Didascalia from "../Models/Didascalia.mjs";
import Meme from "../Models/Meme.mjs";
const SERVER_URL = 'http://localhost:3001';

  async function getAllGamesByUsername() {
    const games = await fetch(SERVER_URL + '/api/games', {
      credentials: 'include'
    }).then(handleInvalidResponse).then(response => response.json()).then(mapRowsToGames);
    return games;
  };
  async function getGameById(id) {
    const game = await fetch(SERVER_URL + '/api/games/' + id, {
      credentials: 'include'
    }).then(handleInvalidResponse).then(response => response.json()).then(mapRowsToJGames);
    return game;
  }
  async function addRound(game, captions) {
    const requestBody = {
      game: game,
      captions: captions
    };
    const g = await fetch(SERVER_URL + '/api/round', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    }).then(handleInvalidResponse).then(response => response.json());
    const correctCaptions = mapRowsToDidascalie(g.correctCaptions);
    return {game: new Game(g.game.id, g.game.user, g.game.round, g.game.score, g.game.meme_id, g.game.choice), correctCaptions: correctCaptions};
    
  }
  async function getRandomCaptions(memeId) {
    const captions = await fetch(SERVER_URL + '/api/round/' + memeId + '/random').then(handleInvalidResponse).then(response => response.json()).then(mapRowsToDidascalie);
    return captions;
  }
  async function getRandomMeme() {
    
    const meme = await fetch(SERVER_URL + '/api/game/random' ).then(handleInvalidResponse).then(response => response.json());
    return new Meme(meme.id, meme.image);
  }
  async function getMeme(gameId,round) {
    const meme = await fetch(SERVER_URL + '/api/game/' + gameId +'/' + round +'/meme', {credentials: 'include'} ).then(handleInvalidResponse).then(response => response.json());
    return new Meme(meme.id, meme.image);
  }
  async function getLastGameId() {
    const id = await fetch(SERVER_URL + '/api/game/last', {
      credentials: 'include'
    }).then(handleInvalidResponse).then(response => response.json());
    return id;
  }

async function getReview() {
  const gameJ = await fetch(SERVER_URL + '/api/review', {
    credentials: 'include'
  }).then(handleInvalidResponse).then(response => response.json()).then(mapRowsToJGames);
  return gameJ;
}
async function checkGuestCaptions(memeId, captions, choice) {
  const requestBody = {
    memeId: memeId,
    captions: captions,
    choice: choice
  };
  const result = await fetch(SERVER_URL + '/api/game/guest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  }).then(handleInvalidResponse).then(response => response.json());
  const correctCaptions = mapRowsToDidascalie(result.correctCaptions);

  return {correctCaptions: correctCaptions, isCorrect: result.isCorrect};
}

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
    return fetch(SERVER_URL + '/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    }).then(handleInvalidResponse).then(response => response.json());
  };
  
  /**
   * This function is used to verify if the user is still logged-in.
   * It returns a JSON object with the user info.
*/
  const getUserInfo = async () => {
    return fetch(SERVER_URL + '/api/sessions/current', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    }).then(handleInvalidResponse).then(response => response.json());
  };  
  
  /**
   * This function destroy the current user's session and execute the log-out.
*/
  const logOut = async() => {
    return await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
    }).then(handleInvalidResponse);  }   

  function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}


function mapRowsToGames(rows) {
  return rows.map((row) => new Game(row.id, row.user, row.round, row.score, row.meme_id, row.choice));
}

function mapRowsToJGames(rows) {
  return rows.map((row) => new JoinedGame(row.id, row.user, row.round, row.score, row.meme_id, row.choice, row.description, row.image));
}

function mapRowsToDidascalie(rows) {
  return rows.map((row) => new Didascalia(row.id, row.description));
}
  
  const API = {logIn, getUserInfo, logOut, getAllGamesByUsername, getGameById, addRound, getRandomCaptions, getMeme, getLastGameId, getReview, getRandomMeme, checkGuestCaptions};
  export default API;
  