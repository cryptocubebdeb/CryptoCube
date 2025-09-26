export type User = {
  id: number;          // maps to id_utilisateur
  email: string;       // user's email
  motDePasse: string;    // maps to mot_de_passe
  nom: string;         // last name
  prenom: string;      // first name
  username: string;    // unique username
};