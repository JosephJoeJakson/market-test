/**
 * @jest-environment jsdom
 */
beforeEach(() => {
    // Reset DOM structure for each test
    document.body.innerHTML = `
      <main class="container">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>PU (€)</th>
              <th>Quantité</th>
              <th>Sous-total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="liste-course-body"></tbody>
        </table>
        <p><strong>Total général :</strong> <span id="total-general">0.00 €</span></p>
        <button id="vider-liste">VIDER LA LISTE</button>
      </main>
      <div id="toast-container" class="toast-container"></div>
    `;
  
    // Fake confirmation always accepts
    global.confirm = jest.fn(() => true);
  
    // Reset localStorage
    localStorage.clear();
  
    // Simulate liste_courses
    localStorage.setItem("liste_courses", JSON.stringify([
      { nom: "Pommes", prix_unitaire: 1.5, quantite: 2 },
      { nom: "Bananes", prix_unitaire: 2.0, quantite: 1 }
    ]));
  
    // Reload the module fresh each time (so it uses updated DOM and localStorage)
    jest.resetModules();
  });
  
  test("affichage du tableau : affiche une ligne par produit", async () => {
    await import("../liste.js");
  
    const rows = document.querySelectorAll("#liste-course-body tr");
    expect(rows.length).toBe(2);
  });
  
  test("affichage du total : calcule le bon total", async () => {
    await import("../liste.js");
  
    const total = document.getElementById("total-general").textContent;
    // Pommes: 1.5 * 2 = 3 + Bananes: 2 * 1 = 2 → total = 5
    expect(total).toBe("5.00 €");
  });
  
  test("modification de quantité met à jour le localStorage", async () => {
    await import("../liste.js");
  
    const input = document.querySelector("input[type='number']");
    input.value = "3";
  
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  
    const updated = JSON.parse(localStorage.getItem("liste_courses"));
    expect(updated[0].quantite).toBe(3);
  });
  
  test("suppression individuelle retire l'élément du DOM et du localStorage", async () => {
    await import("../liste.js");
  
    const button = document.querySelector("button[data-delete='0']");
    button.click();
  
    const rows = document.querySelectorAll("#liste-course-body tr");
    const updated = JSON.parse(localStorage.getItem("liste_courses"));
  
    expect(rows.length).toBe(1);
    expect(updated.length).toBe(1);
    expect(updated[0].nom).toBe("Bananes");
  });
  
  test('bouton "Vider la liste" supprime tous les produits et remet le total à 0', async () => {
    await import("../liste.js");
  
    const viderBtn = document.getElementById("vider-liste");
    viderBtn.click();
  
    const rows = document.querySelectorAll("#liste-course-body tr");
    const total = document.getElementById("total-general").textContent;
    const stored = localStorage.getItem("liste_courses");
  
    expect(rows.length).toBe(0);
    expect(total).toBe("0.00 €");
    expect(stored).toBeNull();
  });
  