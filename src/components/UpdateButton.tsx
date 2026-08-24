import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Updates from "expo-updates";
import AppButton from "./AppButton";
import { colors, styles as screenStyles } from "../screens/ScreenStyles.styles";

type Status = "idle" | "checking" | "none" | "updating" | "error";

export default function UpdateButton() {
	const [status, setStatus] = useState<Status>("idle");

	const busy = status === "checking" || status === "updating";

	const onPress = async () => {
		setStatus("checking");
		try {
			const result = await Updates.checkForUpdateAsync();

			if (!result.isAvailable) {
				setStatus("none");
				return;
			}

			setStatus("updating");
			await Updates.fetchUpdateAsync();
			await Updates.reloadAsync();
		} catch {
			setStatus("error");
		}
	};

	return (
		<View style={styles.wrapper}>
			<AppButton title="Update" onPress={onPress} disabled={busy} />

			{status === "none" && (
				<Text style={styles.status}>No update available</Text>
			)}

			{busy && (
				<View style={styles.busyRow}>
					<ActivityIndicator size="small" color={colors.bordercolor} />
					<Text style={styles.status}>
						{status === "checking" ? "Checking" : "Updating"}
					</Text>
				</View>
			)}

			{status === "error" && (
				<Text style={styles.status}>Update check failed</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 12,
		gap: 6,
	},
	busyRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	status: {
		color: colors.textcolor,
		fontSize: 14,
		textAlign: "center",
		opacity: 0.8,
	},
});
