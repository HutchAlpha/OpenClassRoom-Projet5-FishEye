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


    document.querySelector('.photograph-header h1').textContent = name;
    document.querySelector('.photograph-header .location').textContent = `${city}, ${country}`;
    document.querySelector('.photograph-header .tagline').textContent = tagline;
    document.querySelector('.photograph-header img').src = picture;
    document.querySelector('.photograph-header img').alt = name;

    return firstName;
}

// Affiche les médias
function displayMedia(media, firstName) {
    const mediaSection = document.querySelector('.photographer-media');
    mediaSection.innerHTML = ''; // Reset du contenu

    //Récolte tout les likes de la personnes
    const TOTALlikes = media.reduce((depart, item) => depart + item.likes, 0);

    media.forEach(item => {
        // Conteneur principal
        const container = document.createElement('div');
        container.className = 'PresentationPhotographe';

        // Block média (image/vidéo + détails)
        const blockMedia = document.createElement('div');
        blockMedia.className = 'blockMedia';

        // Création du média
        let mediaElement;
        if (item.image) {
            mediaElement = document.createElement('img');
            mediaElement.src = `assets/photographers/${firstName}/${item.image}`;
            mediaElement.alt = item.title;

            mediaElement.addEventListener("click", function() {
                const overlay = document.querySelector(".overlay");
                const mainImage = document.getElementById("mainImage");
            
                if (overlay) {
                    overlay.style.display = "block";
                    mainVideo.style.display = "none";
                    mainImage.style.display = "block";
                    mainImage.src = `assets/photographers/${firstName}/${item.image}`;
                    mainImage.alt = item.title; 
                }
            });

        } else if (item.video) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            const source = document.createElement('source');
            source.src = `assets/photographers/${firstName}/${item.video}`;
            source.type = 'video/mp4';
            mediaElement.appendChild(source);

            mediaElement.addEventListener("click", function() {
                const overlay = document.querySelector(".overlay");
                const mainVideo = document.getElementById("mainVideo");
            
                if (overlay) {
                    overlay.style.display = "block";
                    mainImage.style.display = "none";
                    mainVideo.style.display = "block";
                    mainVideo.src = `assets/photographers/${firstName}/${item.video}`;
                }
            });
            
        }


        // Détails sous le média
        const detailMedia = document.createElement('div');
        detailMedia.className = 'detailMedia';

        const title = document.createElement('h3');
        title.textContent = item.title;
        
        const likes = document.createElement('span');
        likes.className = 'likes';
        likes.textContent = `${item.likes} ♥`;


        detailMedia.appendChild(title);
        detailMedia.appendChild(likes);
        blockMedia.appendChild(mediaElement);
        blockMedia.appendChild(detailMedia);
        container.appendChild(blockMedia);
        mediaSection.appendChild(container);
    });
    return TOTALlikes;
}
/*Affichage des détails lorsque click image*/
function closeOverlay() {
    let closebtn = document.querySelector(".close-btn");

    closebtn.addEventListener("click", () => {
        let overlay = document.querySelector(".overlay");
        overlay.style.display = "none";
    });
}




/*fin Affichage des détails lorsque click image*/


    function Prix(photographer, TOTALlikes) {
        const { price } = photographer;
        document.querySelector('.media-info .TOTALlikes').innerHTML = `${TOTALlikes} <span class="heart">♥</span>`;
        document.querySelector('.media-info .price').textContent = `${price} €/ Jour`;
    }

    async function init() {
        const { photographer, media } = await getPhotographerData();
        
        if (!photographer || !media.length) {
            window.location.href = 'index.html';
            return;
        }
        const firstName = await displayPhotographer(photographer); 
        const TOTALlikes = displayMedia(media, firstName);
        Prix(photographer, TOTALlikes);
    }


init();