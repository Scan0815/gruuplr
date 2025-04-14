# Gruuplr Documentation

## Project Overview
Gruuplr is a modern web application managed as a monorepo using Nx. The project consists of a NestJS-based GraphQL server and a StencilJS/Ionic-based client.

## Project Structure
```
gruuplr/
├── apps/
│   ├── client/         # Frontend application
│   ├── server/         # Backend API
│   └── server-e2e/     # E2E tests for the server
├── libs/
│   ├── utilities/      # Reusable utilities
│   ├── schemas/        # GraphQL schemas
│   └── dtos/          # Data Transfer Objects
└── docs/              # Project documentation
```

## Technology Stack
- **Build System**: Nx
- **Backend**: NestJS, GraphQL, Mongoose, MongoDB
- **Frontend**: StencilJS, Ionic, TypeScript
- **Testing**: Jest

## Documentation
- [Server Documentation](server.md)
- [Client Documentation](client.md)
- [Libraries Documentation](libs.md)

## Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run start:dev`

## Build
- Development Build: `npm run build`
- Production Build: `npm run build:prod`

## Testing
- Unit Tests: `npm run test`
- E2E Tests: `npm run test:e2e`

## Configuration
The application uses environment variables for configuration. A `.env` file must be created in the root directory. 