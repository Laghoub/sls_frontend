import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { API_CONFIG } from '../../../core/api.config';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  readonly token = this.route.snapshot.queryParamMap.get('token') || '';
  readonly loading = signal(false);
  readonly success = signal('');
  readonly error = signal('');
  readonly requestForm = this.fb.nonNullable.group({ username: ['', [Validators.required, Validators.maxLength(100)]] });
  readonly resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(128)]],
    confirmPassword: ['', Validators.required]
  });
  readonly api = `${API_CONFIG.baseUrl}/auth/password-reset`;

  submitRequest() {
    this.error.set(''); this.success.set('');
    if (this.requestForm.invalid) { this.requestForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.http.post<{message:string}>(`${this.api}/request`, this.requestForm.getRawValue()).subscribe({
      next: r => { this.loading.set(false); this.success.set(r.message); },
      error: () => { this.loading.set(false); this.error.set('Le service est momentanément indisponible. Réessayez plus tard.'); }
    });
  }

  submitReset() {
    this.error.set(''); this.success.set('');
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    const values = this.resetForm.getRawValue();
    if (values.password !== values.confirmPassword) { this.error.set('Les mots de passe ne correspondent pas.'); return; }
    this.loading.set(true);
    this.http.post<{message:string}>(`${this.api}/confirm`, {token: this.token, ...values}).subscribe({
      next: r => { this.loading.set(false); this.success.set(r.message); this.resetForm.reset(); },
      error: () => { this.loading.set(false); this.error.set('Lien invalide, expiré ou déjà utilisé. Demandez un nouveau lien.'); }
    });
  }
}
