export default function Meme(id, image) {
    this.id = id;
    this.image = image;
    this.toJSON = () => {
        return {...this};
    };
}


