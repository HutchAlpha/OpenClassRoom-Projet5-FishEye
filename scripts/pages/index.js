import Photographer from "../templates/photographer.js";

async function getPhotographers() {
  try {
    const response = await fetch("data/photographers.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors du chargement des photographes :", error);
    return null;
  }
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
    
