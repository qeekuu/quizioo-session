import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";

export default function ChooseQuizScreen(){
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.boldText}>Quizzio</Text>
			</View>
			<View style={styles.mainCard}>
				<Text style={styles.boldText}>Choose Quiz</Text>
				<AppButton
					title="Inżynieria Oprogramowania"
					onPress={() => console.log("Klik")}
				/>
				<AppButton
					title="Aplikacje Internetowe"
					onPress={() => console.log("Aplikacje Internetowe")}
				/>
			</View>
		</SafeAreaView>	
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#141b2c',
	},

	text:{
		color: '#fff',
	},
	
	topBar: {
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 10,
		marginBottom: 25,
		borderRadius: 10,
		borderBottomWidth: 7,
		borderBottomColor: '#fd86d4',
	},

	boldText: {
		color: '#fff',
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
