import db from '../db/db.mjs';
import Game from "../Models/Game.mjs";
import JoinedGame from '../Models/JoinedGame.mjs';
import Didascalia from '../Models/Didascalia.mjs';
import Meme from '../Models/Meme.mjs';

export default function GameDao() {

    function mapRowsToGames(rows) {
        return rows.map((row) => new Game(row.id, row.user, row.round, row.score, row.meme_id, row.choice));
    }
    function mapRowsToJGames(rows) {
        return rows.map((row) => new JoinedGame(row.id, row.user, row.round, row.score, row.meme_id, row.choice, row.description, row.image));
    }
    function mapRowsToDidascalie(rows) {
        return rows.map((row) => new Didascalia(row.id, row.description));
    }
    this.addRound = (game, captions) => {
        return new Promise(async (resolve, reject) => {
            try {
                const sql = 'INSERT INTO Games (id, user, round, score, meme_id, choice) VALUES (?, ?, ?, ?, ?, ?)';
                const c = await this.allCorrect(game.meme_id);
                const isCorrect = c.includes(game.choice);
              //  const isCorrect = await this.isDidascaliaCorrect(game.meme_id, game.choice);
                game.score = isCorrect ? 5 : 0;
                let correctCaptions = []; 
               // const c = await this.allCorrect(game.meme_id);
                // Filtra le captions corrette basate sugli ID presenti in c
                correctCaptions = captions.filter(caption => c.includes(caption.id));
                db.run(sql, [game.id, game.user, game.round, game.score, game.meme_id, game.choice], (err) => {
                    if (err) {
                        reject(err);
                    } else {

                        const obj = {game: game, correctCaptions: correctCaptions};
                        resolve(obj);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    };
    
    this.getGameById = (id, user) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT G.id, G.user, G.round, G.score, G.meme_id, G.choice, D.description, M.image FROM Games G LEFT JOIN Meme M On G.meme_id = M.id LEFT JOIN Didascalie D ON G.choice = D.id WHERE G.id = ? AND G.user = ?';

            db.all(sql, [id, user], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const rounds = mapRowsToJGames(rows);
                    resolve(rounds);
                }
            });
        });
    }


    this.getAllGamesByUsername = (user) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Games WHERE user = ? GROUP BY id';
            db.all(sql, [user], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const games = mapRowsToGames(rows);
                    resolve(games);
                }
            });
        });
    }
    this.getRandomCaptions = async (memeId) => {
        try {
            const sqlWrong = `
                SELECT *
                FROM Didascalie
                WHERE id NOT IN (
                    SELECT didascalia_id
                    FROM MDTable
                    WHERE meme_id = ?
                )
                ORDER BY RANDOM()
                LIMIT 5;
            `;
            const sqlCorrect = `
                SELECT *
                FROM Didascalie
                WHERE id IN (
                    SELECT didascalia_id
                    FROM MDTable
                    WHERE meme_id = ?
                )
                ORDER BY RANDOM()
                LIMIT 2;
            `;
    
            const executeQuery = (sql, params) => {
                return new Promise((resolve, reject) => {
                    db.all(sql, params, (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (rows.length === 0) {
                                resolve({error: 'Didascalie not found.'});
                            }
                            resolve(rows);
                        }
                    });
                });
            };
    
            const rowsWrong = await executeQuery(sqlWrong, [memeId]);
            const rowsCorrect = await executeQuery(sqlCorrect, [memeId]);
    
            const didascalieWrong = mapRowsToDidascalie(rowsWrong);
            const didascalieCorrect = mapRowsToDidascalie(rowsCorrect);
            const combinedDidascalie = didascalieWrong.concat(didascalieCorrect);
    
            return combinedDidascalie;
        } catch (err) {
            throw err;
        }
    };
    
    this.getLastGameId = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id FROM Games WHERE user = ? ORDER BY id DESC LIMIT 1';
            db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        resolve(row.id);
                    }else{
                        resolve(0);
                    }
                }
            });
        });
    }
    this.getReview = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT G.id, G.user, G.round, G.score, G.meme_id, G.choice, D.description, M.image
                        FROM Games G
                        JOIN Meme M ON G.meme_id = M.id
                        JOIN Didascalie D ON D.id = G.choice
                        WHERE G.id = (SELECT MAX(id) FROM Games WHERE user = ?)
                        AND G.user = ?
                        ORDER BY G.id DESC;

                        `;
            db.all(sql, [userId, userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length === 0) {
                        resolve({error: 'Game not found.'});
                    }
                    const gameJ = mapRowsToJGames(rows);
                    resolve(gameJ);
                }
            });
        });
    }
    this.getRandomMeme = () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Meme ORDER BY RANDOM() LIMIT 1';
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row || row === undefined) {
                        resolve({error: 'Meme not found.'});
                    }
                    const meme = new Meme(row.id, row.image);
                    resolve(meme);
                }
            });
        });
    };

    this.getMeme = (gameId, round, userId) => {
        return new Promise((resolve, reject) => {
            const sql1 = 'SELECT * FROM Meme ORDER BY RANDOM() LIMIT 1;';
            const sql2 = 'SELECT * FROM Meme WHERE id != ? ORDER BY RANDOM() LIMIT 1;';
            const sql21 = 'SELECT meme_id FROM Games WHERE id = ? AND user = ? AND round = 1;';
            const sql3 = 'SELECT * FROM Meme WHERE id <> ? AND id <> ? ORDER BY RANDOM() LIMIT 1;';
            const sql31 = 'SELECT meme_id FROM Games WHERE id = ? AND user = ? AND (round = 1 OR round = 2);';
            round = parseInt(round);
            gameId = parseInt(gameId);
            if (round === 1) {
                db.get(sql1, [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (!row || row === undefined) {
                            resolve({error: 'Meme not found.'});
                        }
                       const meme = new Meme(row.id, row.image);
                        resolve(meme);
                    }
                });
            }
            
            if (round === 2) {
                db.get(sql21, [gameId, userId], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        const meme_id = row.meme_id;
                        db.get(sql2, [meme_id], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                if (!row || row === undefined) {
                                    resolve({error: 'Meme not found.'});
                                }
                                const meme = new Meme(row.id, row.image);
                                resolve(meme);
                            }
                        });
                    }
                });
            }
            if (round === 3 ) {
                db.all(sql31, [gameId, userId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const meme_ids = rows.map(row => row.meme_id);
                        db.get(sql3, [meme_ids[0], meme_ids[1]], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                if (!row || row === undefined) {
                                    resolve({error: 'Meme not found.'});
                                }
                                const meme = new Meme(row.id, row.image);
                                resolve(meme);
                            }
                        });
                    }
                });
            }
        });
    };

    this.allCorrect = (memeId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT didascalia_id FROM  MDTable MD WHERE meme_id = ?';
            db.all(sql, [memeId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length === 0) {
                        resolve({error: 'Didascalia not found.'});
                    }
                    const correctCaptions = rows.map(row => row.didascalia_id);
                    resolve(correctCaptions);
                }
            });
        });
    }
    this.checkGuestCaptions = async (memeId, captions, choice) => {
        const c = await this.allCorrect(memeId);
        let correctCaptions = [];
        correctCaptions = captions.filter(caption => c.includes(caption.id));
        const isCorrect = c.includes(choice);
        return {
                correctCaptions: correctCaptions,
                isCorrect: isCorrect
            };
    }
}


