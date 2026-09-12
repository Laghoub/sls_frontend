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
  openedGroups = new Set<string>(['École']);

  menuItems: SidebarItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'bi bi-grid-1x2-fill',
      route: '/dashboard',
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
          route: '/school/class-groups',
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
          route: '/school/calendar-exceptions',
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
          label: 'Paramètres',
          icon: 'bi bi-gear',
          route: '/finance/settings',
          permission: 'FINANCE_PARAMETRER',
        },
      ],
    },
  ];

  hasAccess(item: SidebarItem): boolean {
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
