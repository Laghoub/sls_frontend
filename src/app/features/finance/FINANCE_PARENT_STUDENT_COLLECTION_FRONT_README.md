# Finance – Encaissement Parent → Élève → Créances

Cette version du frontend remplace le parcours d'encaissement limité aux dossiers `EN_ATTENTE_PAIEMENT` par un parcours centré sur le responsable et ses enfants.

## Nouveau parcours

1. Rechercher un responsable.
2. Charger automatiquement ses enfants via :
   `GET /api/finance/collection/guardians/{guardianId}/students`
3. Choisir l'élève.
4. Charger ses créances ouvertes via :
   `GET /api/finance/collection/guardians/{guardianId}/students/{studentId}/open-charges`
5. Sélectionner une ou plusieurs créances.
6. Saisir un paiement total ou partiel.
7. Valider via l'endpoint de paiement existant.

## Sécurité UX importante

Aucune mensualité n'est sélectionnée automatiquement. Cela évite qu'un caissier encaisse accidentellement toutes les mensualités de l'année lorsqu'il voulait seulement payer un mois.

Le bouton « Régler la plus ancienne » sélectionne uniquement la première créance ouverte.

## Paiement partiel

Le champ « Montant à régler » peut être inférieur au reste dû. Le backend conserve alors la créance en `PARTIALLY_PAID`.

## Paiement de plusieurs mois

Il suffit de saisir le montant complet sur plusieurs lignes. Le total encaissé se recalcule automatiquement.

## Avoir famille

Si le montant encaissé est supérieur au montant ventilé, le reliquat reste géré par le backend comme avoir famille, conformément au comportement déjà existant.
