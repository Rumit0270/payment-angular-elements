export type PaymentGateway = 'stripe' | 'paypal';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PaymentData {
  amount: string;
  currency: Currency;
  gateway: PaymentGateway;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
}

export interface PaymentSuccessEvent {
  transactionId: string;
  gateway: PaymentGateway;
  amount: string;
  currency: Currency;
  cardHolder: string;
}

export interface PaymentErrorEvent {
  error: string;
  code: string;
}
