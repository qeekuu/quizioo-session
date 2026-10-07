import React from "react";
import { View, Text } from "react-native";
import { styles } from "./ScreenStyles.styles";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import AppButton from "../components/AppButton";
import ScreenWrapper from "../components/wrappers/ScreenWrapper";
import {RootStackParamList} from "../navigation/types";
import {useNavigation} from "@react-navigation/native";

type Nav = NativeStackNavigationProp<RootStackParamList, "PWScreen">;

export default function PWScreen(){
	const navigation = useNavigation<Nav>();

	return (
		<ScreenWrapper title="Programowanie Współbieżne">
				<View style={styles.mainCard}>
					<Text style={styles.boldText}>Choose Quiz</Text>
					<AppButton
						title="Kolokwium poprawkowe"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "pw" })}
					/>
					<AppButton
						title="Paduch - wejściówka 1"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "Paduch_wejsciowka_1" })}
					/>
				</View>
		</ScreenWrapper>
	);
}
