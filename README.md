# Quizio

A mobile quiz app (React Native + Expo SDK 54) for studying for exams — Inżynieria Oprogramowania (Software Engineering), Programowanie Współbieżne (Concurrent Programming) and Systemy Operacyjne 2 (Operating Systems 2).

Questions are multiple-choice. Both the question order and the answer order are shuffled on every attempt, and the final screen shows your score along with every question and its correct answers.

## Requirements

- Node.js — the project runs on Node 20, but npm 12 warns that it expects Node ≥ 22. It is only a warning and breaks nothing.
- An Expo account (for builds and OTA updates)

## Running locally

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS).

Note: the **Update** button does not work in Expo Go or in development mode — `expo-updates` only functions in release builds. In Expo Go you will see "Update check failed", which is expected.

## Project structure

```
assets/data/          JSON files with questions
src/components/       AppButton, InputBox, UpdateButton
src/components/wrappers/ScreenWrapper — shared screen container (scroll, title, footer)
src/navigation/       stack navigator + route types
src/screens/          ChooseQuizScreen, IOScreen, QuizDetails, shared styles
```

`ScreenStyles.styles.ts` holds the color palette and the styles shared across screens.

## Adding a new quiz

1. Create a file in `assets/data/`, e.g. `SO2.json`, in this format:

```json
{
  "so2": {
    "title": "SO2 - Systemy Operacyjne 2",
    "questions": [
      {
        "id": 1,
        "question": "Question text",
        "answers": ["Answer A", "Answer B", "Answer C"],
        "correct": [0, 2]
      }
    ]
  }
}
```

`correct` is an array of zero-based **indices** into `answers`. An empty array means no answer is correct — such a question currently cannot be submitted, because the Submit button is disabled when nothing is selected.

2. Import the file in `src/screens/QuizDetails.tsx` and add it to `QUIZ_DB`.
3. Add an `AppButton` pointing at the quiz in `ChooseQuizScreen.tsx` (or `IOScreen.tsx`), passing the JSON's top-level key as `quizId`.

## Project diagnostics

```bash
npx expo-doctor          # checks dependency and config consistency
npx expo install --fix   # aligns package versions with the SDK
npx tsc --noEmit         # type check
```

If `expo-doctor` reports duplicate native modules, run `npm dedupe`. A native build can only contain one version of a given module — duplicates end in a compilation error.

## Building (EAS)

```bash
npx eas-cli login
npx eas-cli build --profile preview --platform android
```

The CLI package is called `eas-cli`, not `eas` — `npx eas` will not work.

Profiles in `eas.json`:

| Profile | Purpose | OTA channel |
|---|---|---|
| `development` | dev client, code served from the dev server | none |
| `preview` | plain APK for testing | `preview` |
| `production` | production build, auto-incremented version | `production` |

Use the `preview` profile to test OTA updates — `development` has no channel assigned, so `expo-updates` will not fetch anything there.

## OTA updates (expo-updates)

Configured in `app.json`:

```json
"runtimeVersion": { "policy": "fingerprint" },
"updates": { "url": "https://u.expo.dev/<projectId>" }
```

The `fingerprint` policy hashes the native part of the project. That way, adding a native module changes `runtimeVersion` automatically, and older builds will not receive an update they could not run.

Publishing an update:

```bash
npx eas-cli update --branch preview --message "description of changes"
```

An update only reaches builds that already contain the native `expo-updates` module — adding it required a fresh build. Changes limited to JS/JSON (new questions, for example) ship with `eas update` alone, no rebuild needed.

The app checks for updates automatically on launch (`checkAutomatically` defaults to `ON_LOAD`) and applies them on the next start. The **Update** button at the bottom of the quiz selection screen forces a manual check — it shows "No update available" when there is nothing, or a spinner with "Updating" before restarting the app once the update is downloaded.
