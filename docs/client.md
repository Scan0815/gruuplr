# Client Documentation

## Overview
The client is a modern web application developed with StencilJS and Ionic.

## Technology Stack
- StencilJS
- Ionic
- TypeScript
- GraphQL Client
- DexieJS (IndexedDB wrapper)

## Project Structure
```
apps/client/
├── src/
│   ├── components/     # StencilJS components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── db/           # DexieJS database configuration
│   └── utils/         # Utility functions
```

## Features
- Responsive Design
- Progressive Web App (PWA)
- Offline Capability
  - Local data persistence using IndexedDB via DexieJS
  - Data synchronization with backend
- GraphQL Integration

## Local Database
The application uses DexieJS as a wrapper for IndexedDB to provide:
- Type-safe database operations
- Promise-based API
- Indexed queries
- Offline data storage
- Data synchronization capabilities

For detailed information about the local database implementation, including schemas, operations, and best practices, see [Local Database Documentation](local-db.md).

## Development
1. Install dependencies: `npm install`
2. Start development server: `npm run start`

## Build
- Development Build: `npm run build`
- Production Build: `npm run build:prod`

## Testing
- Unit Tests: `npm run test`
- E2E Tests: `npm run test:e2e` 