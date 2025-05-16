class Photographer {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.portrait = data.portrait;
        this.city = data.city;
        this.country = data.country;
        this.tagline = data.tagline;
        this.price = data.price;
        this.picture = `assets/photographers/PhotographersPhotos/${this.portrait}`;
    }

    createCard() {
        const article = document.createElement('article');

        const link = document.createElement('a');
        link.href = `photographer.html?id=${this.id}`;

        const img = document.createElement('img');
        img.src = this.picture;
        img.alt = `Photo de ${this.name}`;
        link.appendChild(img);

        const h2 = document.createElement('h2');
        h2.textContent = this.name;

        const h3 = document.createElement('h3');
        h3.textContent = `${this.city}, ${this.country}`;

        const pTagline = document.createElement('p');
        pTagline.textContent = this.tagline;

        const pPrice = document.createElement('p');
        pPrice.textContent = `${this.price}€/jour`;

        article.appendChild(link);
        article.appendChild(h2);
        article.appendChild(h3);
        article.appendChild(pTagline);
        article.appendChild(pPrice);

        return article;
    }
}
