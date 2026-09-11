import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/finance-home/finance-home.component').then(m => m.FinanceHomeComponent) },
  { path: 'situations', loadComponent: () => import('./pages/situations/financial-situations.component').then(m => m.FinancialSituationsComponent) },
  { path: 'overdue', loadComponent: () => import('./pages/overdue/overdue.component').then(m => m.OverdueComponent) },
  { path: 'installments', loadComponent: () => import('./pages/installments/installments.component').then(m => m.InstallmentsComponent) },
  { path: 'fee-types', loadComponent: () => import('./pages/fee-types/fee-types.component').then(m => m.FeeTypesComponent) },
  { path: 'tariffs', loadComponent: () => import('./pages/tariffs/tariffs.component').then(m => m.TariffsComponent) },
  { path: 'charges', loadComponent: () => import('./pages/charges/charges.component').then(m => m.ChargesComponent) },
  { path: 'payments', loadComponent: () => import('./pages/payments/payment-list.component').then(m => m.PaymentListComponent) },
  { path: 'payments/new', loadComponent: () => import('./pages/payments/payment-create.component').then(m => m.PaymentCreateComponent) },
  { path: 'payments/:id', loadComponent: () => import('./pages/payments/payment-detail.component').then(m => m.PaymentDetailComponent) },
  { path: 'credits', loadComponent: () => import('./pages/credits/family-credits.component').then(m => m.FamilyCreditsComponent) },
  { path: 'cash', loadComponent: () => import('./pages/cash/cash.component').then(m => m.CashComponent) },
  { path: 'settings', loadComponent: () => import('./pages/settings/finance-settings.component').then(m => m.FinanceSettingsComponent) },
];
