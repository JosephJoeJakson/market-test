// La liste des produits
const listeProduits = document.getElementById("liste-produits");
// Le compteur avec le nombre total de produits
const compteurProduits = document.getElementById("compteur-produits");
// La barre de recherche
const rechercheInput = document.getElementById("recherche");
// Le select avec le tri
const triSelect = document.getElementById("tri");
// Le bouton pour rest les filtres
const resetFiltres = document.getElementById("reset-filtres");

// Tableau avec tous les produits
let produits = [];
let produitsFiltres = [];

// Le chargement des produtis
const chargerProduits = async () => {
  try {
    const response = await fetch("/liste_produits_quotidien.json");
    const data = await response.json();
    produits = data;
    produitsFiltres = [...produits];
    afficherProduits();
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
};

// L'affichage des produits 
const afficherProduits = () => {
  listeProduits.innerHTML = "";

  produitsFiltres.forEach(produit => {
    const item = document.createElement("li");

    const isOutOfStock = produit.quantite_stock <= 0;

    item.innerHTML = `
      <div class="card ${isOutOfStock ? "epuise" : ""}">
        <h2 class="h2">${produit.nom}</h2>
        <p><strong>Quantité en stock :</strong> 
          ${isOutOfStock ? "Stock épuisé" : produit.quantite_stock}
        </p>
        <p><strong>Prix unitaire :</strong> ${produit.prix_unitaire.toFixed(2)} €</p>
        <button class="btn" ${isOutOfStock ? "disabled" : ""} data-produit='${JSON.stringify(produit)}'>
          ${isOutOfStock ? "Indisponible" : "AJOUTER À LA LISTE"}
        </button>
      </div>
    `;
    listeProduits.appendChild(item);
  });

  compteurProduits.textContent = `${produitsFiltres.length} produit${produitsFiltres.length > 1 ? "s" : ""}`;

  // Lier les boutons
  document.querySelectorAll("button[data-produit]").forEach(btn => {
    btn.addEventListener("click", e => {
      const produit = JSON.parse(e.currentTarget.dataset.produit);
      ajouterALaListe(produit);
    });
  });
};


// Filter les boutons
const filtrerProduits = () => {
  const recherche = rechercheInput.value.toLowerCase();
  const tri = triSelect.value;

  produitsFiltres = produits
    .filter(p => p.nom.toLowerCase().includes(recherche))
    .sort((a, b) => {
      if (tri === "prix") return a.prix_unitaire - b.prix_unitaire;
      return a.nom.localeCompare(b.nom);
    });

  afficherProduits();
};

const ajouterALaListe = produit => {
  const liste = JSON.parse(localStorage.getItem("liste_courses") || "[]");

  // Trouver le produit dans la liste existante
  const index = liste.findIndex(p => p.nom === produit.nom);

  if (index !== -1) {
    liste[index].quantite += 1;
  } else {
    liste.push({ ...produit, quantite: 1 });
  }

  // Réduction du stock
  const stockIndex = produits.findIndex(p => p.nom === produit.nom);

  if (stockIndex !== -1) {
    if (produits[stockIndex].quantite_stock > 0) {
      produits[stockIndex].quantite_stock -= 1;

      // Si stock atteint 0 après l'ajout
      if (produits[stockIndex].quantite_stock === 0) {
        afficherToast("Produit en rupture de stock !");
        
        const cartes = document.querySelectorAll(".card");

        cartes.forEach(card => {
          if (card.querySelector("h2").textContent === produit.nom) {
            card.classList.add("epuise");
            const btn = card.querySelector("button");
            btn.disabled = true;
            btn.textContent = "Indisponible";

            const stockText = card.querySelector("p");
            stockText.innerHTML = "<strong>Quantité en stock :</strong> Stock épuisé";
          }
        });
      } else {
        // Mettre à jour visuellement le stock affiché si > 0
        const cartes = document.querySelectorAll(".card");
        cartes.forEach(card => {
          if (card.querySelector("h2").textContent === produit.nom) {
            const stockText = card.querySelector("p");
            stockText.innerHTML = `<strong>Quantité en stock :</strong> ${produits[stockIndex].quantite_stock}`;
          }
        });
      }

      // Sauvegarder dans le localStorage
      localStorage.setItem("liste_courses", JSON.stringify(liste));
      afficherToast(`${produit.nom} ajouté à la liste !`, "success");

    } else {
      afficherToast("Ce produit est déjà en rupture de stock !");
      return;
    }
  }
};


// Toast
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



rechercheInput.addEventListener("input", filtrerProduits);
triSelect.addEventListener("change", filtrerProduits);
resetFiltres.addEventListener("click", () => {
  rechercheInput.value = "";
  triSelect.value = "nom";
  produitsFiltres = [...produits];
  afficherProduits();
});

chargerProduits();
