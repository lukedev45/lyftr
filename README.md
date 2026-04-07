# Lyftr<span style="color: #ffb94fff">.</span> (WIP!!!)

**Lyftr** is a premium, minimalist strength tracking application designed specifically for athletes following the **Starting Strength** protocol. Focus on your lifts, and let Lyftr handle the math, the rest, and the coaching.

## ✨ Features

### 🏋️ Starting Strength Protocol

- **Automatic Rotation**: Seamlessly switches between Workout A (Squat, Press, Deadlift) and Workout B (Squat, Bench, Deadlift).
- **Work Weight Management**: Automatically tracks and increments your weights per session.

### 🧮 Intelligent Calculations

- **Warmup Calculator**: Generates precise warmup sets based on your work weight (supports both **Metric** and **Imperial**).
- **RPE-Adjusted Rest Timers**: Suggests optimal rest periods based on your reported Rate of Perceived Exertion (RPE).
- **Plate Rounding**: Built-in rounding for standard 2.5kg or 5lb increments.

### ☁️ Supabase Cloud Sync

- **Authentication**: Secure login via email or magic links.
- **Cloud Storage**: Your workout history and personal bests are synced across all your devices.
- **Offline Fallback**: Seamless local storage support if you're training in a basement gym with no signal.

### 🧠 Modern Experience

- **Premium Aesthetics**: Vibrant dark mode with glassmorphism, subtle animations, and a high-contrast light mode.
- **AI Coach**: Get insights into your progress, volume, and fatigue management.
- **Activity Graph**: Visualize your consistency with a GitHub-style heatmap.
- **PWA Ready**: Installable on iOS and Android for a native app feel.

## 🚀 Tech Stack

- **Core**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) (AI Coaching Insights)
- **Styling**: Vanilla CSS (CSS Variables, HSL color system)
- **Deployment**: [Vercel](https://vercel.com/) (Edge Functions)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- A Supabase project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lyftr.git
   cd lyftr
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📱 Mobile Setup

Lyftr is optimized for mobile. For the best experience:

1. Open the app in Safari (iOS) or Chrome (Android).
2. Tap "Share" or "Menu".
3. Select **"Add to Home Screen"**.

---
