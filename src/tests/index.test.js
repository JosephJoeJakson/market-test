/**
 * @jest-environment jsdom
 */
import {
  afficherProduits,
  filtrerProduits,
  ajouterALaListe,
  initialiserListeners,
  __TEST__,
} from "../main";

beforeEach(() => {
  // Reset localStorage between tests
  localStorage.clear();

  // Reset global state arrays (keep references intact)
  __TEST__.produits.length = 0;
  __TEST__.produitsFiltres.length = 0;

  // Inject full DOM structure
  document.body.innerHTML = `
    <header class="navbar">
      <div class="container">
        <div class="logo">COURSESAPP</div>
        <nav>
          <a href="/src/liste.html">Liste de course</a>
          <a href="/index.html">Produits disponibles</a>
        </nav>
      </div>
    </header>

    <main class="container">
      <section class="top-bar">
        <div class="left">
          <h1>Produits disponibles</h1>
          <span id="compteur-produits" class="badge">0 produit</span>
        </div>
        <div class="right">
          <input type="search" id="recherche" placeholder="Rechercher un produit..." />
          <select id="tri">
            <option value="nom">Trier par nom</option>
            <option value="prix">Trier par prix</option>
          </select>
          <button id="reset-filtres">Réinitialiser</button>
        </div>
      </section>

      <section>
        <ul id="liste-produits" class="product-grid"></ul>
      </section>

      <div id="toast" class="toast hidden">Produit en rupture de stock !</div>
      <div id="toast-container" class="toast-container"></div>
    </main>
  `;

  // Initialize event listeners again
  initialiserListeners();
});

describe("Fonctions à tester (DOM)", () => {
  test("afficherProduits affiche le bon nombre et met à jour le compteur", () => {
    const produits = [
      { nom: "Pommes", quantite_stock: 10, prix_unitaire: 1.5 },
      { nom: "Bananes", quantite_stock: 5, prix_unitaire: 2.0 },
    ];

    __TEST__.produits.push(...produits);
    __TEST__.produitsFiltres.push(...produits);

    afficherProduits();

    const items = document.querySelectorAll("li");
    const compteur = document.getElementById("compteur-produits");

    expect(items.length).toBe(2);
    expect(compteur.textContent).toContain("2 produits");
  });

  test("filtrage fonctionne avec un mot-clé", () => {
    const produits = [
      { nom: "Pommes", quantite_stock: 10, prix_unitaire: 1.5 },
      { nom: "Bananes", quantite_stock: 5, prix_unitaire: 2.0 },
    ];

    __TEST__.produits.push(...produits);
    __TEST__.produitsFiltres.push(...produits);

    document.getElementById("recherche").value = "banane";

    filtrerProduits();

    expect(__TEST__.produitsFiltres.length).toBe(1);
    expect(__TEST__.produitsFiltres[0].nom).toBe("Bananes");
  });

  test("tri croissant par nom et prix fonctionne", () => {
    const produits = [
      { nom: "Zebra", quantite_stock: 10, prix_unitaire: 3.0 },
      { nom: "Apple", quantite_stock: 5, prix_unitaire: 1.0 },
    ];

    __TEST__.produits.push(...produits);

    const select = document.getElementById("tri");

    // Tri par nom
    select.value = "nom";
    filtrerProduits();
    expect(__TEST__.produitsFiltres[0].nom).toBe("Apple");

    // Tri par prix
    select.value = "prix";
    filtrerProduits();
    expect(__TEST__.produitsFiltres[0].prix_unitaire).toBe(1.0);
  });

  test("localStorage ajoute le produit et met à jour le stock", () => {
    const produit = {
      nom: "Poires",
      quantite_stock: 2,
      prix_unitaire: 1.2,
    };

    __TEST__.produits.push({ ...produit });
    __TEST__.produitsFiltres.push({ ...produit });

    afficherProduits();
    ajouterALaListe(produit);

    const stored = JSON.parse(localStorage.getItem("liste_courses"));
    expect(stored.length).toBe(1);
    expect(stored[0].quantite).toBe(1);
    expect(__TEST__.produits[0].quantite_stock).toBe(1);
  });

  test("click bouton fonctionne", () => {
    const produit = {
      nom: "Chocolat",
      quantite_stock: 1,
      prix_unitaire: 3.5,
    };

    __TEST__.produits.push({ ...produit });
    __TEST__.produitsFiltres.push({ ...produit });

    afficherProduits();

    const btn = document.querySelector("button[data-produit]");
    expect(btn).not.toBeNull();

    btn.click();

    const stored = JSON.parse(localStorage.getItem("liste_courses"));
    expect(stored).not.toBeNull();
    expect(stored[0].nom).toBe("Chocolat");
  });
});
