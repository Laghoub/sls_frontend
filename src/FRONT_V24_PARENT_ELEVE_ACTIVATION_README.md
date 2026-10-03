# Front V24 — Parent / Élève / Activation
- Route publique `/activation?token=...` : vérifie le token V24 et permet de créer le mot de passe.
- Connexion : PARENT -> `/parent-space`, ELEVE -> `/student-space`, ENSEIGNANT -> `/my-space`, autres -> `/dashboard`.
- Parent : enfants, situation financière, créances, paiements, emploi du temps, assiduité, exercices, notes.
- Élève : emploi du temps, assiduité, exercices, évaluations/notes.
- Sidebar : parent/élève/enseignant ne voient que leur espace respectif.
- Administration : bouton d'activation ajouté à la liste des responsables lorsque `COMPTE_ACTIVER` est accordée. Le backend V24 reste la source de vérité et envoie le mail d'activation.
