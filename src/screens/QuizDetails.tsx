import React, { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
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

type AnswerRecord = {
    questionId: number;
    question: string;
    answers: string[];
    correct: number[];
    selected: number[];
    isCorrect: boolean;
};

const arraysEqualAsSets = (a: number[], b: number[]) => {
    if (a.length !== b.length)
        return false;

    const sa = new Set(a);
    for (const x of b) {
        if (!sa.has(x))
            return false;
    }
    return true;
};

const shuffle = <T,>(arr: T[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

const shuffleAnswersAndRemapCorrect = (q: Question): Question => {
    const paired = q.answers.map((text, oldIndex) => ({ text, oldIndex }));

    for (let i = paired.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [paired[i], paired[j]] = [paired[j], paired[i]];
    }

    const oldToNew: Record<number, number> = {};
    paired.forEach((item, newIndex) => {
        oldToNew[item.oldIndex] = newIndex;
    });

    const newAnswers = paired.map(p => p.text);
    const newCorrect = q.correct.map(oldIdx => oldToNew[oldIdx]).sort((a, b) => a - b);

    return {
        ...q,
        answers: newAnswers,
        correct: newCorrect,
    };
};

export default function QuizDetails() {
    const route = useRoute<QuizDetailsRouteProp>();
    const { quizId } = route.params;

    const quiz: Quiz | undefined = useMemo(() => {
        return (quizzes as Record<string, Quiz>)[quizId];
    }, [quizId]);

    const shuffledQuestions: Question[] = useMemo(() => {
        const qs = quiz?.questions ?? [];
        const shuffled = shuffle(qs);
        return shuffled.map(shuffleAnswersAndRemapCorrect);
    }, [quizId, quiz]);

    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [history, setHistory] = useState<AnswerRecord[]>([]);

    const current = shuffledQuestions[index];

    const toggleAnswer = (i: number) => {
        setSelected(prev =>
            prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
        );
    };

    const onSubmit = () => {
        if (!current)
            return;

        const isCorrect = arraysEqualAsSets(selected, current.correct);
        if (isCorrect) {
            setScore(s => s + 1);
        }

        const record: AnswerRecord = {
            questionId: current.id,
            question: current.question,
            answers: current.answers,
            correct: current.correct,
            selected,
            isCorrect,
        };
        setHistory(prev => [...prev, record]);

        setSelected([]);
        setIndex(i => i + 1);
    };

    if (!quiz) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>Nie znaleziono quizu: {quizId}</Text>
            </SafeAreaView>
        );
    }

    if (index >= shuffledQuestions.length) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.topBar}>
                    <Text style={styles.boldText}>{quiz.title}</Text>
                </View>

                <View style={styles.quizDetails}>
                    <Text style={styles.boldText}>Koniec!</Text>
                    <Text style={styles.text}>
                        Wynik: {score}/{shuffledQuestions.length}
                    </Text>
                </View>

                <FlatList
                    data={history}
                    keyExtractor={(item) => String(item.questionId)}
                    contentContainerStyle={{ padding: 12, gap: 12 }}
                    renderItem={({ item, index: i }) => {
                        const correctTexts = item.correct.map(idx => item.answers[idx]);
                        const selectedTexts = item.selected.map(idx => item.answers[idx]);

                        return (
                            <View style={styles.resultCard}>
                                <Text style={styles.boldText}>
                                    {i + 1}. {item.isCorrect ? "✅ Poprawnie" : "❌ Błędnie"}
                                </Text>

                                <Text style={styles.text}>{item.question}</Text>

                                <Text style={styles.text}>
                                    Twoja odpowiedź:{" "}
                                    {selectedTexts.length ? selectedTexts.join(", ") : "—"}
                                </Text>

                                <Text style={styles.text}>
                                    Poprawna odpowiedź: {correctTexts.join(", ")}
                                </Text>
                            </View>
                        );
                    }}
                />

                <View style={{ padding: 12 }}>
                    <AppButton
                        title="Zagraj ponownie"
                        onPress={() => {
                            setIndex(0);
                            setSelected([]);
                            setScore(0);
                            setHistory([]);
                        }}
                    />
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
                    Pytanie {index + 1}/{shuffledQuestions.length}
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

