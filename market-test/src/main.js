// Accès dynamique aux éléments DOM
const getListeProduits = () => document.getElementById("liste-produits");
const getCompteurProduits = () => document.getElementById("compteur-produits");
const getRechercheInput = () => document.getElementById("recherche");
const getTriSelect = () => document.getElementById("tri");
const getResetFiltres = () => document.getElementById("reset-filtres");
const getToastContainer = () => document.getElementById("toast-container");

// État global simulé — defined as let but wrapped via Proxy later
let produits = [];
let produitsFiltres = [];

/**
 * Wrap array setters in a proxy to keep assignment in sync
 */
const __TEST__ = {};

Object.defineProperties(__TEST__, {
  produits: {
    get: () => produits,
    set: (value) => {
      produits.length = 0;
      produits.push(...value);
    },
  },
  produitsFiltres: {
    get: () => produitsFiltres,
    set: (value) => {
      produitsFiltres.length = 0;
      produitsFiltres.push(...value);
    },
  },
});

const chargerProduits = async () => {
  try {
    const response = await fetch("/liste_produits_quotidien.json");
    const data = await response.json();
    __TEST__.produits = data;
    __TEST__.produitsFiltres = [...data];
    afficherProduits();
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
};

const afficherProduits = () => {
  const listeProduits = getListeProduits();
  const compteurProduits = getCompteurProduits();
  if (!listeProduits || !compteurProduits) return;

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

  document.querySelectorAll("button[data-produit]").forEach(btn => {
    btn.addEventListener("click", e => {
      const produit = JSON.parse(e.currentTarget.dataset.produit);
      ajouterALaListe(produit);
    });
  });
};

const filtrerProduits = () => {
  const recherche = getRechercheInput()?.value.toLowerCase() || "";
  const tri = getTriSelect()?.value || "nom";

  __TEST__.produitsFiltres = __TEST__.produits
    .filter(p => p.nom.toLowerCase().includes(recherche))
    .sort((a, b) => {
      if (tri === "prix") return a.prix_unitaire - b.prix_unitaire;
      return a.nom.localeCompare(b.nom);
    });

  afficherProduits();
};

const ajouterALaListe = produit => {
  const liste = JSON.parse(localStorage.getItem("liste_courses") || "[]");

  const index = liste.findIndex(p => p.nom === produit.nom);
  if (index !== -1) {
    liste[index].quantite += 1;
  } else {
    liste.push({ ...produit, quantite: 1 });
  }

  const stockIndex = produits.findIndex(p => p.nom === produit.nom);

  if (stockIndex !== -1) {
    if (produits[stockIndex].quantite_stock > 0) {
      produits[stockIndex].quantite_stock -= 1;

      if (produits[stockIndex].quantite_stock === 0) {
        afficherToast("Produit en rupture de stock !");
        document.querySelectorAll(".card").forEach(card => {
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
        document.querySelectorAll(".card").forEach(card => {
          if (card.querySelector("h2").textContent === produit.nom) {
            const stockText = card.querySelector("p");
            stockText.innerHTML = `<strong>Quantité en stock :</strong> ${produits[stockIndex].quantite_stock}`;
          }
        });
      }

      localStorage.setItem("liste_courses", JSON.stringify(liste));
      afficherToast(`${produit.nom} ajouté à la liste !`, "success");
    } else {
      afficherToast("Ce produit est déjà en rupture de stock !");
    }
  }
};

const afficherToast = (message, type = "info") => {
  const container = getToastContainer();
  if (!container) return;

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

const initialiserListeners = () => {
  const rechercheInput = getRechercheInput();
  const triSelect = getTriSelect();
  const resetFiltres = getResetFiltres();

  if (!rechercheInput || !triSelect || !resetFiltres) return;

  rechercheInput.addEventListener("input", filtrerProduits);
  triSelect.addEventListener("change", filtrerProduits);
  resetFiltres.addEventListener("click", () => {
    rechercheInput.value = "";
    triSelect.value = "nom";
    __TEST__.produitsFiltres = [...__TEST__.produits];
    afficherProduits();
  });
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initialiserListeners();
    chargerProduits();
  });
}

export { afficherProduits, filtrerProduits, ajouterALaListe, initialiserListeners };
export { __TEST__ };
