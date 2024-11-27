export default function Game(id, user, round, score, meme_id, choice) {
    this.id = id;
    this.user = user;
    this.round =round ;
    this.score = score;
    this.meme_id = meme_id;
    this.choice = choice;
    this.toJSON = () => {
        return {...this};
    };
}

