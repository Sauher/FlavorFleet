import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const FlavorFleetPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#F6F0FC',
      100: '#EFE4FA',
      200: '#DFC9F4',
      300: '#CBAAE9',
      400: '#B28AD6',
      500: '#A681C4', // main brand
      600: '#9B73BB',
      700: '#916FBC',
      800: '#7F5BA9',
      900: '#69448F'
    },

    colorScheme: {
      light: {
        surface: {
          ground: '#FAF5FC',   // page background
          section: '#F9F4FD',
          card: '#FCF7FD',
          overlay: '#FFFFFF',
          border: '#E7E0EF',
          hover: '#F6F2FA'
        },
        text: {
          color: '#373251',
          mutedColor: '#79718C'
        }
      }
    }
  },

  components: {
    button: {
      borderRadius: '14px'
    },
    card: {
      borderRadius: '16px'
    },
    inputtext: {
      borderRadius: '14px'
    }
  }
});