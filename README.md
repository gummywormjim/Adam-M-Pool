# HabitVault

> **HabitVault** — A privacy-focused, 100% local-first addiction recovery and financial tracker.

HabitVault provides private habit recovery and financial impact tracking. With encrypted local storage, compassionate slip check-ins, unit cost calculations, and custom sober streak tracking, HabitVault puts control and recovery entirely in your hands.

---

## Key Features

- **Compassionate Slip Tracking**: When logging an impulse or unit spend, choose between *"It was just a slip, keep my sober date"* and *"Reset sober date to today"*.
- **Unit Cost & Peak Spending Baseline**:
  - **Unit Cost**: Input the price of an individual pack, can, or bottle (e.g. \$12.50/pack).
  - **Cost Baseline**: Record what you spent at the height of your habit to track true savings.
- **Top Quick Actions**: `+1 Unit` and `+Log` action buttons placed cleanly above each tracked substance for mobile alignment.
- **First-Time Skippable Onboarding Tutorial**: Guides new users through logging spending, peak baseline vs. unit costs, and streak tracking. Default substance starts with Cigarettes and a 0-day clean streak.
- **100% Local-First & Encrypted**: Web Crypto AES-GCM local encrypted storage with biometric/PIN unlock and optional Google Drive encrypted backup.

---

## Project Structure

This repository is dual-configured for both the Web application and Flutter/Dart:

```
├── src/                      # React + TypeScript + Vite web application
│   ├── components/           # UI components (SubstanceCard, Modals, Tutorial, etc.)
│   ├── db/                   # Encrypted local SQLite storage service
│   ├── types/                # TypeScript interfaces & domain models
│   └── App.tsx               # Main web application entry point
├── lib/                      # Flutter & Dart application
│   ├── models/               # Substance and ExpenseLog Dart models
│   ├── widgets/              # Flutter widgets (SubstanceCard, SlipDialog, Tutorial)
│   └── main.dart             # Flutter main entry point
├── .vscode/                  # Pre-configured launch, settings, and extension configs
├── pubspec.yaml              # Flutter dependencies and project configuration
├── package.json              # Web dependencies and build scripts
└── vite.config.ts            # Vite configuration
```

---

## Getting Started

### Web Application (React + TypeScript)

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start development server**:
   ```bash
   npm run dev
   ```
3. **Build production bundle**:
   ```bash
   npm run build
   ```

### Mobile / Flutter Application (VS Code & Flutter)

1. Open the project folder in **VS Code** with the **Dart** and **Flutter** extensions installed.
2. Fetch dependencies:
   ```bash
   flutter pub get
   ```
3. Run the app:
   ```bash
   flutter run
   ```
   Or press **F5** in VS Code to start debugging via `.vscode/launch.json`.

---

## License

MIT
