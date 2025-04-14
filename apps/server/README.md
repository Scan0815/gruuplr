# Gruuplr Server

A NestJS-based backend server that provides GraphQL API for group management and real-time data replication.

## Features

### Authentication
- JWT-based authentication
- User registration and login
- Token refresh mechanism

### Group Management
- Create and manage groups
- Group membership management
- Role-based access control (admin, member)
- Group invitations system

### Real-time Data Replication
- Synchronization of data across group members
- Support for encrypted data (keystore)
- Timestamp-based data synchronization
- Binary data handling for encryption keys

## Architecture

### Core Modules

#### Auth Module
- Handles user authentication and authorization
- JWT token management
- User registration and login

#### Groups Module
- Group CRUD operations
- Member management
- Invitation system
- Role-based permissions

#### Replication Module
- Real-time data synchronization
- Handles encrypted data
- Manages group-based data access
- WebSocket-based communication

### Database
- MongoDB with Mongoose ODM
- Schemas for Users, Groups, GroupMembers, and ReplicationRecords

## Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- NX workspace tools

### Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gruuplr
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Installation
```bash
# Install dependencies
npm install

# Build the application
nx build server

# Start the development server
nx serve server
```

### Development
```bash
# Generate GraphQL schema
nx run server:codegen

# Run tests
nx test server

# Run e2e tests
nx e2e server
```

## API Documentation

### GraphQL Endpoints

#### Authentication
```graphql
mutation Register($input: CreateUserInput!) {
  register(input: $input) {
    token
    refreshToken
    user { id username email }
  }
}

mutation Login($input: LoginUserInput!) {
  login(input: $input) {
    token
    refreshToken
    user { id username email }
  }
}
```

#### Groups
```graphql
mutation CreateGroup($input: CreateGroupInput!) {
  createGroup(input: $input) {
    id
    name
    description
  }
}

query GetGroups {
  getGroups {
    id
    name
    description
  }
}

query GetGroupMembers($groupId: String!) {
  getGroupMembers(groupId: $groupId) {
    id
    userId
    role
    isActive
  }
}
```

## Security

- JWT-based authentication
- Role-based access control
- Encrypted data handling
- WebSocket security with JWT verification

## Data Models

### User
- id: ObjectId
- username: string
- email: string
- password: string (hashed)
- role: string

### Group
- id: ObjectId
- name: string
- description: string
- createdAt: Date
- updatedAt: Date

### GroupMember
- id: ObjectId
- userId: ObjectId
- groupId: ObjectId
- role: string (admin/member)
- isActive: boolean
- createdAt: Date
- updatedAt: Date

### ReplicationRecord
- id: ObjectId
- userId: ObjectId
- groupId: ObjectId
- tableName: string
- data: object
- createdAt: Date

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 