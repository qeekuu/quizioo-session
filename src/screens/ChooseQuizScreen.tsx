import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, colors } from "./ScreenStyles.styles";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import AppButton from "../components/AppButton";
import {RootStackParamList} from "../navigation/types";
import {useNavigation} from "@react-navigation/native";

type Nav = NativeStackNavigationProp<RootStackParamList, "ChooseQuiz">;

export default function ChooseQuizScreen(){
	const navigation = useNavigation<Nav>();

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.boldText}>Quizzio</Text>
			</View>
			<View style={styles.mainCard}>
				<Text style={styles.boldText}>Choose Quiz</Text>
				<AppButton
					title="Inżynieria Oprogramowania"
					onPress={() => navigation.navigate("QuizDetails")}
				/>
				<AppButton
					title="Aplikacje Internetowe"
					onPress={() => console.log("Aplikacje Internetowe")}
				/>
			</View>
		</SafeAreaView>	
	);
}

