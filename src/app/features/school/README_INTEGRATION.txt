MODULE FRONTEND SCHOOL — Groupe Scolaire Sciences et Lettres

Copier le dossier `school` dans :
src/app/features/

Contenu :
- Années scolaires
- Cycles
- Niveaux
- Campus
- Salles
- Classes
- Créneaux horaires
- Calendrier scolaire
- Models, services HTTP, composants TS/HTML/SCSS
- Style partagé cohérent avec le layout
- Routes lazy du module

Dans les `children` du MainLayout, ajouter :

{
  path: 'school',
  loadChildren: () =>
    import('./features/school/school.routes')
      .then(m => m.SCHOOL_ROUTES)
}

URLs :
/school/school-years
/school/cycles
/school/levels
/school/campuses
/school/rooms
/school/classes
/school/time-slots
/school/calendar

IMPORTANT :
Le dossier est conçu pour le backend School construit ensemble et utilise les permissions :
ANNEE_SCOLAIRE_*, CYCLE_*, NIVEAU_*, CAMPUS_*, SALLE_*, CLASSE_*,
CRENEAU_* et CALENDRIER_SCOLAIRE_*.

Pour définir l'année courante, le service utilise :
PUT /api/school-years/{id}/current

Si le mapping exact de votre SchoolYearController diffère, seule la méthode
setCurrent() de school-year.service.ts est à aligner.

Le calendrier ne propose volontairement pas de suppression : le backend construit
pour SchoolCalendarException expose création/modification/consultation sans DELETE.
