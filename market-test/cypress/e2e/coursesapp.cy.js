//1
describe('Affichage initial de la page /index.html', () => {
    beforeEach(() => {
      cy.visit('/index.html');
    });
  
    it('Affiche les produits dans #liste-produits', () => {
      cy.get('#liste-produits').children().should('have.length.at.least', 1);
    });
  
    it('Affiche le nombre de produits dans #compteur-produits', () => {
      cy.get('#compteur-produits').should('contain.text', 'produit');
    });
  });
  
//2
describe('Recherche de produit', () => {
  beforeEach(() => {
    cy.visit('/index.html');
  });

  it('Filtre les produits avec le mot-clé "Lait"', () => {
    cy.get('#recherche').type('Lait');
    cy.get('#liste-produits').children().should('have.length', 3);
  });
});

//4 
describe('Réinitialisation des filtres', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.get('#recherche').type('Lait');
    cy.get('#tri').select('prix');
    cy.get('#reset-filtres').click();
  });

  it('Réinitialise le champ de recherche', () => {
    cy.get('#recherche').should('have.value', '');
  });

  it('Réinitialise le champ de tri', () => {
    cy.get('#tri').should('have.value', 'nom');
  });

  it('Réaffiche tous les produits', () => {
    cy.get('#liste-produits').children().should('have.length.at.least', 1);
  });
});

//5
describe('Ajout d’un produit à la liste de courses', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.clearLocalStorage();
  });

  it('Ajoute un produit au localStorage après clic sur "Ajouter à la liste"', () => {
    cy.get('#liste-produits li button')
      .first()
      .click();

    cy.window().then(win => {
      const liste = JSON.parse(win.localStorage.getItem('liste_courses'));
      expect(liste).to.be.an('array').and.have.length(1);
      expect(liste[0]).to.have.all.keys('nom', 'prix_unitaire', 'quantite_stock', 'quantite');
    });
  });
});


//6
describe('Affichage de la liste de course sur /liste.html', () => {
  beforeEach(() => {
    cy.visit('/index.html');

    cy.window().then(win => {
      win.localStorage.setItem(
        'liste_courses',
        JSON.stringify([
          { nom: 'Lait', prix_unitaire: 1.2, quantite: 2 }
        ])
      );
    });

    cy.visit('/src/liste.html');
  });

  it('Affiche les produits dans le tableau', () => {
    cy.get('#liste-course-body tr').should('have.length.at.least', 1);
  });

  it('Affiche le total général', () => {
    cy.get('#total-general').should('contain.text', '2.40');
  });
});


//7
describe('Modification de la quantité d’un produit', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.window().then(win => {
      win.localStorage.setItem(
        'liste_courses',
        JSON.stringify([{ nom: 'Pain', prix_unitaire: 1, quantite: 1 }])
      );
    });
    cy.visit('/src/liste.html');
  });

  it('Modifie la quantité et met à jour le sous-total et le total général', () => {
    cy.get('#liste-course-body input[type="number"]')
      .clear()
      .type('3');

    cy.get('#total-general').should('contain.text', '3.00');
  });
});


//8
describe('Suppression d’un produit de la liste', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.window().then(win => {
      win.localStorage.setItem(
        'liste_courses',
        JSON.stringify([{ nom: 'Lait', prix_unitaire: 1.2, quantite: 1 }])
      );
    });
    cy.visit('/src/liste.html');
  });

  it('Supprime un produit et met à jour le localStorage', () => {
    cy.get('[data-delete]').click();

    cy.get('#liste-course-body tr').should('have.length', 0);

    cy.window().then(win => {
      const liste = JSON.parse(win.localStorage.getItem('liste_courses'));
      expect(liste).to.have.length(0);
    });
  });
});

//9
describe('Vider complètement la liste de course', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.window().then(win => {
      win.localStorage.setItem(
        'liste_courses',
        JSON.stringify([
          { nom: 'Lait', prix_unitaire: 1.2, quantite: 2 },
          { nom: 'Pain', prix_unitaire: 1, quantite: 1 }
        ])
      );
    });
    cy.visit('/src/liste.html');
  });

  it('Vider la liste après confirmation', () => {
    cy.window().then(win => cy.stub(win, 'confirm').returns(true));

    cy.get('#vider-liste').click();

    cy.get('#liste-course-body tr').should('have.length', 0);
    cy.get('#total-general').should('contain.text', '0');
  });
});

//3
describe('Tri des produits sur /index.html', () => {
  beforeEach(() => {
    cy.visit('/index.html');
  });

  it('Trie les produits par prix (ordre croissant)', () => {
    cy.get('#tri').select('prix');

    cy.wait(500);

    cy.get('#liste-produits .prix-produit')
      .then($items => {
        const prix = [...$items].map(el => parseFloat(el.innerText.replace(',', '.')));
        const prixTries = [...prix].sort((a, b) => a - b);
        expect(prix).to.deep.equal(prixTries);
      });
  });
});
