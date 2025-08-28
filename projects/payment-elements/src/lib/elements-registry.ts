// projects/payment-elements/src/lib/elements-registry.ts
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

import { PaymentFormComponent } from './components';

export async function registerPaymentElements() {
  // Create application instance
  const app = await createApplication({
    providers: [
      // Add any providers your components need
    ],
  });

  // Register custom elements
  if (!customElements.get('payment-form')) {
    const paymentFormElement = createCustomElement(PaymentFormComponent, {
      injector: app.injector,
    });
    customElements.define('payment-form', paymentFormElement);
  }

  return app;
}

// For immediate registration (IIFE style)
export const autoRegisterElements = (async () => {
  if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
    return await registerPaymentElements();
  }

  return undefined;
})();
