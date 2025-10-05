<div align="center">
<img src="https://www.google.com/search?q=https://placehold.co/1200x300/6366F1/FFFFFF%3Ftext%3DSaathi%26font%3Dpacifico" alt="Saathi Project Banner">







<h1>Saathi: Your Digital Companion for a Calmer Home</h1>
<p>
<strong>A private, empathetic AI assistant designed to ease the mental load of household management.</strong>
</p>
<p>
Built for the <strong>FutureStack GenAI Hackathon 2025</strong>.
</p>

</div>

The "Why": A Partner in the Home
This project is born from a desire to provide meaningful, practical support for a loved one experiencing memory challenges. It's more than just an app; it's a dedicated digital companion designed to ease the mental burden of managing daily household tasks, restoring a sense of calm and independence.

The core mission is to create a seamless, intuitive tool that feels less like technology and more like a helpful partner in the home. Saathi is built with privacy and empathy at its heart, ensuring that the user's personal space remains their own.

Core Features
Saathi is architected to be a single, intelligent hub for managing the home, with features that work together to provide a seamless experience.

- Multilingual Voice-First Interface: Designed for natural interaction, it allows users to add chores and reminders simply by speaking in their preferred language, such as Hindi or English (e.g., "Mujhe 2 kilo doodh lena hai").

- Intelligent Chore Management: The system uses a powerful AI to understand conversational language, automatically identifying the task, relevant items, and any specified times. It then organizes these into a structured to-do list with automated reminders.

- Smart Pantry System: The application intelligently tracks grocery items mentioned in chores. When a task like "buy 2 kgs of milk" is added, the virtual pantry is automatically updated, creating an always-current inventory of household supplies.

- AI-Powered Recipe Suggestions: To help answer the daily question of "what to cook?", the assistant can generate creative and simple recipe ideas based on the ingredients currently available in the smart pantry, reducing decision fatigue and inspiring new meal options.

## Tech Stack

Saathi is built with a modern, full-stack architecture that prioritizes privacy, speed, and a great user experience.

| Category           | Technology                                                                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) |
| **AI Engine** | ![Ollama](https://img.shields.io/badge/-Ollama-000000?logo=ollama&logoColor=white) ![Cerebras](https://img.shields.io/badge/-Cerebras-FF4F00?logo=cerebras&logoColor=white)                                                                                                                               |
| **State Management** | ![React Context](https://img.shields.io/badge/-React_Context-61DAFB?logo=react&logoColor=white)                                                                                                                                                                                                   |
| **UI Components** | ![Lucide React](https://img.shields.io/badge/-Lucide_React-1A1A1A?logo=lucide&logoColor=white)                                                                                                                                                                                                              |

## Getting Started

To run Saathi locally, you will need three separate terminals.

### Prerequisites

* Node.js (v18+)
* Python (v3.9+)
* Ollama installed and running

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/saathi.git](https://github.com/your-username/saathi.git)
    cd saathi
    ```

2.  **Terminal 1: Run the AI Brain (Ollama)**
    ```bash
    ollama run llama3:8b
    ```

3.  **Terminal 2: Run the Backend Server**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python app.py
    ```

4.  **Terminal 3: Run the Frontend Application**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open the `localhost` URL provided by Vite in your browser.

## Future Vision

This hackathon prototype is just the beginning. The vision for Saathi is to evolve into an even more proactive and empathetic companion.

* **Proactive Assistance:** The AI will learn routines and proactively suggest tasks (e.g., "It's Wednesday, time to water the plants.").
* **Deeper Personalization:** Saathi will learn the family's favorite meals and dietary preferences to offer even better recipe suggestions.
* **WhatsApp Integration:** Exploring a secure, official integration to make the assistant accessible from anywhere.
* **Appointment & Medication Reminders:** Expanding beyond chores to manage critical health-related reminders.

---

<div align="center">
  <p>Thank you for checking out Saathi.</p>
</div>
