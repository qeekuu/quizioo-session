import React, { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import AppButton from "../components/AppButton";
import { styles } from "./ScreenStyles.styles";
import quizzes from "../../assets/data/quizzes.json";
import questions from "../../assets/data/questions.json";
import io1 from "../../assets/data/wyklad_1.json";
import io2 from "../../assets/data/wyklad_2.json";
import io3 from "../../assets/data/wyklad_3.json";
import io4 from "../../assets/data/wyklad_4.json";
import io5 from "../../assets/data/wyklad_5.json";
import io6 from "../../assets/data/wyklad_6.json";
import io7 from "../../assets/data/wyklad_7.json";
import io8 from "../../assets/data/wyklad_8.json";
import uml from "../../assets/data/uml.json";
import wk from "../../assets/data/wzorce_konstrukcyjne.json";
import ws from "../../assets/data/wzorce_strukturalne.json";
import wc from "../../assets/data/wzorce_czynnosciowe.json";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

type Nav = NativeStackNavigationProp<RootStackParamList, "QuizDetails">;
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

const QUIZ_DB: Record<string, Quiz> = {
  ...(questions as Record<string, Quiz>),
  ...(io1 as Record<string, Quiz>),
  ...(io2 as Record<string, Quiz>),
  ...(io3 as Record<string, Quiz>),
  ...(io4 as Record<string, Quiz>),
  ...(io5 as Record<string, Quiz>),
  ...(io6 as Record<string, Quiz>),
  ...(io7 as Record<string, Quiz>),
  ...(io8 as Record<string, Quiz>),
  ...(uml as Record<string, Quiz>),
  ...(wk as Record<string, Quiz>),
  ...(ws as Record<string, Quiz>),
  ...(wc as Record<string, Quiz>),
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
	const navigation = useNavigation<Nav>();
    const route = useRoute<QuizDetailsRouteProp>();
    const { quizId } = route.params;

    // const quiz: Quiz | undefined = useMemo(() => {
        // return (questions as Record<string, Quiz>)[quizId];
    // }, [quizId]);
	
	const quiz = useMemo<Quiz | undefined>(() => {
		return QUIZ_DB[quizId];
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
                <Text style={styles.text}>Cannot find quiz: {quizId}</Text>
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
                    <Text style={styles.boldText}>Finished!</Text>
                    <Text style={styles.text}>
                        Score: {score}/{shuffledQuestions.length}
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
                                    {i + 1}. {item.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                                </Text>

                                <Text style={styles.text}>{item.question}</Text>

                                <Text style={styles.text}>
                                    Your answer:{" "}
                                    {selectedTexts.length ? selectedTexts.join(", ") : "—"}
                                </Text>

                                <Text style={styles.text}>
                                    Correct answer: {correctTexts.join(", ")}
                                </Text>
                            </View>
                        );
                    }}
                />

                <View style={{ padding: 12, gap: 8 }}>
                    <AppButton
                        title="Play again!"
                        onPress={() => {
                            setIndex(0);
                            setSelected([]);
                            setScore(0);
                            setHistory([]);
                        }}
                    />
					<AppButton
						title="Return to selection screen"
						onPress={() => navigation.navigate("ChooseQuiz")}
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
                    Question {index + 1}/{shuffledQuestions.length}
                </Text>
                <Text style={styles.text}>Score: {score}</Text>
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

