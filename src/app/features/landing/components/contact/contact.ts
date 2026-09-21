import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { buildWhatsAppLink } from '../../../../core/constants/whatsapp';
import { ContactService } from '../../../../core/services/contact.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './contact.html'
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  protected readonly whatsappLink = buildWhatsAppLink();

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    this.contactService.submit(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.sent.set(true);
        this.form.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(extractErrorMessage(error, 'تعذر إرسال رسالتك، من فضلك حاولي مرة أخرى'));
      }
    });
  }

  sendAnother(): void {
    this.sent.set(false);
  }
}
