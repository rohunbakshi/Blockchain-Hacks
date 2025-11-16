# Blockchain Credential Hub

A modern web application for managing blockchain-verified credentials, connecting with employers, and building professional identity on Web3.

## Features

- 🔐 **Secure Verification**: Blockchain-powered credential verification
- ⚡ **Instant Verification**: Real-time verification by employers and institutions
- 🏆 **Build Reputation**: Create your verified professional identity on Web3
- 👤 **Multi-role Support**: Student, Employer, and Institution dashboards
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **Sonner** for toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
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
