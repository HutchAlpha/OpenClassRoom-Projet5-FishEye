// Récupèration id URL
const params = new URLSearchParams(window.location.search);
const photographerId = parseInt(params.get('id'));

async function getPhotographerData() {
    const response = await fetch('../data/photographers.json');
    const data = await response.json();
    return {
        photographer: data.photographers.find(p => p.id === photographerId),
        media: data.media.filter(m => m.photographerId === photographerId)
    };
}

// Affiche les informations du photographe
async function displayPhotographer(photographer) {
    const { name, city, country, tagline, portrait} = photographer;

    const firstName = name.split(' ')[0]; 

    const picture = `assets/photographers/PhotographersPhotos/${portrait}`;

    // Met à jour le header
    document.querySelector('.photograph-header h1').textContent = name;
    document.querySelector('.photograph-header .location').textContent = `${city}, ${country}`;
    document.querySelector('.photograph-header .tagline').textContent = tagline;
    document.querySelector('.photograph-header img').src = picture;
    document.querySelector('.photograph-header img').alt = name;

    return firstName;
}

// Affiche les médias
function displayMedia(media, firstName) {
    console.log(firstName);
    const mediaSection = document.querySelector('.photographer-media');
    mediaSection.innerHTML = ''; // Reset du contenu

    media.forEach(item => {
        const mediaCard = document.createElement('article');
        mediaCard.className = 'media-card';
        mediaCard.dataset.id = item.id;

        // Création du média (image ou vidéo)
        let mediaElement;
        if (item.image) {
            mediaElement = document.createElement('img');
            mediaElement.src = `assets/photographers/${firstName}/${item.image}`;
            mediaElement.alt = item.title;
        } else if (item.video) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            const source = document.createElement('source');
            source.src = `assets/photographers/${firstName}/${item.image}`;
            source.type = 'video/mp4';
            mediaElement.appendChild(source);
        }

        // Création de la légende
        const infoDiv = document.createElement('div');
        infoDiv.className = 'media-info';
        
        const title = document.createElement('h3');
        title.textContent = item.title;
        
        const likes = document.createElement('span');
        likes.className = 'likes';
        likes.innerHTML = `${item.likes} ♥`;

        // Assemblage des éléments
        infoDiv.appendChild(title);
        infoDiv.appendChild(likes);
        mediaCard.appendChild(mediaElement);
        mediaCard.appendChild(infoDiv);
        mediaSection.appendChild(mediaCard);
    });
}



async function init() {
    const { photographer, media } = await getPhotographerData();
    
    if (!photographer || !media.length) {
        window.location.href = 'index.html';
        return;
    }
    const firstName = await displayPhotographer(photographer); 
    displayPhotographer(photographer);
    displayMedia(media, firstName);
}


init();