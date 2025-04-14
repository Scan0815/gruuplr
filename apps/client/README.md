# Gruuplr Client

A StencilJS-based web application with Ionic components that provides a secure, real-time group collaboration platform.

## Features

### User Interface
- Modern, responsive design using Ionic components
- Progressive Web App (PWA) support
- Cross-platform compatibility
- Offline-first architecture

### Core Features
- User authentication and account management
- Group creation and management
- Real-time messaging and collaboration
- End-to-end encryption for secure communication
- Invitation system for group joining

### Data Management
- Local database using Dexie (IndexedDB)
- Real-time data synchronization
- Encrypted data storage
- Offline data persistence

## Architecture

### Core Technologies
- StencilJS for web components
- Ionic for UI components
- GraphQL for API communication
- WebSocket for real-time updates
- Web Crypto API for encryption

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── app-root/       # Main application component
│   ├── groups/         # Group-related components
│   ├── users/          # User-related components
│   ├── chats/          # Chat components
│   └── pages/          # Page components
├── features/           # Feature modules
│   ├── account/        # Account management
│   ├── groups/         # Group functionality
│   ├── messages/       # Messaging system
│   ├── replication/    # Data synchronization
│   ├── web-crypto/     # Encryption handling
│   └── keystore/       # Key management
├── db/                 # Database configuration
├── graphql/            # GraphQL queries and mutations
├── guards/             # Route guards
├── utilities/          # Helper functions
└── generated/          # Generated GraphQL types
```

## Setup

### Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn
- NX workspace tools

### Installation
```bash
# Install dependencies
npm install

# Build the application
nx build client

# Start development server
nx serve client
```

### Development
```bash
# Generate GraphQL types
nx run client:codegen

# Run tests
nx test client

# Build for production
nx build client --prod
```

## Features in Detail

### Authentication
- JWT-based authentication
- Secure token storage
- Automatic token refresh
- Protected routes

### Group Management
- Create and join groups
- Manage group members
- Role-based permissions
- Invitation system

### Real-time Communication
- WebSocket-based messaging
- Presence indicators
- Message encryption
- Offline message queueing

### Data Security
- End-to-end encryption
- Secure key storage
- Encrypted local storage
- Secure key exchange

### Offline Support
- Local data persistence
- Background sync
- Conflict resolution
- Queue management

## State Management
- Local state using StencilJS
- Persistent storage with IndexedDB
- Real-time updates via WebSocket
- Encrypted state management

## Components

### Pages
- Login/Register
- Group Dashboard
- Chat Interface
- User Profile
- Settings

### Reusable Components
- Group List
- User List
- Chat Window
- Invitation Manager
- Encryption Status

## Security Features

- End-to-end encryption
- Secure key storage
- Protected routes
- XSS prevention
- CSRF protection

## Performance Optimization

- Lazy loading
- Component preloading
- Asset optimization
- Cache management
- Service Worker integration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 