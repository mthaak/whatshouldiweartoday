import * as colors from './colors'

const FONT_FAMILY = 'Lato_400Regular'

export const theme = {
  colors: {
    primary: colors.background,
    secondary: colors.lightAccent
    // white;
    // black;
    // grey0;
    // grey1;
    // grey2;
    // grey3;
    // grey4;
    // grey5;
    // greyOutline;
    // searchBg;
    // success;
    // error;
    // warning;
    // divider;
    // platform: {
    //   ios: {
    //     primary;
    //     secondary;
    //     grey;
    //     searchBg;
    //     success;
    //     error;
    //     warning;
    //   };
    //   android: {
    //     // Same as ios
    //   }
    // }
  },
  Text: {
    style: {
      fontFamily: FONT_FAMILY
    }
  },
  Button: {
    titleStyle: {
      fontFamily: FONT_FAMILY
    }
  }
}
