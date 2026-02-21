import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { FlavorFleetPreset } from '../assets/themes/Flavorfleetpreset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: FlavorFleetPreset,
        options: {
          darkModeSelector: false
        }
      }
    }),
    provideAnimationsAsync()
  ]
};
