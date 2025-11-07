// Configuration globale des tests
// Ce fichier est exécuté avant chaque suite de tests

// Configuration des timeouts pour les tests (10 secondes)
jest.setTimeout(10000);

// Configuration globale pour tous les tests
beforeAll(() => {
  // Configuration initiale si nécessaire
  console.log(' Initialisation des tests CryptoCube...');
});

// Nettoyage après chaque test
afterEach(() => {
  // Nettoyer tous les mocks après chaque test
  jest.clearAllMocks();
});

// Nettoyage final
afterAll(() => {
  // Nettoyage final si nécessaire
  console.log('Tests terminés');
});