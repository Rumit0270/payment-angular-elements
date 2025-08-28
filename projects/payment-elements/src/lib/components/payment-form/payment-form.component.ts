import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Currency,
  PaymentData,
  PaymentGateway,
  PaymentSuccessEvent,
  PaymentErrorEvent,
} from '../../types/payment-form';

@Component({
  selector: 'payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.less'],
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() amount: string = '';
  @Input() currency: Currency = 'USD';
  @Input() gateway: PaymentGateway = 'stripe';

  @Output() paymentSuccess = new EventEmitter<PaymentSuccessEvent>();
  @Output() paymentError = new EventEmitter<PaymentErrorEvent>();
  @Output() gatewayChange = new EventEmitter<{ gateway: PaymentGateway }>();

  // Using Angular 20 signals for reactive state
  selectedGateway = signal<PaymentGateway>(this.gateway);
  isProcessing = signal(false);
  statusMessage = signal('');
  messageType = signal<'success' | 'error' | ''>('');

  paymentForm: FormGroup;

  readonly gateways = [
    { id: 'stripe' as PaymentGateway, name: 'Stripe' },
    { id: 'paypal' as PaymentGateway, name: 'PayPal' },
  ] as const;

  // Computed values using signals
  isFormValid = computed(() => this.paymentForm?.valid ?? false);

  constructor() {
    this.paymentForm = this.fb.group({
      cardHolder: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, this.cardNumberValidator.bind(this)]],
      expiryDate: ['', [Validators.required, this.expiryDateValidator.bind(this)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  ngOnInit(): void {
    this.selectedGateway.set(this.gateway);
  }

  // Custom validators using Angular 20 patterns
  private cardNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.replace(/\s/g, '') || '';
    const isValid = /^\d{13,19}$/.test(value);
    return isValid ? null : { invalidCardNumber: true };
  }

  private expiryDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (!/^\d{2}\/\d{2}$/.test(value)) {
      return { invalidExpiry: true };
    }

    const [month, year] = value.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) {
      return { invalidExpiry: true };
    }

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return { expiredCard: true };
    }

    return null;
  }

  selectGateway(gateway: PaymentGateway): void {
    this.selectedGateway.set(gateway);
    this.gatewayChange.emit({ gateway });
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    // Limit to 19 digits (longest card number)
    value = value.substring(0, 19);

    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;

    // Update input value
    input.value = formattedValue;

    // Update form control
    this.paymentForm.patchValue({ cardNumber: formattedValue });
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    input.value = value;
    this.paymentForm.patchValue({ expiryDate: value });
  }

  formatCVV(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Only allow digits
    input.value = input.value.replace(/\D/g, '');
  }

  async handleSubmit(): Promise<void> {
    if (this.paymentForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.paymentForm.controls).forEach((key) => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.paymentForm.value;

    const paymentData: PaymentData = {
      cardHolder: formValue.cardHolder,
      cardNumber: formValue.cardNumber.replace(/\s/g, ''),
      expiryDate: formValue.expiryDate,
      cvv: formValue.cvv,
      amount: this.amount || '0',
      currency: this.currency,
      gateway: this.selectedGateway(),
    };

    await this.processPayment(paymentData);
  }

  private async processPayment(data: PaymentData): Promise<void> {
    this.isProcessing.set(true);
    this.statusMessage.set('');
    this.messageType.set('');

    console.log('Processing payment for: ', data);

    try {
      // Simulate payment processing with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success/failure (70% success rate for demo)
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        const transactionId = 'txn_' + Math.random().toString(36).substring(2, 11);

        this.statusMessage.set(`Payment successful! Transaction ID: ${transactionId}`);
        this.messageType.set('success');

        // Reset form on success
        this.paymentForm.reset();

        const successEvent: PaymentSuccessEvent = {
          transactionId,
          gateway: data.gateway,
          amount: data.amount,
          currency: data.currency,
          cardHolder: data.cardHolder,
        };

        this.paymentSuccess.emit(successEvent);
      } else {
        this.statusMessage.set('Payment failed. Please check your card details and try again.');
        this.messageType.set('error');

        const errorEvent: PaymentErrorEvent = {
          error: 'Payment declined',
          code: 'PAYMENT_DECLINED',
        };

        this.paymentError.emit(errorEvent);
      }
    } catch (error) {
      this.statusMessage.set('An error occurred while processing your payment. Please try again.');
      this.messageType.set('error');

      const errorEvent: PaymentErrorEvent = {
        error: 'Processing error',
        code: 'PROCESSING_ERROR',
      };

      this.paymentError.emit(errorEvent);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
