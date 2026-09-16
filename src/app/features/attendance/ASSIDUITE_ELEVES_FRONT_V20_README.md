# Frontend V20 — Assiduité élèves

Ajoute la saisie et l'historique de l'assiduité des élèves sur le frontend V18 validé.

- Saisie par date + classe + créneau.
- Élèves attendus fournis par `/api/student-attendance/expected`.
- Présent / Absent / Retard, minutes, justification, motif, observation.
- Enregistrement batch via `/api/student-attendance/batch`.
- Historique et statistiques via `/api/student-attendance` et `/summary`.
- Information visible que les parents sont automatiquement notifiés par e-mail pour ABSENT/RETARD ; l'envoi lui-même reste géré par le backend V20.
- Routes `/attendance/students` et `/attendance/students/history`.
- Permissions `ASSIDUITE_ELEVE_CONSULTER` et `ASSIDUITE_ELEVE_SAISIR`.
- Aucun alert/confirm/prompt navigateur.
