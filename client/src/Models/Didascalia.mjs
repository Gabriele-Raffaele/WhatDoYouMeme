export default function Didascalia(id,description) {
    this.id = id;
    this.description = description;
    this.toJSON = () => {
        return {...this};
    };
}


