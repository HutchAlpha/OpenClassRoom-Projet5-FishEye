export { displayModal, closeModal };

function displayModal() {
  const modal = document.getElementById("contact_modal");
  if (!modal) return;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  const firstInput = modal.querySelector("input");
  firstInput?.focus();
  if (!modal.dataset.eventsBound) {
    modal.dataset.eventsBound = "true";
  }
}


function closeModal() {
    const modal = document.getElementById("contact_modal");
    modal.style.display = "none";
}

function setupFormCloseButton() {
  const closeBtn = document.querySelector('.form-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        closeModal();
      }
    });
  }
}

const boutonForm = document.querySelector("form");
boutonForm?.addEventListener("submit", traitementFormulaire);

function traitementFormulaire(event) {
  event.preventDefault();
  clearErrors();
  let valid = true;
  const prenom = document.getElementById("prenom");
  const nom = document.getElementById("nom");
  const email = document.getElementById("email");
  const message = document.getElementById("message");

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
    console.log({
      prenom: prenom.value, nom: nom.value, email: email.value, message: message.value
    });

    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "block";
    boutonForm.reset();
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }
}

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
  });
}

setupFormCloseButton();


//!Tabulaton formulaire complet
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("contact_modal");
  if (!modal || modal.style.display !== "flex") return;

  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }

  const focusables = modal.querySelectorAll(
    'input, textarea, button, .form-close, [tabindex]:not([tabindex="-1"])'
  );
  const focusable = Array.from(focusables).filter(el => !el.disabled && el.offsetParent !== null);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
