import { Injectable } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { FlavorFleetPreset, FlavorFleetAdminPreset, FlavorFleetOwnerPreset } from '../../assets/themes/Flavorfleetpreset';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private primeng: PrimeNG) {}

  applyTheme(role: string): void {
    let preset;
    switch (role) {
      case 'admin':
        preset = FlavorFleetAdminPreset;
        break;
      case 'owner':
        preset = FlavorFleetOwnerPreset;
        break;
      default:
        preset = FlavorFleetPreset;
        break;
    }

    this.primeng.theme.set({
      preset,
      options: {
        darkModeSelector: false as any
      }
    });
  }
}
