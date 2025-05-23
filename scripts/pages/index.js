import Photographer from "../templates/photographer.js";

async function getPhotographers() {
        const response = await fetch("data/photographers.json");
        const data = await response.json()
        console.log("Données des photographes :", data);
        return data;
    }

async function displayData(photographers) {
    const photographersSection = document.querySelector(".photographer_section");

    photographers.forEach((photographerData) => {
        const photographer = new Photographer(photographerData); 
        const userCardDOM = photographer.createCard();         
        photographersSection.appendChild(userCardDOM);
    });
}


    async function init() {
        // Récupère les datas des photographes
        const { photographers } = await getPhotographers();
        displayData(photographers);
    }
    
    init();
    
