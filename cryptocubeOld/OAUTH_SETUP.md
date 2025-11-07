#  Configuration OAuth pour CryptoCube

##  **Étapes de configuration**

###  **1. Google OAuth**

1. **Créer un projet Google Cloud :**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet "CryptoCube"

2. **Activer l'API Google+ :**
   - APIs & Services > Library
   - Recherchez "Google+ API" et activez-la

3. **Créer des identifiants OAuth :**
   - APIs & Services > Credentials
   - Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3003/api/auth/callback/google`

4. **Copier les identifiants dans .env.local :**
   ```env
   GOOGLE_CLIENT_ID=votre-client-id-google
   GOOGLE_CLIENT_SECRET=votre-client-secret-google
   ```

###  **2. Facebook OAuth**

1. **Créer une app Facebook :**
   - Allez sur [Facebook Developers](https://developers.facebook.com/)
   - Create App > Consumer

2. **Ajouter Facebook Login :**
   - Add Product > Facebook Login
   - Settings > Valid OAuth Redirect URIs: `http://localhost:3003/api/auth/callback/facebook`

3. **Copier les identifiants :**
   ```env
   FACEBOOK_CLIENT_ID=votre-app-id-facebook
   FACEBOOK_CLIENT_SECRET=votre-app-secret-facebook
   ```

###  **3. Reddit OAuth**

1. **Créer une app Reddit :**
   - Allez sur [Reddit App Preferences](https://www.reddit.com/prefs/apps)
   - Create App > Web app
   - Redirect URI: `http://localhost:3003/api/auth/callback/reddit`

2. **Copier les identifiants :**
   ```env
   REDDIT_CLIENT_ID=votre-client-id-reddit
   REDDIT_CLIENT_SECRET=votre-client-secret-reddit
   ```

##  **Test**

1. **Démarrer le serveur :**
   ```bash
   npm run dev
   ```

2. **Tester l'inscription :**
   - Allez sur http://localhost:3001/auth/signup
   - Cliquez sur les boutons Google/Facebook/Reddit
   - Vérifiez que l'utilisateur est créé dans la base de données

##  **Vérification**

### **Base de données :**
L'utilisateur OAuth sera créé avec :
- email: email du provider
- nom/prenom: extrait du nom complet
- username: partie avant @ de l'email
- mot_de_passe: "oauth_user"

### **Session :**
Après connexion, l'utilisateur est redirigé vers `/secure/dashboard`

##  **Important**

1. **NEXTAUTH_SECRET :** Générez une clé secrète forte pour la production
2. **URLs de production :** Mettez à jour les redirect URIs pour votre domaine
3. **Base de données :** Assurez-vous que la table Utilisateur accepte les champs OAuth

##  **Dépannage**

### **Erreur "Provider not found" :**
- Vérifiez que les providers sont bien importés dans auth.ts
- Redémarrez le serveur après modification

### **Erreur de redirection :**
- Vérifiez les redirect URIs dans les consoles OAuth
- Assurez-vous que NEXTAUTH_URL correspond à votre URL locale

### **Erreur de base de données :**
- Vérifiez la connexion DATABASE_URL
- Assurez-vous que la table Utilisateur existe