import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessage } from '../../../core/utils/api-error.util';
import { Spinner } from '../../../shared/spinner/spinner';
import { ThemeToggle } from '../../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Spinner, ThemeToggle],
  templateUrl: './login.html'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(error, 'تعذر تسجيل الدخول، تأكدي من البيانات وحاولي مرة أخرى'));
      }
    });
  }
}
