import * as React from 'react'
import {
  Text as DefaultText,
  View as DefaultView,
  Button as DefaultButton,
  TextInput as DefaultTextInput
} from 'react-native'

import colors from '../constants/colors'
import useColorScheme from '../hooks/useColorScheme'

export function useThemeColor(
  props: { light?: string, dark?: string },
  colorName: keyof typeof colors.light & keyof typeof colors.dark
): string {
  const theme = useColorScheme()
  const colorFromProps = props[theme]

  if (colorFromProps) {
    return colorFromProps
  } else {
    return colors[theme][colorName]
  }
}

interface ThemeProps {
  lightColor?: string
  darkColor?: string
}

export type TextProps = ThemeProps & DefaultText['props']
export type ViewProps = ThemeProps & DefaultView['props']

export function Text(props: TextProps): JSX.Element {
  const { style, lightColor, darkColor, bold, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  return <DefaultText style={[{ color }, bold && { fontWeight: 'bold' }, style]} {...otherProps} />
}

export function TextInput(props: TextInputProps): JSX.Element {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  return <DefaultTextInput style={[{ color }, style]} {...otherProps} />
}

export function View(props: ViewProps): JSX.Element {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />
}

export function Button(props: ViewProps): JSX.Element {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')

  return <DefaultButton style={[{ backgroundColor }, style]} {...otherProps}>hai</DefaultButton>
}
