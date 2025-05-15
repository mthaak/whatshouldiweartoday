import { createTheme } from "@rneui/themed";

import * as colors from "./colors";

const FONT_FAMILY = "Lato_400Regular";

export const theme = createTheme({
  darkColors: {
    primary: colors.background,
    secondary: colors.lightAccent,
    background: colors.darkBackground,
  },
  mode: "dark",
  components: {
    Text: {
      style: {
        fontFamily: FONT_FAMILY,
      },
    },
    Button: {
      titleStyle: {
        fontFamily: FONT_FAMILY,
      },
    },
  },
});
