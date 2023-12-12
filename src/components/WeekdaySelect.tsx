import React from "react";
import { View } from "react-native";
import { CheckBox } from "react-native-elements";

import * as Colors from "../constants/colors";

interface WeekdaySelectProps {
  values: boolean[];
  onToggle: (dayIdx: number) => void;
  disabled?: boolean;
  containerStyleDisabled?: any;
  textStyleDisabled?: any;
  checkedColorDisabled?: string;
}

const WeekdaySelect: React.FC<WeekdaySelectProps> = (props) => {
  const defaultStyle = {
    color: Colors.darkAccent,
  };

  const defaultContainerStyle = {
    marginLeft: 0,
    marginRight: 5,
    padding: 5,
  };

  const defaultContainerStyleDisabled = {
    borderColor: "rgba(0,0,0,0)",
  };

  const containerStyleDisabled = [
    defaultContainerStyleDisabled,
    ...(props.containerStyleDisabled || []),
  ];

  const checkboxes = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (name, i) => (
      <CheckBox
        key={i}
        title={name}
        checked={props.values[i]}
        onPress={() => props.onToggle(i)}
        size={16}
        containerStyle={[
          defaultContainerStyle,
          props.disabled ? containerStyleDisabled : {},
        ]}
        textStyle={[
          defaultStyle,
          props.disabled ? props.textStyleDisabled : {},
        ]}
        checkedColor={props.disabled ? props.checkedColorDisabled : undefined}
        disabled={props.disabled}
      />
    ),
  );

  return (
    <View
      style={{
        marginTop: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
      }}
    >
      {checkboxes}
    </View>
  );
};

export default WeekdaySelect;
