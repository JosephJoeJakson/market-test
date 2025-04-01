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
    item.innerHTML = `
      <div class="card">
        <h2 class="h2">${produit.nom}</h2>
        <p><strong>Quantité en stock :</strong> ${produit.quantite_stock}</p>
        <p><strong>Prix unitaire :</strong> ${produit.prix_unitaire.toFixed(2)} €</p>
        <button class="btn" data-produit='${JSON.stringify(produit)}'>
          AJOUTER À LA LISTE
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

  const index = liste.findIndex(p => p.nom === produit.nom);
  if (index !== -1) {
    liste[index].quantite += 1;
  } else {
    liste.push({ ...produit, quantite: 1 });
  }

  localStorage.setItem("liste_courses", JSON.stringify(liste));
  alert(`${produit.nom} ajouté à votre liste.`);
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
