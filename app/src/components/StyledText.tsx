import * as React from "react";

import { TextProps, Text as ThemedText } from "./Themed";

export function MonoText(props: TextProps): React.JSX.Element {
  return (
    <Text {...props} style={[props.style, { fontFamily: "space-mono" }]} />
  );
}

export function Text(props: TextProps): React.JSX.Element {
  return (
    <ThemedText
      {...props}
      style={[props.style, { fontFamily: "Lato_400Regular" }]}
    />
  );
}
