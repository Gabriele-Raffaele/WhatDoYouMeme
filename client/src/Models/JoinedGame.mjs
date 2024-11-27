export default function JoinedGame(id, user, round, score, meme_id, choice, description, image) {
    this.id = id;
    this.user = user;
    this.round = round;
    this.score = score;
    this.meme_id = meme_id;
    this.choice = choice;
    this.description = description;
    this.image = image;
    this.toJSON = () => {
        return {...this};
    };
}