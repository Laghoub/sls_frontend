import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/config/auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: [
      '',
      Validators.required
    ],

    password: [
      '',
      Validators.required
    ]
  });

  togglePassword(): void {
    this.showPassword.update(
      value => !value
    );
  }

  submit(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService
      .login(this.form.getRawValue())
      .subscribe({

        next: response => {

          // La V56 renvoie les droits effectifs via /auth/me.
          // Recharger avant de construire le menu et de naviguer.
          this.authService.loadCurrentUser().subscribe({
            next: user => {
              this.loading.set(false);
              this.router.navigate([user.mustChangePassword ? '/change-password' : this.authService.homeRoute()]);
            },
            error: () => {
              this.loading.set(false);
              this.errorMessage.set('Impossible de récupérer vos droits d’accès. Veuillez réessayer.');
            }
          });
        },

        error: error => {

          this.loading.set(false);

          if (error.status === 401) {

            this.errorMessage.set(
              'Identifiant ou mot de passe incorrect.'
            );

            return;
          }

          if (error.status === 423) {

            this.errorMessage.set(
              'Votre compte est temporairement verrouillé. Veuillez réessayer plus tard.'
            );

            return;
          }

          if (error.status === 403) {

            this.errorMessage.set(
              'Vous n’êtes pas autorisé à accéder à l’application.'
            );

            return;
          }

          this.errorMessage.set(
            'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
          );
        }
      });
  }
}