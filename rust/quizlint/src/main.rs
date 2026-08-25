use serde::Deserialize;
use std::collections::{HashMap, HashSet};
use std::path::Path;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "lowercase")]
enum Severity {
    Error,
    Warning,
}

#[derive(Debug, serde::Serialize)]
struct Issue {
    severity: Severity,
    file: String,
    quiz: String,
    question_id: u32,
    message: String,
}

#[derive(Debug, Deserialize)]
struct Question {
    id: u32,
    question: String,
    answers: Vec<String>,
    correct: Vec<usize>,
    #[serde(default)]
    disabled: bool,
}

#[derive(Debug, Deserialize)]
struct Quiz {
    title: String,
    questions: Vec<Question>,
}

type QuizFile = HashMap<String, Quiz>;

fn check_question(q: &Question, file: &str, quiz: &str) -> Vec<Issue> {
    let mut issues = Vec::new();

    let mut add = |severity: Severity, message: String| {
        issues.push(Issue {
            severity,
            file: file.to_string(),
            quiz: quiz.to_string(),
            question_id: q.id,
            message,
        });
    };

    for &index in &q.correct {
        if index >= q.answers.len() {
            add(
                Severity::Error,
                format!("correct={index} out of range ({} answers)", q.answers.len()),
            );
        }
    }

    if q.correct.is_empty() {
        add(Severity::Error, "no correct answer marked".to_string());
    }

    if q.answers.len() < 2 {
        add(
            Severity::Error,
            format!("only {} answer(s) to choose from", q.answers.len()),
        );
    }

    let unique: HashSet<&String> = q.answers.iter().collect();
    if unique.len() != q.answers.len() {
        add(Severity::Warning, "duplicated answers".to_string());
    }

    issues
}

fn check_quiz(quiz: &Quiz, file: &str, key: &str) -> Vec<Issue> {
    let mut issues = Vec::new();
    let mut seen_ids = HashSet::new();
    let mut seen_texts = HashSet::new();

    for q in &quiz.questions {
        if q.disabled {
            continue;
        }

        issues.extend(check_question(q, file, key));

        if !seen_ids.insert(q.id) {
            issues.push(Issue {
                severity: Severity::Error,
                file: file.to_string(),
                quiz: key.to_string(),
                question_id: q.id,
                message: "duplicated id".to_string(),
            });
        }

        if !seen_texts.insert(&q.question) {
            issues.push(Issue {
                severity: Severity::Warning,
                file: file.to_string(),
                quiz: key.to_string(),
                question_id: q.id,
                message: "duplicated question text".to_string(),
            });
        }
    }

    issues
}

fn main() -> anyhow::Result<()> {
    let dir = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "assets/data".to_string());

    let mut paths: Vec<_> = std::fs::read_dir(&dir)?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|ext| ext == "json"))
        .filter(|path| !file_name(path).starts_with('_'))
        .collect();
    paths.sort();

    let mut issues = Vec::new();
    let mut quiz_keys: HashMap<String, String> = HashMap::new();
    let mut question_count = 0;

    for path in &paths {
        let name = file_name(path);
        let text = std::fs::read_to_string(path)?;
        let quiz_file: QuizFile = serde_json::from_str(&text)?;

        let mut keys: Vec<&String> = quiz_file.keys().collect();
        keys.sort();

        for key in keys {
            let quiz = &quiz_file[key];
            question_count += quiz.questions.len();
            println!("{name}: {key} — {} ({} questions)", quiz.title, quiz.questions.len());

            if let Some(other) = quiz_keys.get(key) {
                issues.push(Issue {
                    severity: Severity::Error,
                    file: name.clone(),
                    quiz: key.clone(),
                    question_id: 0,
                    message: format!("quiz key already used in {other}"),
                });
            } else {
                quiz_keys.insert(key.clone(), name.clone());
            }

            issues.extend(check_quiz(quiz, &name, key));
        }
    }

    for issue in &issues {
        let label = match issue.severity {
            Severity::Error => "error",
            Severity::Warning => "warning",
        };
        println!(
            "{label}: {}/{}/q{}: {}",
            issue.file, issue.quiz, issue.question_id, issue.message
        );
    }

    let errors = issues
        .iter()
        .filter(|issue| matches!(issue.severity, Severity::Error))
        .count();
    let warnings = issues.len() - errors;

    println!(
        "\n{} files, {question_count} questions, {errors} error(s), {warnings} warning(s)",
        paths.len()
    );

    let report_path = Path::new(&dir).join("_lint-report.json");
    std::fs::write(&report_path, serde_json::to_string_pretty(&issues)?)?;
    println!("report written to {}", report_path.display());

    if errors > 0 {
        std::process::exit(1);
    }

    Ok(())
}

fn file_name(path: &Path) -> String {
    path.file_name()
        .map(|name| name.to_string_lossy().to_string())
        .unwrap_or_else(|| path.display().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn question() -> Question {
        Question {
            id: 1,
            question: "Does it work?".to_string(),
            answers: vec!["Yes".to_string(), "No".to_string()],
            correct: vec![1],
            disabled: false,
        }
    }

    #[test]
    fn valid_question_reports_nothing() {
        let issues = check_question(&question(), "test.json", "test");
        assert!(issues.is_empty());
    }

    #[test]
    fn detects_empty_correct() {
        let q = Question { correct: vec![], ..question() };
        let issues = check_question(&q, "test.json", "test");

        assert_eq!(issues.len(), 1);
        assert_eq!(issues[0].message, "no correct answer marked");
    }

    #[test]
    fn detects_index_out_of_range() {
        let q = Question { correct: vec![5], ..question() };
        let issues = check_question(&q, "test.json", "test");

        assert_eq!(issues.len(), 1);
        assert!(issues[0].message.contains("out of range"));
    }

    #[test]
    fn detects_too_few_answers() {
        let q = Question { answers: vec!["Yes".to_string()], correct: vec![0], ..question() };
        let issues = check_question(&q, "test.json", "test");

        assert_eq!(issues.len(), 1);
        assert!(issues[0].message.contains("only 1 answer"));
    }

    #[test]
    fn disabled_questions_are_skipped() {
        let quiz = Quiz {
            title: "Test".to_string(),
            questions: vec![Question { correct: vec![], disabled: true, ..question() }],
        };

        assert!(check_quiz(&quiz, "test.json", "test").is_empty());
    }

    #[test]
    fn duplicated_id_is_error_duplicated_text_is_warning() {
        let quiz = Quiz {
            title: "Test".to_string(),
            questions: vec![question(), question()],
        };
        let issues = check_quiz(&quiz, "test.json", "test");

        assert_eq!(issues.len(), 2);
        assert!(matches!(issues[0].severity, Severity::Error));
        assert!(matches!(issues[1].severity, Severity::Warning));
    }
}
