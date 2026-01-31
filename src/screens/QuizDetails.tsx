import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import AppButton from "../components/AppButton";
import { styles } from "./ScreenStyles.styles";
import quizzes from "../../assets/data/quizzes.json";

type QuizDetailsRouteProp = RouteProp<RootStackParamList, "QuizDetails">;

type Question = {
    id: number;
    question: string;
    answers: string[];
    correct: number[];
};

type Quiz = {
    title: string;
    questions: Question[];
};

export default function QuizDetails() {
    const route = useRoute<QuizDetailsRouteProp>();
    const { quizId } = route.params;

    const quiz: Quiz | undefined = useMemo(() => {
        return (quizzes as Record<string, Quiz>)[quizId];
    }, [quizId]);

    const questions = quiz?.questions ?? [];

    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<number[]>([]);
    const [score, setScore] = useState(0);

    const current = questions[index];

    const toggleAnswer = (i: number) => {
        setSelected(prev =>
            prev.includes(i)
                ? prev.filter(x => x !== i)
                : [...prev, i]
        );
    };

    const arraysEqualAsSets = (a: number[], b: number[]) => {
        if (a.length !== b.length) return false;
        const sa = new Set(a);
        for (const x of b) {
            if (!sa.has(x)) return false;
        }
        return true;
    };

    const onSubmit = () => {
        if (!current) return;

        const isCorrect = arraysEqualAsSets(selected, current.correct);
        if (isCorrect) {
            setScore(s => s + 1);
        }

        setSelected([]);
        setIndex(i => Math.min(i + 1, questions.length));
    };

    if (!quiz) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>
                    Nie znaleziono quizu: {quizId}
                </Text>
            </SafeAreaView>
        );
    }

    if (index >= questions.length) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.topBar}>
                    <Text style={styles.boldText}>{quiz.title}</Text>
                </View>

                <View style={styles.quizDetails}>
                    <Text style={styles.boldText}>Koniec!</Text>
                    <Text style={styles.text}>
                        Wynik: {score}/{questions.length}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.boldText}>{quiz.title}</Text>
            </View>

            <View style={styles.quizDetails}>
                <Text style={styles.boldText}>
                    Pytanie {index + 1}/{questions.length}
                </Text>
                <Text style={styles.text}>Wynik: {score}</Text>
                <Text style={styles.text}>{current.question}</Text>
            </View>

            <View style={styles.answers}>
                {current.answers.map((ans, i) => {
                    const isSelected = selected.includes(i);

                    return (
                        <Pressable
                            key={i}
                            onPress={() => toggleAnswer(i)}
                            style={[
								styles.answerBox,
                                isSelected && styles.answerBoxSelected,
                            ]}
                        >
                            <Text style={styles.text}>{ans}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <View>
                <AppButton
                    title="Submit"
                    onPress={onSubmit}
                    disabled={selected.length === 0}
                />
            </View>
        </SafeAreaView>
    );
}

