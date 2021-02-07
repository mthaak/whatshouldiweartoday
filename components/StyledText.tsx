import * as React from 'react'

import { Text as ThemedText, TextProps } from './Themed'

export function MonoText(props: TextProps): JSX.Element {
  return <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />
}

export function Text(props: TextProps): JSX.Element {
  return <ThemedText {...props} style={[props.style, { fontFamily: 'Lato_400Regular' }]} />
}
