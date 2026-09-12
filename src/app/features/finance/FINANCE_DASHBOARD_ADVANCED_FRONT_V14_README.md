# Finance Dashboard avancé - Frontend V14

Cette version part du `src(7).zip` fourni et remplace le tableau de bord Finance minimal par un tableau de bord analytique complet compatible avec :

`GET /api/finance/dashboard/analytics`

## Nouveaux fichiers
- `models/finance-dashboard.model.ts`
- `services/finance-dashboard.service.ts`

## Fichiers remplacés
- `pages/finance-home/finance-home.component.ts`
- `pages/finance-home/finance-home.component.html`
- `pages/finance-home/finance-home.component.scss`

## Filtres disponibles
- année scolaire
- cycle
- niveau
- classe
- campus
- type de frais
- mode de paiement
- date de début / date de fin

Les listes Niveau et Classe sont filtrées dynamiquement selon les sélections parentes.

## Statistiques affichées
- facturé brut / réductions / facturé net
- encaissé sur créances
- reste à recouvrer
- impayés échus
- taux de recouvrement
- nombre de créances, élèves, familles
- avoirs disponibles
- paiements bruts / remboursements / net encaissé / paiement moyen
- contrôle caisse : fonds, entrées, sorties, attendu, réel, écart, sessions
- évolution mensuelle facturation vs net encaissé
- répartition des statuts de créance
- répartition par mode de paiement
- performance par type de frais
- analyse par cycle, niveau, classe, campus
- top 10 familles débitrices
- suivi des mails financiers envoyés / en attente / échec
- raccourcis vers les principaux écrans Finance

Aucune bibliothèque graphique externe n'est ajoutée : les visualisations utilisent HTML/CSS afin de rester compatibles avec le projet Angular actuel.
