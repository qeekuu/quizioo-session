import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, colors } from "./ScreenStyles.styles";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import AppButton from "../components/AppButton";
import {RootStackParamList} from "../navigation/types";
import {useNavigation} from "@react-navigation/native";

type Nav = NativeStackNavigationProp<RootStackParamList, "IOScreen">;

export default function ChooseQuizScreen(){
	const navigation = useNavigation<Nav>();

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.boldText}>Inżynieria Oprogramowania</Text>
			</View>
			<ScrollView>
				<View style={styles.mainCard}>
					<Text style={styles.boldText}>Choose Quiz</Text>
					<AppButton
						title="All questions"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io" })}
					/>
					<AppButton
						title="Lecture 1"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io1" })}
					/>
					<AppButton
						title="Lecture 2"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io2" })}
					/>
					<AppButton
						title="Lecture 3"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io3" })}
					/>
					<AppButton
						title="Lecture 4"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io4" })}
					/>
					<AppButton
						title="Lecture 5"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io5" })}
					/>
					<AppButton
						title="Lecture 6"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io6" })}
					/>
					<AppButton
						title="Lecture 7"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io7" })}
					/>
					<AppButton
						title="Lecture 8"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "io8" })}
					/>
					<AppButton
						title="UML"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "uml" })}
					/>
					<AppButton
						title="Wzorce konstrukcyjne"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "wk" })}
					/>
					<AppButton
						title="Wzorce strukturalne"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "ws" })}
					/>
					<AppButton
						title="Wzorce czynnościowe"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "wc" })}
					/>

				</View>
			</ScrollView>
		</SafeAreaView>	
	);
}

