import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { createCustomElement } from '@angular/elements';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

// bootstrapApplication(App, appConfig)
//   .then((appRef) => {
//     // Get the injector from the application reference
//     const injector = appRef.injector;

//     // Create the custom element
//     const paymentFormElement = createCustomElement(PaymentFormComponent, { injector });

//     // Register the custom element with the browser
//     if (!customElements.get('payment-form')) {
//       customElements.define('payment-form', paymentFormElement);
//       console.log('Payment form custom element registered successfully!');
//     }
//   })
//   .catch((err) => console.error('Error starting app:', err));
