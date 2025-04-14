# Server Documentation

## Overview
The server is a NestJS-based GraphQL API that serves as the backend for the Gruuplr application.

## Technology Stack
- NestJS
- GraphQL
- Mongoose
- MongoDB

## Project Structure
```
apps/server/
├── src/
│   ├── modules/         # Feature modules
│   ├── core/           # Core functionality
│   └── shared/         # Shared resources
```

## Database
The application uses MongoDB as the database with Mongoose as the ODM (Object Document Mapper). Mongoose schemas define the data structure and validation rules.

## API Endpoints
The API is accessible via GraphQL. The schema definition is located in `schema.graphql`.

## Configuration
Server configuration is handled through environment variables in the `.env` file. Important configuration variables are:
- `MONGODB_URI`: The connection URL for the MongoDB database
- `PORT`: The port on which the server runs

## Development
1. Install dependencies: `npm install`
2. Ensure MongoDB is running
3. Start the server: `npm run start:dev`

## Testing
- Unit Tests: `npm run test`
- E2E Tests: `npm run test:e2e` 