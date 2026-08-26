import React from "react";
import { View, Text } from "react-native";
import { styles } from "./ScreenStyles.styles";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import AppButton from "../components/AppButton";
import ScreenWrapper from "../components/wrappers/ScreenWrapper";
import {RootStackParamList} from "../navigation/types";
import {useNavigation} from "@react-navigation/native";

type Nav = NativeStackNavigationProp<RootStackParamList, "SOScreen">;

export default function ChooseQuizScreen(){
	const navigation = useNavigation<Nav>();

	return (
		<ScreenWrapper title="Systemy Operacyjne 2">
				<View style={styles.mainCard}>
					<Text style={styles.boldText}>Choose Quiz</Text>
					<AppButton
						title="All questions"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2" })}
					/>
					<AppButton
						title="Zarządzanie procesami i wątkami"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_1" })}
					/>
					<AppButton
						title="Planowanie (O(1) i CFS)"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_2" })}
					/>
					<AppButton
						title="Wywołania systemowe, przerwania i dolne połówki"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_3" })}
					/>
					<AppButton
						title="Mechanizmy synchronizacji"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_4" })}
					/>
					<AppButton
						title="Pomiar i synchronizacja względem czasu"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_5" })}
					/>
					<AppButton
						title="Zarządzanie pamięcią i przestrzeń adresowa"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_6" })}
					/>
					<AppButton
						title="System plików, wejście-wyjście i sieć"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_7" })}
					/>
          <AppButton
						title="Baza 2026"
						onPress={() => navigation.navigate("QuizDetails", { quizId: "so2_8" })}
					/>
				</View>
		</ScreenWrapper>
	);
}

