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
	},

	text:{
		color: colors.textcolor,
	},
	
	topBar: {
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 10,
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
		margin: 10,
		gap: 16,
	},

});
