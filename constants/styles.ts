import { StyleSheet } from 'react-native'

const shadowStyle = {
  textShadowColor: 'black',
  textShadowRadius: 2
}

export const styles = StyleSheet.create({
  title: {
    ...shadowStyle,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subtitle: {
    ...shadowStyle,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  shadow: shadowStyle,
  xxlarge: {
    fontSize: 32
  },
  xlarge: {
    fontSize: 22
  },
  large: {
    fontSize: 18
  },
  normal: {
    fontSize: 16
  },
  small: {
    fontSize: 12
  },
  xsmall: {
    fontSize: 10
  },
  center: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  centerVertical: {
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  centerContent: {
    justifyContent: 'center'
  },
  centerText: {
    textAlign: 'center'
  },
  lightText: {
    color: 'white'
  },
  darkText: {
    color: 'black'
  }
})
