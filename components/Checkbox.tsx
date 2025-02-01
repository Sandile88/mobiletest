import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: number;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  size = 24,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 6,
          opacity: disabled ? 0.5 : 1,
        },
        checked && styles.checked,
      ]}
    >
      {checked && (
        <MaterialCommunityIcons
          name="check"
          size={size * 0.75}
          color="white"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
});
