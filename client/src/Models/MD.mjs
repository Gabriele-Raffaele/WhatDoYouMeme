export default function MD(didascalia_id, meme_id) {
    this.didascalia_id = didascalia_id;
    this.meme_id = meme_id;
    this.toJSON = () => {
        return {...this};
    };
}


export default function MDJoined(id, meme_id, didascalia_id, description, image) {
    this.id = id;
    this.meme_id = meme_id;
    this.didascalia_id = didascalia_id;
    this.description = description;
    this.image = image;
    this.toJSON = () => {
        return {...this};
    };
}