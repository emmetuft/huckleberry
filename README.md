# Huckleberry AI

A React-based AI application for data management, automation, and intelligent workflows built on the Domo platform.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Key Features](#key-features)
- [Available Scripts](#available-scripts)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)

## Overview

Huckleberry AI is a sophisticated data management and automation platform that provides:

- **Data Hub**: Monitor data sources, providers, and usage trends
- **Data Health**: Track data quality metrics and health trends
- **Ontology Management**: Visualize and manage data relationships with interactive force graphs
- **Automation**: Create rule-based automations with conditions and actions
- **Workflow Builder**: Design visual workflows with a drag-and-drop canvas
- **AI-Powered Chat**: Interact with your data using natural language
- **Persona Management**: Configure custom AI personas with specific settings and accounts

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- Yarn package manager
- Domo Developer Account (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd huckleberry
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

### Running the Application

Start the development server:

```bash
yarn start
```

The application will run at `http://localhost:3000` (or the next available port).

## Project Structure

```
huckleberry/
src/
  components/       # React components
    App/            # Main application component
    Automation/     # Automation rule builder
    Background/     # Background component
    Chat/           # AI chat interface
    DataHealth/     # Data quality monitoring
    DataHub/        # Data source management
    FlowCanvas/     # Visual workflow builder
    Heading/        # Top component
    IconBtn/        # Shared component for button with icon
    IntentInput/    # Main AI-powered input box
    Nav/            # Side navigation component
    Ontology/       # Data relationship visualization
    PersonaModal/   # AI persona configuration
    RecCard/        # Shared card component for recommended items
    Resources/      # Shared component for resource list
    Workspace/      # Default page content
  constants/        # Application constants and configurations
  hooks/            # Custom React hooks
  models/           # TypeScript interfaces and enums
    enums/          # Enumeration types
    interfaces/     # TypeScript interfaces
  reducers/         # Redux state management
    app/            # Application state
    ontology/       # Ontology state
  services/         # API and service layer
  styles/           # SCSS files for styling
  utils/            # Utility functions
  main.tsx          # Application entry point
package.json
vite.config.ts
README.md
```

## Development

### Code Quality

This project uses automated code quality checks:

- **Prettier**: Code formatting
- **ESLint**: Linting
- **Vitest**: Unit testing
- **Husky**: Git hooks for pre-commit checks

### Making Changes

1. Create a new branch for your feature:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure they pass checks:

   ```bash
   yarn run-checks
   ```

3. Commit your changes:

   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. Push and create a pull request

## Key Features

### Navigation

The application includes five main pages:

1. **Home/Workspace**: Main workspace with AI chat interface
2. **Data Hub**: Monitor data sources and providers
3. **Data Health**: Track data quality metrics
4. **Ontology**: Visualize data relationships
5. **Automation**: Create and manage automation rules
6. **Workflow**: Design visual workflows

### Persona Management

Configure AI personas with:

- Custom settings and parameters
- Connected accounts and data sources
- Personalized behavior and responses

### Data Visualization

- Interactive force graphs for ontology visualization
- Trend charts for data health monitoring
- Usage analytics for data sources
- Recent runs and execution history

## Technology Stack

### Core

- **React 18** - Framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Vite** - Build tool and dev server

### UI Components

- **Ant Design** - Component library
- **Framer Motion** - Animations
- **XY Flow (React Flow)** - Visual workflow canvas
- **Recharts** - Charts and visualizations
- **D3.js** - Advanced visualizations
- **Phosphor Icons** - Icon library

### Domo Platform

- **@domoinc/toolkit** - Domo platform integration
- **@appteam6/domoapps.js** - Domo apps framework
- **ryuu.js** - Domo data API client

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Storybook** - Component documentation
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks

## Contributing

### Code Style

- Follow the existing code style and patterns
- Use TypeScript for all new files
- Write unit tests for new functionality
- Document complex logic with comments
- Keep components focused and reusable

### Component Organization

- Create new components using the `da generate component` command
- Export interfaces from `src/models/interfaces/`
- Export enums from `src/models/enums/`

### State Management

- Use Redux Toolkit for global state
- Create new reducers using the `da generate reducer` command
- Keep business logic in services (`src/services/`)

### Testing

Write tests for:

- Utility functions
- Redux reducers and actions
- Complex business logic
- Critical user flows

Run tests:

```bash
yarn test          # Watch mode
yarn test:ci       # Single run
```

## Deployment

### Domo Platform

Deploy to Domo:

```bash
yarn upload
```

This will:

1. Run all code quality checks
2. Apply the Domo manifest
3. Build the application
4. Publish to your Domo instance

## Support

For issues or questions:

- Check existing documentation
- Review component code in `src/components/`
- Consult Domo platform documentation

---

Built with da using React, TypeScript, and the Domo Platform
