// Chargement de la liste depuis le localStorage
let listeCourses = JSON.parse(localStorage.getItem("liste_courses") || "[]");

const tbody = document.getElementById("liste-course-body");
const totalGeneral = document.getElementById("total-general");
const btnVider = document.getElementById("vider-liste");

const afficherListe = () => {
  tbody.innerHTML = "";

  listeCourses.forEach((produit, index) => {
    const tr = document.createElement("tr");

    const sousTotal = (produit.prix_unitaire * produit.quantite).toFixed(2);

    tr.innerHTML = `
      <td>${produit.nom}</td>
      <td>${produit.prix_unitaire.toFixed(2)} €</td>
      <td>
        <input type="number" value="${produit.quantite}" min="1" data-index="${index}" />
      </td>
      <td>${sousTotal} €</td>
      <td>
        <button class="btn-supprimer" data-delete="${index}">SUPPRIMER</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  mettreAJourTotal();
};

const mettreAJourTotal = () => {
  const total = listeCourses.reduce(
    (acc, produit) => acc + produit.prix_unitaire * produit.quantite,
    0
  );
  totalGeneral.textContent = `${total.toFixed(2)} €`;
};

const afficherToast = (message, type = "info") => {
    const container = document.getElementById("toast-container");
  
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
  
    container.appendChild(toast);
  
    setTimeout(() => {
      toast.style.animation = "fadeOut 0.5s forwards";
      toast.addEventListener("animationend", () => {
        toast.remove();
      });
    }, 2500);
  
    const toasts = container.querySelectorAll(".toast");
    if (toasts.length > 8) {
      toasts[0].remove();
    }
  };

  
// Gérer le changement de quantité
tbody.addEventListener("input", (e) => {
  if (e.target.matches("input[type='number']")) {

    const index = parseInt(e.target.dataset.index);
    const nouvelleQuantite = parseInt(e.target.value);

    if (!isNaN(nouvelleQuantite) && nouvelleQuantite > 0) {

      listeCourses[index].quantite = nouvelleQuantite;
      localStorage.setItem("liste_courses", JSON.stringify(listeCourses));
      afficherToast(`Quantité de ${listeCourses[index].nom} mise à jour`, "info");
      afficherListe();
    }
  }
});

// Gérer suppression individuelle
tbody.addEventListener("click", (e) => {
  if (e.target.matches("button[data-delete]")) {
    const index = parseInt(e.target.dataset.delete);
    const produit = listeCourses[index];
    listeCourses.splice(index, 1);
    localStorage.setItem("liste_courses", JSON.stringify(listeCourses));
    afficherToast(`${produit.nom} supprimé de la liste`, "error");
    afficherListe();

  }
});

// Gérer le bouton "Vider la liste"
btnVider.addEventListener("click", () => {
  if (confirm("Voulez-vous vraiment supprimer tous les produits ?")) {
    listeCourses = [];
    localStorage.removeItem("liste_courses");
    afficherToast("Liste vidée avec succès", "error");
    afficherListe();
  }
});

// Initialisation
afficherListe();
