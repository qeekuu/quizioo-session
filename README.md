# Quizio - Session

A mobile quiz app (React Native + Expo SDK 54) for studying for exams — Inżynieria Oprogramowania (Software Engineering), Programowanie Współbieżne (Concurrent Programming) and Systemy Operacyjne 2 (Operating Systems 2).

Questions are multiple-choice. Both the question order and the answer order are shuffled on every attempt, and the final screen shows your score along with every question and its correct answers.

## Workflow

**Always commit and push before running `eas build` or `eas update`.** A published build or update is a snapshot of the working tree at that moment; if it is not in git, there is no way to tell later what shipped, and no way to go back to it when something breaks on a device.

Commits follow Conventional Commits, matching the existing history:

| Prefix | Use for | Example from this repo |
|---|---|---|
| `feat:` | new functionality, new quiz content | `feat: add questions for SO2 exam from the last year` |
| `chore:` | dependencies, tooling, configuration | `chore: dedupe duplicate expo-font to fix native build` |
| `docs:` | documentation | `docs: add README` |
| `fix:` | bug fixes | `fix: correct answer indices in wyklad_3` |

Small, self-contained changes can go straight to `master`. Open a pull request instead when the change is large, touches the native layer (`app.json`, native dependencies, `eas.json`), or you are not confident it is correct:

```bash
git checkout -b fix/scroll-on-results
# ... changes ...
git commit -m "fix: keep results list scrollable on small screens"
git push -u origin fix/scroll-on-results
```

Once the branch is pushed, open the PR either way:

- **From the terminal:** `gh pr create` (requires the [GitHub CLI](https://cli.github.com/); authenticate once with `gh auth login`).
- **From the browser:** after the push, GitHub shows a "Compare & pull request" banner on the repository page for a few minutes. You can also go to the **Pull requests** tab → **New pull request**, and pick your branch as *compare* against `master` as *base*. The `git push` output itself prints a direct link to the PR creation form — usually the fastest route.

This matters most for native changes: they require a full rebuild to verify, so a broken one is expensive to discover and awkward to undo once it is sitting on `master`.

## Requirements

- Node.js — the project runs on Node 20, but npm 12 warns that it expects Node ≥ 22. It is only a warning and breaks nothing.
- An Expo account (for builds and OTA updates)

## Running locally

```bash
npm install
npx expo start --go     # Expo Go
npx expo start          # development build (dev client)
```

Then scan the QR code, or press `a` (Android) / `i` (iOS).

**The `--go` flag matters.** Since `expo-dev-client` landed in the project, plain `npx expo start` starts in development build mode: the QR code points at the `quizio-session://` scheme, which Expo Go cannot open — the app simply does not launch. Either start with `--go`, or press **`s`** in the Metro terminal to switch modes; the QR code is redrawn as `exp://` and Expo Go picks it up.

The development build (without `--go`) requires an installed APK from the `development` profile. That is the mode to use for anything Expo Go cannot run — and the only one where `expo-updates` behaves like on a real device.

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

## quizlint — validating the questions (Rust)

`rust/quizlint` is a small Rust program that checks the question JSON in `assets/data/`. The app itself is TypeScript — quizlint is purely a development tool, nothing from it ends up in a build.

```bash
cargo run --manifest-path rust/quizlint/Cargo.toml -- assets/data
cargo test --manifest-path rust/quizlint/Cargo.toml
```

The directory is an optional argument, defaulting to `assets/data`. Every `.json` file in it is checked, except those whose name starts with `_` — that is what keeps the generated report from being validated as if it were a quiz.

### What it checks

First the JSON has to parse into the quiz shape (`title` plus a list of questions with `id`, `question`, `answers`, `correct`, and an optional `disabled`). A parse error or a missing field aborts the run immediately.

Questions marked `"disabled": true` are skipped entirely — the escape hatch for questions with broken content that are not worth fixing or deleting yet.

| Check | Level |
|---|---|
| an index in `correct` is out of range for `answers` | error |
| `correct` is empty — no correct answer marked | error |
| fewer than 2 answers to choose from | error |
| duplicated `id` within one quiz | error |
| the same quiz key used in two files | error |
| duplicated answers within one question | warning |
| duplicated question text within one quiz | warning |

The split matters: **only errors exit with code 1** and fail CI. Warnings pass — a repeated answer or a duplicated question is usually deliberate or harmless, but still worth seeing.

### Output

The run prints the quizzes it found (file, key, title, question count), then every issue as `level: file/quiz/qID: message`, then a summary (files, questions, errors, warnings). It also writes the full list as JSON to `assets/data/_lint-report.json` — useful for inspecting a CI run or for further processing.

### CI

`.github/workflows/quizlint.yml` runs on every push and PR against `master`: first `cargo test` (unit tests for the rules, at the bottom of `main.rs`), then the linter itself over `assets/data`. It needs the `stable` toolchain, pinned by `rust-toolchain.toml`.

The practical takeaway: run quizlint locally before adding new questions. The most common mistake when writing them by hand is a wrong index in `correct` — easy to make when reordering answers, and in the app it only shows up as a question that cannot be answered correctly.

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
"runtimeVersion": { "policy": "appVersion" },
"updates": { "url": "https://u.expo.dev/<projectId>" }
```

The `appVersion` policy makes `runtimeVersion` equal to `version` in `app.json` — currently `1.0.0`, the same on both platforms. An update is only offered to builds carrying the same `runtimeVersion`, so the rule is:

**Do not bump `version` for JavaScript-only changes.** New questions, UI fixes and styling all ship over the air on the current version. Bump `version` only together with a native change, and then everyone has to install a fresh build — every device still on the old version stops receiving updates the moment the version changes.

This replaced the earlier `fingerprint` policy, which recomputed `runtimeVersion` from a hash of the native inputs. It was safer in theory, but in practice it also moved on edits to `package.json` scripts, `eas.json` or `.gitignore` — and every such drift silently cut off OTA delivery until everyone rebuilt.

Publishing an update:

```bash
npx eas-cli update --branch preview --message "description of changes"
```

An update only reaches builds that already contain the native `expo-updates` module — adding it required a fresh build.

### What can and cannot ship over the air

An update carries exactly one thing: the JavaScript bundle produced by Metro, plus the assets it references. It never carries native code. Anything compiled into the `.apk` / `.ipa` at build time is therefore out of reach.

| Change | Ships via `eas update`? |
|---|---|
| TypeScript / React components, hooks, navigation | yes |
| JSON in `assets/data/` — new questions, fixed answers | yes |
| Styles, images, fonts and other bundled assets | yes |
| Adding a **JavaScript-only** dependency | yes |
| Adding a dependency containing **native code** | no — rebuild |
| `app.json`: `package`, `permissions`, `icon`, `splash`, `plugins`, `newArchEnabled`, `version`, `runtimeVersion` | no — rebuild |
| Anything under `android/` or `ios/` | no — rebuild |

The `app.json` row is the one worth internalizing. That file is not read by the running app — it is **input to the build**. Expo's prebuild step turns it into `AndroidManifest.xml`, `build.gradle`, `Info.plist` and the icon/splash resources, and those get compiled into the binary. Edit `app.json`, publish an update, and nothing changes on the device: the manifest that shipped inside the installed build is still the one in force. Treat any `app.json` edit as requiring a new build.

`package-lock.json` is not the deciding factor by itself — what matters is *which kind* of dependency changed. A pure-JS package rewrites the lockfile and still ships over the air, because its code ends up inside the Metro bundle. A package with a native module also rewrites the lockfile, but has to be compiled in, so it needs a build. The `npm dedupe` that resolved the duplicate `expo-font` here touched only the lockfile, yet concerned a native module — that is a build-level change, not an update-level one.

With the `appVersion` policy nothing detects this for you: publish an update after adding a native dependency without bumping `version`, and the update *will* be delivered to old binaries — where it can crash on launch, because the native module it expects is not in the installed app. Judging whether a change is native is now a human responsibility, which is why the table above is worth knowing by heart.

To check whether the native part actually changed, compare the fingerprint of the current source against the last build:

```bash
npx expo-updates fingerprint:generate --platform android   # hash of the current source
npx eas-cli build:list --limit 1                           # runtime/fingerprint of the last build
```

Different hashes mean a native change: bump `version` and rebuild. Identical hashes mean `eas update` is enough.

The app checks for updates automatically on launch (`checkAutomatically` defaults to `ON_LOAD`) and applies them on the next start. The **Update** button at the bottom of the quiz selection screen forces a manual check — it shows "No update available" when there is nothing, or a spinner with "Updating" before restarting the app once the update is downloaded.
