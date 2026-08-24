import React from "react";
import { ScrollView, View, Text, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../screens/ScreenStyles.styles";

export type ScreenWrapperProps = {
	children: React.ReactNode;
	title?: string;
	withScroll?: boolean;
	noPadding?: boolean;
	style?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
};

export const ScreenWrapper = ({
	children,
	title,
	withScroll = true,
	noPadding = false,
	style,
	contentStyle,
}: ScreenWrapperProps) => {
	const content = withScroll ? (
		<ScrollView
			contentContainerStyle={[{ flexGrow: 1, paddingBottom: 24 }, contentStyle]}
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[{ flex: 1 }, contentStyle]}>{children}</View>
	);

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.container, noPadding && { paddingHorizontal: 0 }, style]}
		>
			{title ? (
				<View style={styles.topBar}>
					<Text style={styles.boldText}>{title}</Text>
				</View>
			) : null}

			{content}
		</SafeAreaView>
	);
};

export default ScreenWrapper;
