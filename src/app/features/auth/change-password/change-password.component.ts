import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/config/auth/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmation = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: [
        '',
        Validators.required
      ],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ]
    },
    {
      validators: [
        ChangePasswordComponent.passwordsMatchValidator
      ]
    }
  );

  static passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const newPassword =
      control.get('newPassword')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword
      ? null
      : { passwordsMismatch: true };
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update(value => !value);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update(value => !value);
  }

  toggleConfirmation(): void {
    this.showConfirmation.update(value => !value);
  }

  submit(): void {

    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.loading.set(true);

    this.authService
  .changePassword(
    value.currentPassword,
    value.newPassword,
    value.confirmPassword
  )
      .subscribe({

        next: () => {

  this.authService
    .loadCurrentUser()
    .subscribe({

      next: () => {

        this.loading.set(false);

        this.router.navigate([
          '/dashboard'
        ]);
      },

      error: () => {

        this.loading.set(false);

        this.authService.clearUser();

        this.router.navigate([
          '/login'
        ]);
      }

    });
},

        error: error => {

          this.loading.set(false);

          if (error.status === 400) {
            this.errorMessage.set(
              'Le mot de passe actuel est incorrect ou le nouveau mot de passe ne respecte pas les règles de sécurité.'
            );
            return;
          }

          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage.set(
            'Impossible de modifier le mot de passe. Veuillez réessayer.'
          );
        }
      });
  }
}