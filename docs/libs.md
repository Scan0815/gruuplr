# Libraries Documentation

## Overview
The libraries contain reusable code modules that are used by different parts of the application.

## Structure
```
libs/
├── utilities/     # General utility functions
├── schemas/       # GraphQL schema definitions
└── dtos/         # Data Transfer Objects
```

## Utilities
Contains general utility functions and helpers used throughout the application.

## Schemas
Contains the GraphQL schema definitions and types used for API communication.

## DTOs
Contains the Data Transfer Objects used for data transfer between client and server.

## Usage
The libraries are configured as internal dependencies and can be imported in the apps as follows:

```typescript
import { SomeUtil } from '@gruuplr/utilities';
import { SomeSchema } from '@gruuplr/schemas';
import { SomeDto } from '@gruuplr/dtos';
```

## Development
- New libraries should be created in this directory
- Each library should have its own tests
- Libraries should be independent of each other 