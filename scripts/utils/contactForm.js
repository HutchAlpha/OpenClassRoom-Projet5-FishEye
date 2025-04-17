function displayModal() {
    const modal = document.getElementById("contact_modal");
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("contact_modal");
    modal.style.display = "none";
}


//!traitement formulaire
const BoutonForm = document.querySelector("form");
BoutonForm.addEventListener("submit", traitementFormulaire);
  
function traitementFormulaire(event) {
  event.preventDefault();
  console.log("Le bouton du formulaire a été cliqué !");

  clearErrors();
  let valid = true;

  //? Récupération des données du formulaire
  const prenom = document.getElementById("prenom");
  const nom = document.getElementById("nom");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  
  //? Vérification des données
  if (prenom.value.length < 2) {
    showError(prenom, "Veuillez renseigner au moins 2 caractères pour votre prénom");
    valid = false;
  }

  if (nom.value.length < 2) {
    showError(nom, "Veuillez entrer 2 caractères ou plus pour le champ du nom.");
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    showError(email, "Veuillez renseigner un email valide");
    valid = false;
  }

  if (message.value.length < 5) {
    showError(message, "Veuillez entrer 5 caractères ou plus sur le champ message");
    valid = false;
}


  if (valid) {
    console.log(`
        Prénom : ${prenom.value},
        Nom : ${nom.value}, 
        Email : ${email.value};
        Message : ${message.value};
    `)

        // Affichage du message de succès
        const successMessage = document.getElementById("successMessage");
        successMessage.style.display = "block";

        BoutonForm.reset();

        setTimeout(() => {
            successMessage.style.display = "none";
        }, 3000);
    }
}


//! Affichage Erreur
function showError(element, message) {
    const parent = element.closest(".formData");
    if (parent) {
      parent.setAttribute("data-error", message);
      parent.setAttribute("data-error-visible", "true");
    }
  }
  
  function clearErrors() {
    document.querySelectorAll(".formData").forEach((field) => {
      field.removeAttribute("data-error");
      field.removeAttribute("data-error-visible");
      const successMessage = document.getElementById("successMessage");
      successMessage.style.display = "none";
   
    });
  }