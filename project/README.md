# Mom's Assistant - Multilingual Voice Assistant

A caring companion application designed to help manage daily tasks, reminders, and pantry inventory through voice commands. Built with modern technologies and designed with love for ease of use.

## Features

### 1. Voice-Powered Task Management
- **Multilingual Support**: Supports both Hindi and English voice commands
- **Natural Language Processing**: Understands natural speech patterns
- **AI-Powered**: Integrates with Cerebras API for intelligent command processing

### 2. Smart Reminders
- Create reminders using voice commands
- Time-based notifications (15 min, 5 min, and at due time)
- Priority levels (High, Medium, Low)
- Multiple reminder types (Task, Appointment, Shopping, Other)
- Automatic overdue detection with visual alerts

### 3. Smart Pantry Management
- Track available items with quantities and units
- Category-based organization
- Expiry date tracking with alerts
- Low stock warnings
- Quick search and filtering

### 4. AI Recipe Suggestions
- Generate recipe ideas based on available pantry items
- Meal-type specific suggestions (Breakfast, Lunch, Dinner, Snack)
- Save favorite recipes
- Detailed ingredients and cooking instructions

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: Cerebras API with Meta Llama models
- **Voice Recognition**: Web Speech API
- **Build Tool**: Vite
- **State Management**: React Context API
- **Storage**: LocalStorage (ready for Supabase integration)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with Speech Recognition support (Chrome, Edge recommended)
- Cerebras API key (optional, for enhanced AI features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the provided local URL

### Configuration

#### Cerebras API (Optional but Recommended)

For enhanced AI processing and recipe suggestions:

1. Get your API key from [Cerebras Cloud](https://cloud.cerebras.ai/)
2. Enter the API key in the app when prompted
3. The app will use AI for better command understanding and recipe generation

## Usage Guide

### First Time Setup

1. Enter your name and select preferred language (Hindi/English)
2. Grant microphone and notification permissions when prompted

### Voice Commands

#### Adding Reminders
- "Mujhe 2 kilo doodh lena hai" (I need to buy 2 kg milk)
- "Mujhe shaam ko 6 baje doctor ke pass jaana hai" (I need to visit doctor at 6 PM)
- "Remind me to call bhai tomorrow"

#### Adding Pantry Items
- "2 kilo doodh" (2 kg milk)
- "1 liter oil"
- Or use the manual form in the Pantry tab

#### Recipe Suggestions
- Navigate to Recipes tab
- Click "Generate Recipes"
- Select meal type (optional)
- AI will suggest recipes based on your pantry items

### Navigation

- **Home**: Voice assistant and quick access cards
- **Reminders**: View and manage all reminders
- **Pantry**: Manage pantry inventory
- **Recipes**: View and generate recipe suggestions

## Features in Detail

### Reminder System
- Automatic time parsing from voice input
- Smart notification scheduling
- Visual priority indicators
- Completion tracking
- Search and filter options

### Pantry Management
- Add items manually or via voice
- Track expiry dates
- Set low stock thresholds
- Category-based organization
- Quick search functionality

### Recipe Generation
- Uses available pantry items
- AI-powered suggestions via Cerebras
- Multilingual recipe names
- Detailed ingredient lists
- Step-by-step instructions
- Favorite recipes feature

## Browser Compatibility

- **Recommended**: Chrome, Microsoft Edge
- **Voice Input**: Requires Web Speech API support
- **Notifications**: Requires Notification API support

## Future Enhancements

- Database integration with Supabase
- User authentication
- Cloud sync across devices
- Shopping list generation
- Meal planning calendar
- Recipe photo uploads
- Voice feedback responses
- Docker MCP Gateway integration

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginView.tsx
│   ├── VoiceInput.tsx
│   ├── VoiceAssistant.tsx
│   ├── RemindersView.tsx
│   ├── PantryView.tsx
│   └── RecipesView.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── hooks/              # Custom React hooks
│   ├── useVoiceInput.ts
│   └── useNotifications.ts
├── lib/                # Utilities and services
│   ├── storage.ts
│   ├── aiService.ts
│   └── dateUtils.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Development

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Contributing

This is a personal project built with love for family. Contributions and suggestions are welcome!

## License

MIT

## Acknowledgments

- Built with love for Mom ❤️
- Powered by Cerebras AI and Meta Llama
- Icons by Lucide
- UI components with Tailwind CSS

---

Made with ❤️ for managing daily tasks and caring for loved ones.
