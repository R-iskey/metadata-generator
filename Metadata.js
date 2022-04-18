class Metadata {
    constructor(name, description = '', image, attributes = []) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.attributes = attributes
    }
}

module.exports = Metadata;
