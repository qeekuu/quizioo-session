import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { styles, colors } from "./ScreenStyles.styles";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";
import AppButton from "../components/AppButton";

type Nav = NativeStackNavigationProp<RootStackParamList, "QuizDetails">;

export default function	QuizDetails(){
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.boldText}>QuizDetails</Text>
			</View>
			<View style={styles.quizDetails}>
				<Text style={styles.boldText}>Pytanie 1/X</Text>
				<Text style={styles.text}>Wynik: X</Text>
				<Text style={styles.text}>Wskaż jakie rodzaje nawigacji występują w React Native</Text>
			</View>
			<View style={styles.answers}>
				<Text style={styles.text}>Answer1</Text>
				<Text style={styles.text}>Answer1</Text>
				<Text style={styles.text}>Answer1</Text>
				<Text style={styles.text}>Answer1</Text>
			</View>
			<View style={styles.buttonsSection}>
				<AppButton
					title="Submit"
					onPress={() => console.log("Submit answers")}
				/>
			</View>
		</SafeAreaView>	
	);
}
