# Frontend Personnel & Enseignants V15

Basé sur le `src(9).zip` fourni le 13/09/2026 et compatible avec le backend Personnel V15.

## Routes
- `/hr` : tableau de bord RH
- `/hr/employees` : personnel
- `/hr/employees/:id` : dossier RH détaillé
- `/hr/teachers` : enseignants
- `/hr/teachers/:id` : matières, affectations et rémunération
- `/hr/assignments` : affectations pédagogiques
- `/hr/compensation` : plans et grilles tarifaires

## Règles métier couvertes
- un enseignant peut enseigner plusieurs matières ;
- rémunération MONTHLY / HOURLY / MIXED ;
- en MIXED, salaire mensuel + tarif horaire complémentaire ;
- tarifs spécifiques possibles par classe et matière ;
- historique des plans et affectations ;
- dossier RH enrichi : qualifications, expérience, contrats, contacts d'urgence, documents et notes.
