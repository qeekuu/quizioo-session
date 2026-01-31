import { StyleSheet } from "react-native";

export const colors = {
	surface: '#141b2c',
	bordercolor: '#fd86d4',
	textcolor: '#fff',
};

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.surface,
		paddingHorizontal: 12,
	},

	text:{
		color: colors.textcolor,
		fontSize: 16,
	},
	
	topBar: {
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 25,
		borderRadius: 10,
		borderBottomWidth: 7,
		borderBottomColor: colors.bordercolor,
	},

	boldText: {
		color: colors.textcolor,
		fontWeight: 'bold',
		fontSize: 17,
	},

	mainCard: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
	},

	quizDetails: {
		gap: 8,
	},

	answers: {
		gap: 10,
		marginBottom: 12,
	},

	answerBox: {
		padding: 8,
		borderWidth: 5,
		borderRadius: 12,
		borderColor: colors.bordercolor,	
	},

	answerBoxSelected: {
		opacity: 0.6,
		transform: [{ scale: 0.97 }],
	},

	resultCard: {
		borderWidth: 1,
		borderColor: colors.bordercolor,
		borderRadius: 12,
		padding: 12,
		gap: 6,
	},
});
