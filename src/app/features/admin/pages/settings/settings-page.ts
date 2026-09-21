import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Spinner } from '../../../../shared/spinner/spinner';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './settings-page.html'
})
export class SettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly username = this.authService.username;
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { currentPassword, newPassword } = this.form.getRawValue();

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.success('تم تغيير كلمة المرور بنجاح');
        this.form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.toastService.error(extractErrorMessage(error, 'تعذر تغيير كلمة المرور، حاولي مرة أخرى'));
      }
    });
  }
}
