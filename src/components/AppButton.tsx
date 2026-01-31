import React from "react";
import { Text, Pressable, StyleSheet, ViewStyle } from "react-native";

interface AppButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	style?: ViewStyle;
}

export default function AppButton({
title,
onPress,
disabled = false,
style,
}: AppButtonProps){
	return(
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.button,
				pressed && styles.pressed,
				disabled && styles.disabled,
				style,
			]}
		>
			<Text style={styles.text}>{title}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fd86d4",
	padding: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
	alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: "#9CA3AF",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
