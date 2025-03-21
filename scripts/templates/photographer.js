function photographerTemplate(data) {
    const { id, name, portrait, city, country, tagline, price} = data;

    const picture = `assets/photographers/PhotographersPhotos/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement('article');

        // Création du liens qui renvoir au photographe !
        const link = document.createElement("a");
        link.setAttribute("href", `photographer.js?id=${id}`);
    
        const img = document.createElement('img');
        img.setAttribute("src", picture);
        img.setAttribute("alt", `Photo de ${name}`);
        link.appendChild(img); 
    
        // Créer les autres éléments
        const h2 = document.createElement("h2");
        h2.textContent = name;
    
        const h3 = document.createElement('h3');
        h3.textContent = `${city}, ${country}`;
    
        const p = document.createElement('p');
        p.textContent = tagline;
    
        const priceP = document.createElement('p'); 
        priceP.textContent = `${price}€/jour`;
    
        // Ajouter les éléments à l'article
        article.appendChild(link); 
        article.appendChild(h2);
        article.appendChild(h3);
        article.appendChild(p);
        article.appendChild(priceP);
        return (article);
    }
    return { name, portrait, city, country, tagline, price, getUserCardDOM }
}