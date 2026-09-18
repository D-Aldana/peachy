# Peachy

A mobile-first workout logger for lifters who want to record sets, reps, and weight between sets without friction. Open the app, add an exercise by name, log sets as you go, and see whether you're trending up or down against your own history. No account, no setup, no coach.

> **Status:** MVP in progress. See the [PRD](docs/PRD.md) for scope.

## Features

- **Fast logging:** start a workout, add exercises by free-text name, and log reps × weight with steppers
- **Exercise memory:** previously used exercise names autocomplete, most recent first
- **Progress badges:** each exercise is compared to your last completed session and marked up, even, down, or "first time"
- **Weekly summary:** workouts, total sets, total volume, and per-exercise trends for the current week
- **lb/kg toggle:** weights are stored in kg and converted only for display
- **Local-only:** data stays on the device, with no login or sync

## Tech stack

- [Expo](https://docs.expo.dev/versions/v57.0.0/) SDK 57
- React Native 0.86 / React 19
- [Expo Router](https://docs.expo.dev/router/introduction/) for navigation
- `expo-sqlite/kv-store` for on-device persistence
- TypeScript

## Getting started

```sh
npm install
npm start
```

Then press `i` for iOS, `a` for Android, or `w` for web, or run one directly:

```sh
npm run ios
npm run android
npm run web
```

## Project structure

```
src/app/          Screens (Expo Router): home, active workout, weekly summary
src/components/   Shared UI: buttons, steppers, trend badges, exercise card
src/lib/          State reducer, local persistence, progress and weekly logic
src/theme.ts      Colors, fonts, and badge styles
app.json          Expo config
assets/           Icons and splash images
docs/PRD.md       Product requirements
```

## License

[MIT](LICENSE)
