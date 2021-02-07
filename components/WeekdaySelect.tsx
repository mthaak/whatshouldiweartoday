import * as React from 'react'
import { View } from 'react-native'
import { CheckBox } from 'react-native-elements'

interface WeekdaySelectProps {
  values: Array[number];
  onToggle: () => void;
  disabled: bool;
  containerStyleDisabled: ViewStyle;
  textStyleDisabled: TextStyle;
  checkedColorDisabled: string;
}

export default function WeekdaySelect(props: WeekdaySelectProps): JSX.Element {

  const defaultContainerStyle = {
    marginLeft: 0,
    marginRight: 0,
    padding: 5
  }

  const defaultContainerStyleDisabled = {
    borderColor: 'rgba(0,0,0,0)'
  }

  const containerStyleDisabled = {
    ...defaultContainerStyleDisabled,
    ...props.containerStyleDisabled
  }

  const checkboxes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) =>
    <CheckBox
      key={i}
      title={name}
      checked={props.values[i]}
      onPress={() => props.onToggle(i)}
      size={16}
      containerStyle={[defaultContainerStyle, props.disabled ? containerStyleDisabled : {}]}
      textStyle={[props.disabled ? props.textStyleDisabled : {}]}
      checkedColor={props.disabled ? props.checkedColorDisabled : undefined}
      disabled={props.disabled}
    />
  )

  return (
    <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      {checkboxes}
    </View>
  )
}
