# Frontend V21 — Paie des enseignants

Module Angular standalone intégré au frontend V20 validé.

## Route
- `/payroll/teachers`

## Fonctions
- Calcul d'une paie par enseignant / année scolaire / mois.
- Consultation des périodes de paie et des calculs existants.
- Détail du calcul : type mensuel/horaire/mixte, présences, absences, retards, heures rémunérées, taux et montants.
- Paiement total ou partiel avec mode de paiement.
- Session de caisse obligatoire côté interface pour les espèces, conformément au backend.
- Reçu affiché immédiatement après paiement et imprimable.
- Bulletin de rémunération imprimable avec détail des séances.
- Information visible sur l'envoi automatique de l'e-mail enseignant après paiement.
- Aucun `alert()`, `confirm()` ou `prompt()` navigateur.

## Permissions
- `PAIE_ENSEIGNANT_CONSULTER`
- `PAIE_ENSEIGNANT_CALCULER`
- `PAIE_ENSEIGNANT_PAYER`

## API V21 utilisée
- `POST /api/payroll/teachers/calculate`
- `GET /api/payroll/teachers/{id}`
- `GET /api/payroll/teachers?periodId=...`
- `GET /api/payroll/teachers/periods`
- `POST /api/payroll/teachers/{payrollId}/payments`
- `GET /api/payroll/teachers/payments/{paymentId}/receipt`
