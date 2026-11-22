import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, expand, reduce, EMPTY, map, forkJoin } from 'rxjs';
import { API_CONFIG } from '../../../../core/api.config';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/person.model';
import { GuardianService } from '../../services/guardian.service';
import { Guardian } from '../../models/guardian.model';

interface MergePreview {
  primaryId: number;
  duplicateId: number;
  primaryName: string;
  duplicateName: string;
  references: Record<string, number>;
  duplicateAccountsToDisable: number;
  blockers: string[];
  canMerge: boolean;
}

@Component({
  selector: 'app-guardian-merge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guardian-merge.component.html',
  styleUrl: './guardian-merge.component.scss',
})
export class GuardianMergeComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly guardiansApi = inject(GuardianService);
  private readonly personsApi = inject(PersonService);
  private readonly endpoint = `${API_CONFIG.baseUrl}/guardians/merge`;
  guardians: Guardian[] = [];
  primarySearch = "";
  duplicateSearch = "";
  private personById = new Map<number, Person>();

  get primaryOptions(): Guardian[] { return this.filterGuardians(this.primarySearch, this.duplicateId); }
  get duplicateOptions(): Guardian[] { return this.filterGuardians(this.duplicateSearch, this.primaryId); }

  private filterGuardians(search: string, exclude: number | null): Guardian[] {
    const term = search.trim().toLocaleLowerCase();
    return this.guardians.filter(g => g.id !== exclude && (!term || this.label(g).toLocaleLowerCase().includes(term)));
  }
  primaryId: number | null = null;
  duplicateId: number | null = null;
  preview: MergePreview | null = null;
  confirmed = false;
  loading = false;
  saving = false;
  error = '';
  success = '';

  ngOnInit(): void { this.loadGuardians(); }

  loadGuardians(): void {
    this.loading = true;
    this.error = '';
    const pageSize = 100;
    const guardians$ = this.guardiansApi.getPage(0, pageSize).pipe(
      expand(response => response.last ? EMPTY : this.guardiansApi.getPage(response.page + 1, pageSize)),
      map(response => response.content ?? []),
      reduce((all, page) => [...all, ...page], [] as Guardian[]),
    );
    forkJoin({ guardians: guardians$, persons: this.personsApi.getAll() })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ({ guardians, persons }) => {
          this.personById = new Map(persons.map(p => [p.id, p]));
          this.guardians = guardians.filter(g => g.status?.toUpperCase() !== 'MERGED')
            .sort((a, b) => this.label(a).localeCompare(this.label(b), 'fr'));
        },
        error: err => {
          this.guardians = [];
          this.error = this.message(err, 'Impossible de charger les responsables ou leurs identités.');
        },
      });
  }

  label(g: Guardian): string {
    const person = g.person ?? this.personById.get(g.personId);
    const name = person ? `${person.lastName || ''} ${person.firstName || ''}`.trim() : '';
    const phone = person?.phone ? ` — ${person.phone}` : '';
    return `${name || 'Nom indisponible'} — dossier #${g.id}${phone}`;
  }

  resetPreview(): void { this.preview = null; this.confirmed = false; this.error = ''; this.success = ''; }

  check(): void {
    this.resetPreview();
    if (!this.primaryId || !this.duplicateId || this.primaryId === this.duplicateId) {
      this.error = 'Sélectionnez deux dossiers différents.';
      return;
    }
    this.loading = true;
    const params = new HttpParams().set('primaryId', this.primaryId).set('duplicateId', this.duplicateId);
    this.http.get<MergePreview>(`${this.endpoint}/preview`, { params })
      .pipe(finalize(() => this.loading = false)).subscribe({
        next: data => { this.preview = data; },
        error: err => { this.error = this.message(err, 'Impossible de prévisualiser la fusion.'); },
      });
  }

  merge(): void {
    if (!this.preview?.canMerge || !this.confirmed || this.saving ||
        this.preview.primaryId !== this.primaryId || this.preview.duplicateId !== this.duplicateId) return;
    this.saving = true;
    this.error = '';
    this.http.post<{status: string}>(this.endpoint, {
      primaryId: this.primaryId, duplicateId: this.duplicateId, confirmed: true,
    }).pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.success = 'Fusion effectuée. Le dossier doublon est archivé.';
        this.preview = null;
        this.confirmed = false;
        this.primaryId = null;
        this.duplicateId = null;
        this.loadGuardians();
      },
      error: err => { this.error = this.message(err, 'La fusion a été refusée. Aucune fusion confirmée.'); this.confirmed = false; },
    });
  }

  private message(err: any, fallback: string): string {
    const detail = err?.error?.detail || err?.error?.message;
    return typeof detail === 'string' && detail.trim() ? detail : fallback;
  }
}
