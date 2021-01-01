import * as React from 'react';
import { View } from 'react-native';
import { CheckBox } from 'react-native-elements';

export default function WeekdaySelect(props) {
  // Props:
  // - values
  // - onToggle
  // - disabled
  // - containerStyleDisabled
  // - textStyleDisabled
  // - checkedColorDisabled

  let defaultContainerStyle = {
    marginLeft: 0,
    marginRight: 0,
    padding: 5,
  }

  let defaultContainerStyleDisabled = {
    borderColor: 'rgba(0,0,0,0)',
  }

  let containerStyleDisabled = {
    ...defaultContainerStyleDisabled,
    ...props.containerStyleDisabled
  }


  let checkboxes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) =>
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
  );

  return (
    <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      {checkboxes}
    </View>
  )

}
