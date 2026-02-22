import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const sharedComponents = {
  button: {
    borderRadius: '14px'
  },
  card: {
    borderRadius: '16px'
  },
  inputtext: {
    borderRadius: '14px'
  }
};

// User preset – purple (default)
export const FlavorFleetPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#F6F0FC',
      100: '#EFE4FA',
      200: '#DFC9F4',
      300: '#CBAAE9',
      400: '#B28AD6',
      500: '#A681C4',
      600: '#9B73BB',
      700: '#916FBC',
      800: '#7F5BA9',
      900: '#69448F'
    },
    colorScheme: {
      light: {
        surface: {
          ground: '#FAF5FC',
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
  components: sharedComponents
});

// Admin preset – reddish orange
export const FlavorFleetAdminPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#FFF4F0',
      100: '#FFE4D9',
      200: '#FFC9B3',
      300: '#FFA880',
      400: '#FF8A52',
      500: '#E8642D',
      600: '#D45825',
      700: '#B8491E',
      800: '#9C3D19',
      900: '#7A2F13'
    },
    colorScheme: {
      light: {
        surface: {
          ground: '#FFFAF7',
          section: '#FFF8F4',
          card: '#FFFBF8',
          overlay: '#FFFFFF',
          border: '#F0E4DD',
          hover: '#FFF5EF'
        },
        text: {
          color: '#3D2E28',
          mutedColor: '#8C7168'
        }
      }
    }
  },
  components: sharedComponents
});

// Owner preset – green
export const FlavorFleetOwnerPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#F0FBF4',
      100: '#D9F5E3',
      200: '#B3EBC7',
      300: '#80DCA5',
      400: '#4FC882',
      500: '#2EAD64',
      600: '#259A56',
      700: '#1E8248',
      800: '#1A6B3C',
      900: '#145530'
    },
    colorScheme: {
      light: {
        surface: {
          ground: '#F5FCF7',
          section: '#F4FDF6',
          card: '#F7FDF9',
          overlay: '#FFFFFF',
          border: '#E0EFE5',
          hover: '#F2FAF5'
        },
        text: {
          color: '#2B3732',
          mutedColor: '#71897A'
        }
      }
    }
  },
  components: sharedComponents
});