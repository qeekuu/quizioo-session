import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {RootStackParamList} from "./types";

import ChooseQuizScreen from "../screens/ChooseQuizScreen";
import QuizDetails from "../screens/QuizDetails";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(){
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="ChooseQuiz">
				<Stack.Screen
					name="ChooseQuiz"
					component={ChooseQuizScreen}
					options={{headerShown: false}}
				/>
				<Stack.Screen
					name="QuizDetails"
					component={QuizDetails}
					options={{headerShown: false}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
