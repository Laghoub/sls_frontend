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

          this.loading.set(false);

          // Changement de mot de passe obligatoire
          if (response.user.mustChangePassword) {

            this.router.navigate([
              '/change-password'
            ]);

            return;
          }

          // Mot de passe déjà modifié :
          // accès normal à l'application
          this.router.navigate([
            '/dashboard'
          ]);
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