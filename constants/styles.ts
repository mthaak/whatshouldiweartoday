import { StyleSheet } from 'react-native';

const shadowStyle = {
  textShadowColor: 'black',
  textShadowRadius: 2
};

export const styles = StyleSheet.create({
  title: {
    ...shadowStyle,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 7,
    zIndex: 1,
  },
  subtitle: {
    ...shadowStyle,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 7,
  },
  shadow: shadowStyle,
  xxlarge: {
    fontSize: 32,
  },
  xlarge: {
    fontSize: 22,
  },
  large: {
    fontSize: 18,
  },
  normal: {
    fontSize: 16,
  },
  small: {
    fontSize: 12,
  },
  xsmall: {
    fontSize: 10,
  },
  badge: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  center: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  centerContent: {
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  }
});
