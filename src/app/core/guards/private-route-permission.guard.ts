import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../config/auth/services/auth.service';

/** Correspondance des routes privées avec les permissions déjà utilisées par le menu. */
const RULES: ReadonlyArray<{pattern: RegExp; permission: string}> = [
  { pattern: /^\/attendance\/teachers\/catchup\/?$/, permission: 'ASSIDUITE_ENSEIGNANT_CONSULTER' },
  { pattern: new RegExp('^/attendance/teachers/history/?$'), permission: 'ASSIDUITE_ENSEIGNANT_CONSULTER' },
  { pattern: new RegExp('^/attendance/teachers/monthly/?$'), permission: 'POINTAGE_MENSUEL_CONSULTER' },
  { pattern: new RegExp('^/attendance/students/history/?$'), permission: 'ASSIDUITE_ELEVE_CONSULTER' },
  { pattern: new RegExp('^/term\\-evaluations/statistics/?$'), permission: 'EVALUATION_TRIMESTRIELLE_CAMPAGNE_GERER' },
  { pattern: new RegExp('^/my\\-space/term\\-evaluations/?$'), permission: 'EVALUATION_TRIMESTRIELLE_SAISIR' },
  { pattern: new RegExp('^/finance/global\\-situation/?$'), permission: 'CREANCE_CONSULTER' },
  { pattern: new RegExp('^/my\\-space/appointments/?$'), permission: 'PORTAIL_ENSEIGNANT_ACCEDER' },
  { pattern: new RegExp('^/finance/staff\\-payroll/?$'), permission: 'PERSONNEL_PAIE_CONSULTER' },
  { pattern: new RegExp('^/my\\-space/evaluations/?$'), permission: 'PORTAIL_ENSEIGNANT_EVALUATIONS' },
  { pattern: new RegExp('^/finance/payments/new/?$'), permission: 'PAIEMENT_CREER' },
  { pattern: new RegExp('^/finance/installments/?$'), permission: 'CREANCE_GERER' },
  { pattern: new RegExp('^/my\\-space/attendance/?$'), permission: 'PORTAIL_ENSEIGNANT_ASSIDUITE' },
  { pattern: new RegExp('^/school/school\\-years/?$'), permission: 'ANNEE_SCOLAIRE_CONSULTER' },
  { pattern: new RegExp('^/hr/staff\\-attendance/?$'), permission: 'PERSONNEL_ASSIDUITE_CONSULTER' },
  { pattern: new RegExp('^/attendance/teachers/?$'), permission: 'ASSIDUITE_ENSEIGNANT_CONSULTER' },
  { pattern: new RegExp('^/attendance/students/?$'), permission: 'ASSIDUITE_ELEVE_CONSULTER' },
  { pattern: new RegExp('^/my\\-space/timetable/?$'), permission: 'PORTAIL_ENSEIGNANT_EMPLOI_DU_TEMPS' },
  { pattern: new RegExp('^/my\\-space/exercises/?$'), permission: 'PORTAIL_ENSEIGNANT_EXERCICES' },
  { pattern: new RegExp('^/appointments\\-admin/?$'), permission: 'RENDEZ_VOUS_ADMIN' },
  { pattern: new RegExp('^/finance/situations/?$'), permission: 'CREANCE_CONSULTER' },
  { pattern: new RegExp('^/school/time\\-slots/?$'), permission: 'CRENEAU_CONSULTER' },
  { pattern: new RegExp('^/student/guardians/?$'), permission: 'RESPONSABLE_CONSULTER' },
  { pattern: new RegExp('^/access\\-management/?$'), permission: 'ROLE_CONSULTER' },
  { pattern: new RegExp('^/finance/discounts/?$'), permission: 'REDUCTION_CONSULTER' },
  { pattern: new RegExp('^/finance/fee\\-types/?$'), permission: 'TARIF_CONSULTER' },
  { pattern: new RegExp('^/my\\-space/classes/?$'), permission: 'PORTAIL_ENSEIGNANT_CLASSES' },
  { pattern: new RegExp('^/my\\-space/payroll/?$'), permission: 'PORTAIL_ENSEIGNANT_REMUNERATION' },
  { pattern: new RegExp('^/student/students/?$'), permission: 'ELEVE_CONSULTER' },
  { pattern: new RegExp('^/registration/new/?$'), permission: 'INSCRIPTION_CREER' },
  { pattern: new RegExp('^/hr/job\\-positions/?$'), permission: 'POSTE_CONSULTER' },
  { pattern: new RegExp('^/term\\-evaluations/?$'), permission: 'EVALUATION_TRIMESTRIELLE_CAMPAGNE_GERER' },
  { pattern: new RegExp('^/finance/expenses/?$'), permission: 'DEPENSES_CONSULTER' },
  { pattern: new RegExp('^/finance/payments/?$'), permission: 'PAIEMENT_CONSULTER' },
  { pattern: new RegExp('^/payroll/teachers/?$'), permission: 'PAIE_ENSEIGNANT_CONSULTER' },
  { pattern: new RegExp('^/finance/settings/?$'), permission: 'FINANCE_PARAMETRER' },
  { pattern: new RegExp('^/school/campuses/?$'), permission: 'CAMPUS_CONSULTER' },
  { pattern: new RegExp('^/school/calendar/?$'), permission: 'CALENDRIER_SCOLAIRE_CONSULTER' },
  { pattern: new RegExp('^/hr/compensation/?$'), permission: 'REMUNERATION_CONSULTER' },
  { pattern: new RegExp('^/finance/billing/?$'), permission: 'CREANCE_GERER' },
  { pattern: new RegExp('^/finance/charges/?$'), permission: 'CREANCE_CONSULTER' },
  { pattern: new RegExp('^/finance/overdue/?$'), permission: 'CREANCE_CONSULTER' },
  { pattern: new RegExp('^/finance/credits/?$'), permission: 'PAIEMENT_CONSULTER' },
  { pattern: new RegExp('^/finance/tariffs/?$'), permission: 'TARIF_CONSULTER' },
  { pattern: new RegExp('^/school/classes/?$'), permission: 'CLASSE_CONSULTER' },
  { pattern: new RegExp('^/hr/assignments/?$'), permission: 'ENSEIGNANT_AFFECTER' },
  { pattern: new RegExp('^/website\\-admin/?$'), permission: 'SITE_WEB_CONSULTER' },
  { pattern: new RegExp('^/student\\-space/?$'), permission: 'PORTAIL_ELEVE_ACCEDER' },
  { pattern: new RegExp('^/school/cycles/?$'), permission: 'CYCLE_CONSULTER' },
  { pattern: new RegExp('^/school/levels/?$'), permission: 'NIVEAU_CONSULTER' },
  { pattern: new RegExp('^/parent\\-space/?$'), permission: 'PORTAIL_PARENT_ACCEDER' },
  { pattern: new RegExp('^/school/rooms/?$'), permission: 'SALLE_CONSULTER' },
  { pattern: new RegExp('^/registration/?$'), permission: 'INSCRIPTION_CONSULTER' },
  { pattern: new RegExp('^/hr/employees/?$'), permission: 'PERSONNEL_CONSULTER' },
  { pattern: new RegExp('^/finance/cash/?$'), permission: 'CAISSE_CONSULTER' },
  { pattern: new RegExp('^/hr/teachers/?$'), permission: 'ENSEIGNANT_CONSULTER' },
  { pattern: new RegExp('^/hr/subjects/?$'), permission: 'MATIERE_CONSULTER' },
  { pattern: new RegExp('^/timetable/?$'), permission: 'EMPLOI_DU_TEMPS_CONSULTER' },
  { pattern: new RegExp('^/transport/?$'), permission: 'TRANSPORT_CONSULTER' },
  { pattern: new RegExp('^/my\\-space/?$'), permission: 'PORTAIL_ENSEIGNANT_ACCEDER' },
  { pattern: new RegExp('^/finance/?$'), permission: 'PAIEMENT_CONSULTER' },
  { pattern: new RegExp('^/audit/?$'), permission: 'AUDIT_CONSULTER' },
  { pattern: new RegExp('^/hr/?$'), permission: 'PERSONNEL_DASHBOARD' },
  { pattern: new RegExp('^/student/students/[^/]+/?$'), permission: 'ELEVE_CONSULTER' },
  { pattern: new RegExp('^/finance/payments/[^/]+/?$'), permission: 'PAIEMENT_CONSULTER' },
  { pattern: new RegExp('^/registration/[^/]+/?$'), permission: 'INSCRIPTION_CONSULTER' },
  { pattern: new RegExp('^/hr/employees/[^/]+/?$'), permission: 'PERSONNEL_CONSULTER' },
  { pattern: new RegExp('^/hr/teachers/[^/]+/?$'), permission: 'ENSEIGNANT_CONSULTER' },
];

/** Interdit l'accès direct par URL aux pages sans permission, même si le menu est masqué. */
export const privateRoutePermissionGuard: CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const path = state.url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  // Les trois espaces personnels restent isolés, même en présence d'anciennes permissions.
  if (auth.hasRole('PARENT') && path !== '/parent-space') return router.createUrlTree(['/parent-space']);
  if (auth.hasRole('ELEVE') && path !== '/student-space') return router.createUrlTree(['/student-space']);
  if (auth.hasRole('ENSEIGNANT') && !(/^\/my-space(?:\/|$)/).test(path)) return router.createUrlTree(['/my-space']);
  if (path === '/access-denied') return true;
  // L'administrateur global accède aux routes privées administratives.
  if (auth.hasRole('ADMIN')) return true;
  if (path === '/dashboard') {
    // Le dashboard possède son propre dashboardAccessGuard.
    return true;
  }
  const rule = RULES.find(item => item.pattern.test(path));
  if (rule && (auth.hasPermission(rule.permission) ||
      (path === '/access-management' && auth.hasRole('ADMIN')))) return true;
  // Politique de refus par défaut pour les nouvelles routes privées non répertoriées.
  return router.createUrlTree(['/access-denied'], {queryParams: {from: path}});
};
