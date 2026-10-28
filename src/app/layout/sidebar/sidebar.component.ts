import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/config/auth/services/auth.service';

interface SidebarItem {
  label: string;
  icon: string;
  route?: string;
  permission?: string;
  children?: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  pinned = false;
  openedGroups = new Set<string>(['École', 'Administration']);

  menuItems: SidebarItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'bi bi-grid-1x2-fill',
      route: '/dashboard',
    },
    { label: 'Espace parent', icon: 'bi bi-house-heart', route: '/parent-space', permission: 'PORTAIL_PARENT_ACCEDER' },
    { label: 'Espace élève', icon: 'bi bi-mortarboard', route: '/student-space', permission: 'PORTAIL_ELEVE_ACCEDER' },
    {
      label: 'Espace enseignant',
      icon: 'bi bi-person-circle',
      permission: 'PORTAIL_ENSEIGNANT_ACCEDER',
      children: [
        { label: 'Tableau de bord', icon: 'bi bi-speedometer2', route: '/my-space', permission: 'PORTAIL_ENSEIGNANT_ACCEDER' },
        { label: 'Mes classes & élèves', icon: 'bi bi-people', route: '/my-space/classes', permission: 'PORTAIL_ENSEIGNANT_CLASSES' },
        { label: 'Mon emploi du temps', icon: 'bi bi-calendar-week', route: '/my-space/timetable', permission: 'PORTAIL_ENSEIGNANT_EMPLOI_DU_TEMPS' },
        { label: 'Mon assiduité', icon: 'bi bi-clipboard-check', route: '/my-space/attendance', permission: 'PORTAIL_ENSEIGNANT_ASSIDUITE' },
        { label: 'Mes rémunérations', icon: 'bi bi-cash-coin', route: '/my-space/payroll', permission: 'PORTAIL_ENSEIGNANT_REMUNERATION' },
        { label: 'Mes exercices', icon: 'bi bi-journal-text', route: '/my-space/exercises', permission: 'PORTAIL_ENSEIGNANT_EXERCICES' },
        { label: 'Mes évaluations', icon: 'bi bi-ui-checks-grid', route: '/my-space/evaluations', permission: 'PORTAIL_ENSEIGNANT_EVALUATIONS' },
      ],
    },
    {
      label: 'École',
      icon: 'bi bi-building',
      children: [
        {
          label: 'Années scolaires',
          icon: 'bi bi-calendar3',
          route: '/school/school-years',
          permission: 'ANNEE_SCOLAIRE_CONSULTER',
        },
        {
          label: 'Cycles',
          icon: 'bi bi-diagram-3',
          route: '/school/cycles',
          permission: 'CYCLE_CONSULTER',
        },
        {
          label: 'Niveaux',
          icon: 'bi bi-layers',
          route: '/school/levels',
          permission: 'NIVEAU_CONSULTER',
        },
        {
          label: 'Campus',
          icon: 'bi bi-geo-alt',
          route: '/school/campuses',
          permission: 'CAMPUS_CONSULTER',
        },
        {
          label: 'Salles',
          icon: 'bi bi-door-open',
          route: '/school/rooms',
          permission: 'SALLE_CONSULTER',
        },
        {
          label: 'Classes',
          icon: 'bi bi-people',
          route: '/school/classes',
          permission: 'CLASSE_CONSULTER',
        },
        {
          label: 'Créneaux',
          icon: 'bi bi-clock',
          route: '/school/time-slots',
          permission: 'CRENEAU_CONSULTER',
        },
        {
          label: 'Calendrier scolaire',
          icon: 'bi bi-calendar-event',
          route: '/school/calendar',
          permission: 'CALENDRIER_SCOLAIRE_CONSULTER',
        },
      ],
    },
    {
      label: 'Élèves',
      icon: 'bi bi-mortarboard-fill',
      children: [
        {
          label: 'Liste des élèves',
          icon: 'bi bi-person-badge',
          route: '/student/students',
          permission: 'ELEVE_CONSULTER',
        },
        {
          label: 'Responsables',
          icon: 'bi bi-people-fill',
          route: '/student/guardians',
          permission: 'RESPONSABLE_CONSULTER',
        },
      ],
    },

    {
      label: 'Inscriptions',
      icon: 'bi bi-journal-check',
      children: [
        {
          label: "Dossiers d'inscription",
          icon: 'bi bi-folder2-open',
          route: '/registration',
          permission: 'INSCRIPTION_CONSULTER',
        },
        {
          label: 'Nouvelle inscription',
          icon: 'bi bi-person-plus',
          route: '/registration/new',
          permission: 'INSCRIPTION_CREER',
        },
      ],
    },

    {
      label: 'Personnel & Enseignants',
      icon: 'bi bi-person-workspace',
      children: [
        { label: 'Tableau de bord RH', icon: 'bi bi-speedometer2', route: '/hr', permission: 'PERSONNEL_DASHBOARD' },
        { label: 'Personnel', icon: 'bi bi-people', route: '/hr/employees', permission: 'PERSONNEL_CONSULTER' },
        { label: 'Enseignants', icon: 'bi bi-person-video3', route: '/hr/teachers', permission: 'ENSEIGNANT_CONSULTER' },
        { label: 'Affectations', icon: 'bi bi-diagram-3', route: '/hr/assignments', permission: 'ENSEIGNANT_AFFECTER' },
        { label: 'Rémunération', icon: 'bi bi-cash-coin', route: '/hr/compensation', permission: 'REMUNERATION_CONSULTER' },
        { label: 'Matières', icon: 'bi bi-journal-text', route: '/hr/subjects', permission: 'MATIERE_CONSULTER' },
        { label: 'Postes & fonctions', icon: 'bi bi-briefcase', route: '/hr/job-positions', permission: 'POSTE_CONSULTER' },
      ],
    },
    {
      label: 'Emploi du temps',
      icon: 'bi bi-calendar-week',
      route: '/timetable',
      permission: 'EMPLOI_DU_TEMPS_CONSULTER',
    },
    {
      label: 'Assiduité',
      icon: 'bi bi-clipboard2-check',
      children: [
        { label: 'Enseignants', icon: 'bi bi-person-check', route: '/attendance/teachers', permission: 'ASSIDUITE_ENSEIGNANT_CONSULTER' },
        { label: 'Historique enseignants', icon: 'bi bi-clock-history', route: '/attendance/teachers/history', permission: 'ASSIDUITE_ENSEIGNANT_CONSULTER' },
        { label: 'Pointage mensuel', icon: 'bi bi-calendar3', route: '/attendance/teachers/monthly', permission: 'POINTAGE_MENSUEL_CONSULTER' },
        { label: 'Élèves', icon: 'bi bi-mortarboard', route: '/attendance/students', permission: 'ASSIDUITE_ELEVE_CONSULTER' },
        { label: 'Historique élèves', icon: 'bi bi-clock-history', route: '/attendance/students/history', permission: 'ASSIDUITE_ELEVE_CONSULTER' },
      ],
    },
    {
      label: 'Transport',
      icon: 'bi bi-bus-front-fill',
      children: [
        { label: 'Gestion transport', icon: 'bi bi-signpost-split', route: '/transport', permission: 'TRANSPORT_CONSULTER' },
      ],
    },
    {
      label: 'Administration',
      icon: 'bi bi-shield-lock',
      children: [
        { label: "Profils & droits d'accès", icon: 'bi bi-person-lock', route: '/access-management', permission: 'ROLE_CONSULTER' },
        { label: 'Traçabilité', icon: 'bi bi-clock-history', route: '/audit', permission: 'AUDIT_CONSULTER' },
      ],
    },
    {
      label: 'Finance & Caisse',
      icon: 'bi bi-cash-stack',
      children: [
        {
          label: 'Tableau de bord',
          icon: 'bi bi-speedometer2',
          route: '/finance',
          permission: 'PAIEMENT_CONSULTER',
        },
        {
          label: 'Encaissements',
          icon: 'bi bi-credit-card',
          route: '/finance/payments',
          permission: 'PAIEMENT_CONSULTER',
        },
        {
          label: 'Nouvel encaissement',
          icon: 'bi bi-plus-circle',
          route: '/finance/payments/new',
          permission: 'PAIEMENT_CREER',
        },
        {
          label: 'Facturation',
          icon: 'bi bi-receipt-cutoff',
          route: '/finance/billing',
          permission: 'CREANCE_GERER',
        },
        {
          label: 'Créances élèves',
          icon: 'bi bi-receipt',
          route: '/finance/charges',
          permission: 'CREANCE_CONSULTER',
        },
        {
          label: 'Réductions',
          icon: 'bi bi-percent',
          route: '/finance/discounts',
          permission: 'REDUCTION_CONSULTER',
        },
        {
          label: 'Situation familles',
          icon: 'bi bi-people',
          route: '/finance/situations',
          permission: 'CREANCE_CONSULTER',
        },
        {
          label: 'Situation globale',
          icon: 'bi bi-table',
          route: '/finance/global-situation',
          permission: 'CREANCE_CONSULTER',
        },
        {
          label: 'Impayés & retards',
          icon: 'bi bi-exclamation-triangle',
          route: '/finance/overdue',
          permission: 'CREANCE_CONSULTER',
        },
        {
          label: 'Mensualités / rattrapage',
          icon: 'bi bi-calendar2-check',
          route: '/finance/installments',
          permission: 'CREANCE_GERER',
        },
        {
          label: 'Caisse',
          icon: 'bi bi-safe2',
          route: '/finance/cash',
          permission: 'CAISSE_CONSULTER',
        },
        {
          label: 'Avoirs familles',
          icon: 'bi bi-wallet2',
          route: '/finance/credits',
          permission: 'PAIEMENT_CONSULTER',
        },
        {
          label: 'Tarification',
          icon: 'bi bi-tags',
          route: '/finance/tariffs',
          permission: 'TARIF_CONSULTER',
        },
        {
          label: 'Types de frais',
          icon: 'bi bi-list-check',
          route: '/finance/fee-types',
          permission: 'TARIF_CONSULTER',
        },
        {
          label: 'Paie enseignants',
          icon: 'bi bi-person-vcard',
          route: '/payroll/teachers',
          permission: 'PAIE_ENSEIGNANT_CONSULTER',
        },
        {
          label: 'Paramètres',
          icon: 'bi bi-gear',
          route: '/finance/settings',
          permission: 'FINANCE_PARAMETRER',
        },
      ],
    },
  ];

  /**
   * Un enseignant utilise uniquement son espace personnel.
   * Les menus administratifs (tableau de bord global, emploi du temps global,
   * assiduité administrative, etc.) ne doivent pas apparaître même si une
   * ancienne permission est encore présente sur son compte.
   */
  get visibleMenuItems(): SidebarItem[] {
    if (this.auth.hasRole('PARENT')) return this.menuItems.filter(item => item.label === 'Espace parent');
    if (this.auth.hasRole('ELEVE')) return this.menuItems.filter(item => item.label === 'Espace élève');
    if (this.auth.hasRole('ENSEIGNANT')) return this.menuItems.filter(item => item.label === 'Espace enseignant');
    return this.menuItems;
  }

  hasAccess(item: SidebarItem): boolean {
    // Garde-fou : l'administrateur global doit toujours pouvoir revenir
    // à la gestion des profils et droits afin d'éviter un verrouillage
    // accidentel de l'administration. Tous les autres menus restent
    // pilotés par les permissions effectives.
    if (item.route === '/access-management' && this.auth.hasRole('ADMIN')) {
      return true;
    }

    if (item.children?.length) {
      return item.children.some((child) => this.hasAccess(child));
    }

    return !item.permission || this.auth.hasPermission(item.permission);
  }

  toggleGroup(groupName: string): void {
    if (this.openedGroups.has(groupName)) {
      this.openedGroups.delete(groupName);
    } else {
      this.openedGroups.add(groupName);
    }
  }

  isGroupOpen(groupName: string): boolean {
    return this.openedGroups.has(groupName);
  }

  togglePinned(): void {
    this.pinned = !this.pinned;
  }

  navigationClicked(): void {
    if (window.innerWidth <= 991) {
      this.closeMobile.emit();
    }
  }

  close(): void {
    this.closeMobile.emit();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.close();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.close();
        this.router.navigate(['/login']);
      },
    });
  }
}
