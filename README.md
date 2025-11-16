# Blockchain Credential Hub

A modern web application for managing blockchain-verified credentials, connecting with employers, and building professional identity on Web3.

## Features

- 🔐 **Secure Verification**: Blockchain-powered credential verification
- ⚡ **Instant Verification**: Real-time verification by employers and institutions
- 🏆 **Build Reputation**: Create your verified professional identity on Web3
- 👤 **Multi-role Support**: Student, Employer, and Institution dashboards
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 🤖 **AI Resume Parsing**: Automatically extract and fill profile information from uploaded resumes using AI
- 🔗 **Gemini Wallet Integration**: Seamless connection with Gemini Wallet for Web3 authentication

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **Sonner** for toast notifications

### Backend
- **Express.js** for REST API
- **Multer** for file upload handling
- **CORS** for cross-origin requests

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API Key (optional, for AI resume parsing)

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

3. Set up environment variables (optional for AI resume parsing):
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   - Get your API key from: https://platform.openai.com/api-keys
   - Note: Without the API key, resume parsing will use fallback regex-based extraction

4. Start the backend server:
```bash
cd server
npm run dev
```

The backend will run on `http://localhost:3001`

5. In a new terminal, start the frontend development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `build` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Custom components
├── pages/           # Page components
├── styles/          # Global styles
└── ...
```

## Available Pages

- **Landing Page**: Welcome screen with feature overview
- **Wallet Connect**: Connect your Web3 wallet
- **Profile Setup**: Set up your user profile
- **User Dashboard**: Main user dashboard
- **Employer Login**: Employer authentication
- **Employer Dashboard**: Employer management interface
- **Institution Dashboard**: Institution management interface
- **ID Verification**: Identity verification page

## Development

The project uses:
- TypeScript for type safety
- Vite for fast HMR (Hot Module Replacement)
- ESLint and TypeScript for code quality

## License

Private - All rights reserved
