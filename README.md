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
| `app.json`: `package`, `permissions`, `icon`, `splash`, `plugins`, `newArchEnabled`, `version` | no — rebuild |
| Anything under `android/` or `ios/` | no — rebuild |

The `app.json` row is the one worth internalizing. That file is not read by the running app — it is **input to the build**. Expo's prebuild step turns it into `AndroidManifest.xml`, `build.gradle`, `Info.plist` and the icon/splash resources, and those get compiled into the binary. Edit `app.json`, publish an update, and nothing changes on the device: the manifest that shipped inside the installed build is still the one in force. Treat any `app.json` edit as requiring a new build.

`package-lock.json` is not the deciding factor by itself — what matters is *which kind* of dependency changed. A pure-JS package rewrites the lockfile and still ships over the air, because its code ends up inside the Metro bundle. A package with a native module also rewrites the lockfile, but has to be compiled in, so it needs a build. The `npm dedupe` that resolved the duplicate `expo-font` here touched only the lockfile, yet concerned a native module — that is a build-level change, not an update-level one.

This is exactly what the `fingerprint` runtime version policy guards against: it hashes the native inputs, so a native change yields a new `runtimeVersion`, and updates published against it are simply never offered to older binaries — instead of being delivered and crashing on launch.

The app checks for updates automatically on launch (`checkAutomatically` defaults to `ON_LOAD`) and applies them on the next start. The **Update** button at the bottom of the quiz selection screen forces a manual check — it shows "No update available" when there is nothing, or a spinner with "Updating" before restarting the app once the update is downloaded.
