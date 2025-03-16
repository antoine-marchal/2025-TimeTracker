# Time Tracker

<div align="center">

![Time Tracker Logo](https://img.shields.io/badge/Time-Tracker-purple?style=for-the-badge&logo=clock)

[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-blue?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A modern, feature-rich time tracking application to boost your productivity and maintain a healthy work-break balance.

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Technical Architecture](#-technical-architecture)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 Overview

Time Tracker is a comprehensive productivity tool designed to help you manage your work sessions and breaks effectively. Based on time management techniques like the Pomodoro Technique, it allows you to track your work sessions, take structured breaks, and analyze your productivity patterns over time.

The application provides a clean, intuitive interface with both light and dark modes, customizable timer durations, and detailed statistics to help you understand and improve your work habits.

## ✨ Features

### Core Functionality

- **Work Session Tracking**: Start, pause, stop, and reset work sessions
- **Break Management**: Take short or long breaks between work sessions
- **Session Notes**: Add notes to your work sessions to track what you accomplished
- **Automatic Transitions**: Optionally auto-start breaks after work sessions and vice versa

### Statistics and Analysis

- **Comprehensive Statistics**: View detailed stats about your work and break patterns
- **Time Range Filtering**: Filter statistics by today, week, month, or all time
- **Productivity Score**: Get insights into your work-break balance with a productivity score
- **Daily Breakdown**: See your most productive days and detailed session information
- **Data Export**: Export your time tracking data to CSV for external analysis

### Customization

- **Customizable Durations**: Set your preferred work and break durations
- **Dark/Light Mode**: Choose between dark and light themes based on your preference
- **Notification Support**: Receive notifications when sessions end
- **Persistent Settings**: Your settings and time entries are saved locally

## 📸 Screenshots

<div align="center">

### Timer View (Dark Mode)
![Timer Dark Mode](https://raw.githubusercontent.com/antoine-marchal/2025-TimeTracker/refs/heads/main/screenshots/%7B32BF0B1C-6FC2-409A-80E2-BF6303CF7C3E%7D.png)

### Statistics View (Light Mode)
![Statistics Light Mode](https://raw.githubusercontent.com/antoine-marchal/2025-TimeTracker/refs/heads/main/screenshots/%7B307DE2C2-139F-45F0-A763-BD8A13AC9EB2%7D.png)

### Settings View
![Settings](https://raw.githubusercontent.com/antoine-marchal/2025-TimeTracker/refs/heads/main/screenshots/%7B3645041D-F197-4262-AA2C-8D75F4C1ACB1%7D.png)

</div>

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/antoine-marchal/2025-TimeTracker.git
   cd time-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Preview the production build
npm run preview
# or
yarn preview
```

## 🎮 Usage

### Timer Tab

1. **Start a Work Session**: Click the play button to start a work session
2. **Pause/Resume**: Click the pause button to pause a session, and the play button to resume
3. **Stop Session**: Click the stop button to end the current session and save it
4. **Reset Timer**: Click the reset button to clear the current session without saving
5. **Take a Break**: Click the "Take a Break" button to start a break session
6. **Add Notes**: Use the notes section to document what you're working on

### Statistics Tab

1. **View Time Range**: Select from today, week, month, or all time to filter your statistics
2. **Toggle Breaks**: Check "Show Breaks" to include break sessions in your statistics
3. **View Summary**: See your total work time, break time, and productivity score
4. **Session Details**: Expand individual sessions to see detailed information
5. **Export Data**: Click "Export CSV" to download your time tracking data
6. **Clear Data**: Use "Clear All" to reset your statistics (use with caution)

### Settings Tab

1. **Timer Durations**: Set your preferred work and break durations in minutes
2. **Automation**: Configure auto-start options for breaks and work sessions
3. **Notifications**: Enable or disable browser notifications when sessions end
4. **Save Settings**: Click "Save Settings" to apply your changes

## ⚙️ Configuration

### Timer Settings

- **Work Session Duration**: Default is 25 minutes (1500 seconds)
- **Break Duration**: Default is 5 minutes (300 seconds)

### Automation Options

- **Auto-start Breaks**: Automatically start a break when a work session ends
- **Auto-start Work**: Automatically start a work session when a break ends

### Notification Settings

- **Browser Notifications**: Enable to receive notifications when sessions end

### Theme Settings

- **Dark Mode**: Toggle between dark and light themes
- **System Default**: Initially uses your system's color scheme preference

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Storage**: Browser's localStorage for persistent data
- **Icons**: Lucide React
- **File Export**: File-Saver
- **Unique IDs**: UUID

### Component Structure

- **App**: Main application component managing state and routing
- **Timer**: Handles timer functionality and session management
- **Statistics**: Displays and analyzes time tracking data
- **Settings**: Manages user preferences and configuration

### Data Models

- **TimeEntry**: Represents a work or break session
- **AppSettings**: Stores user preferences and configuration
- **DailyStats**: Aggregated statistics for a single day
- **WeeklyStats**: Aggregated statistics for a week

### Data Flow

1. User interactions trigger state changes in the App component
2. State is passed down to child components as props
3. Child components emit events back to the App component
4. App component updates state and persists changes to localStorage
5. UI updates reflect the new state

## 👥 Contributing

Contributions are welcome! Here's how you can contribute to the project:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clean, maintainable, and testable code
- Update documentation as needed
- Add comments for complex logic
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [ant1mcl](https://github.com/ant1mcl)

</div>