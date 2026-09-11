import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { FeeType, FeeTypeRequest } from '../../models/finance.model';
import { FeeTypeService } from '../../services/fee-type.service';
@Component({
  selector: 'app-fee-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fee-types.component.html',
  styleUrl: './fee-types.component.scss',
})
export class FeeTypesComponent {
  private s = inject(FeeTypeService);
  auth = inject(AuthService);
  items = signal<FeeType[]>([]);
  page = signal(0);
  size = signal(20);
  total = signal(0);
  pages = signal(0);
  loading = signal(false);
  error = signal('');
  success = signal('');
  modal = signal(false);
  editing = signal<FeeType | null>(null);
  search = '';
  form: FeeTypeRequest = {
    code: '',
    name: '',
    category: 'INSCRIPTION',
    active: true,
    displayOrder: null,
  };
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.s.search(this.search, this.page(), this.size()).subscribe({
      next: (r) => {
        this.items.set(r.content);
        this.total.set(r.totalElements);
        this.pages.set(r.totalPages);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(this.msg(e));
        this.loading.set(false);
      },
    });
  }
  filter() {
    this.page.set(0);
    this.load();
  }
  openCreate() {
    this.editing.set(null);
    this.form = {
      code: '',
      name: '',
      category: 'INSCRIPTION',
      active: true,
      displayOrder: null,
    };
    this.modal.set(true);
  }
  openEdit(x: FeeType) {
    this.editing.set(x);
    this.form = {
      code: x.code,
      name: x.name,
      category: x.category,
      active: x.active,
      displayOrder: x.displayOrder,
    };
    this.modal.set(true);
  }
  save() {
    const op = this.editing()
      ? this.s.update(this.editing()!.id, this.form)
      : this.s.create(this.form);
    op.subscribe({
      next: () => {
        this.modal.set(false);
        this.success.set('Type de frais enregistré.');
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  prev() {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.load();
    }
  }
  next() {
    if (this.page() + 1 < this.pages()) {
      this.page.update((v) => v + 1);
      this.load();
    }
  }
  go(i: number) {
    this.page.set(i);
    this.load();
  }
  range() {
    const n = this.pages(),
      p = this.page(),
      a = Math.max(0, p - 2),
      b = Math.min(n - 1, p + 2);
    return n ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [];
  }
  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
