import React from "react";
import { View, Text } from "react-native";
import { styles } from "./ScreenStyles.styles";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import AppButton from "../components/AppButton";
import ScreenWrapper from "../components/wrappers/ScreenWrapper";
import UpdateButton from "../components/UpdateButton";
import {RootStackParamList} from "../navigation/types";
import {useNavigation} from "@react-navigation/native";

type Nav = NativeStackNavigationProp<RootStackParamList, "ChooseQuiz">;

export default function ChooseQuizScreen(){
	const navigation = useNavigation<Nav>();

	return (
		<ScreenWrapper title="Quizzio" footer={<UpdateButton />}>
			<View style={styles.mainCard}>
				<Text style={styles.boldText}>Choose Quiz</Text>
				<AppButton
					title="Inżynieria Oprogramowania"
					onPress={() => navigation.navigate("IOScreen")}
				/>
				<AppButton
					title="Programowanie Współbieżne"
					onPress={() => navigation.navigate("QuizDetails", { quizId: "pw" })}
				/>
				<AppButton
					title="Systemy Operacyjne 2"
					onPress={() => navigation.navigate("SOScreen")}
        />
			</View>
		</ScreenWrapper>
	);
}

