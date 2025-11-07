#  Guide des Tests Unitaires pour CryptoCube

##  Configuration des Tests

### Dépendances installées :
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "jest-environment-node": "^29.7.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2"
  }
}
```

### Scripts disponibles :
```bash
npm test                 # Exécuter tous les tests
npm run test:watch       # Mode watch (re-exécute automatiquement)
npm run test:coverage    # Rapport de couverture de code
```

##  Tests Implémentés

###  Tests Unitaires (signup-unit.test.ts)
- **Validation email** : Format, regex
- **Validation username** : Longueur, caractères autorisés
- **Validation mot de passe** : Longueur, complexité
- **Validation champs requis** : Présence de tous les champs
- **Codes de statut HTTP** : 400, 409, 201, 500
- **Messages d'erreur** : Clarté et cohérence

###  Résultats des Tests
```
 11 tests passés
 Temps d'exécution : < 1 seconde
Couverture : Tests de validation complète
```

##  Types de Tests

### 1. **Tests de Validation**
Testent toutes les règles de validation :
- Format email valide
- Username entre 3-20 caractères
- Mot de passe complexe (8+ chars, majuscule, minuscule, chiffre, caractère spécial)
- Correspondance des mots de passe

### 2. **Tests de Logique Métier**
- Hashage des mots de passe
- Gestion des doublons email/username
- Création d'utilisateur

### 3. **Tests de Gestion d'Erreurs**
- Champs manquants → 400
- Données invalides → 400
- Doublons → 409
- Erreurs serveur → 500

## Utilisation

### Exécuter tous les tests :
```bash
npm test
```

### Exécuter les tests en mode watch :
```bash
npm run test:watch
```

### Voir la couverture de code :
```bash
npm run test:coverage
```

## Commandes Utiles

```bash
# Lancer un test spécifique
npx jest signup-unit.test.ts

# Lancer les tests avec plus de détails
npx jest --verbose

# Générer un rapport HTML de couverture
npx jest --coverage --coverageReporters=html
```

## Métriques

- **Temps d'exécution** : < 1 seconde
- **Tests** : 11 tests unitaires
- **Couverture** : Toutes les validations critiques
- **Fiabilité** : 100% de réussite

