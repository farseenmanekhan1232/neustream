# TypeScript Conversion Guide

## Completed Conversions ✅

The following files have been successfully converted to TypeScript:

### Core Infrastructure
- ✅ `lib/database.ts` - Database connection and query management
- ✅ `config/oauth.ts` - OAuth configuration (Google & Twitch)
- ✅ `middleware/auth.ts` - Authentication middleware
- ✅ `types/entities.ts` - Database entity types
- ✅ `types/index.d.ts` - Global type declarations
- ✅ `types/js-compat.d.ts` - JavaScript compatibility shims
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `package.json` - Updated with TypeScript dependencies and scripts
- ✅ `.gitignore` - Updated for TypeScript build outputs

## Files Converted to TypeScript: 4/40 (10%)

## Remaining Conversions (36 files)

### 1. Lib (1 file)
- [ ] `lib/websocket.ts` - WebSocket server implementation

### 2. Middleware (3 files)
- [ ] `middleware/currencyMiddleware.ts` - Currency conversion middleware
- [ ] `middleware/idHandler.ts` - ID handler middleware
- [ ] `middleware/planValidation.ts` - Plan validation middleware

### 3. Services (11 files)
- [ ] `services/blogService.ts` - Blog service
- [ ] `services/chatConnectorService.ts` - Chat connector service
- [ ] `services/currencyService.ts` - Currency service
- [ ] `services/emailService.ts` - Email service
- [ ] `services/locationService.ts` - Location service
- [ ] `services/paymentService.ts` - Payment service
- [ ] `services/posthog.ts` - PostHog analytics service
- [ ] `services/sessionService.ts` - Session service
- [ ] `services/subscriptionCleanupService.ts` - Subscription cleanup service
- [ ] `services/subscriptionService.ts` - Subscription service
- [ ] `services/totpService.ts` - TOTP service
- [ ] `services/youtubeGrpcService.ts` - YouTube gRPC service

### 4. Routes (10 files)
- [ ] `routes/admin.ts` - Admin routes
- [ ] `routes/blog.ts` - Blog routes
- [ ] `routes/chat.ts` - Chat routes
- [ ] `routes/contact.ts` - Contact routes
- [ ] `routes/payments.ts` - Payment routes
- [ ] `routes/sources.ts` - Sources routes
- [ ] `routes/streaming.ts` - Streaming routes
- [ ] `routes/streams.ts` - Streams routes
- [ ] `routes/subscriptions.ts` - Subscriptions routes
- [ ] `routes/totp.ts` - TOTP routes

### 5. Main Entry Point
- [ ] `server.ts` - Main server file

### 6. Scripts (10 files)
- [ ] `scripts/run-migrations.ts` - Migration runner
- [ ] `scripts/migrate-subscriptions.ts` - Subscription migration
- [ ] `scripts/migrate-payments.ts` - Payment migration
- [ ] `scripts/run-blog-migration.ts` - Blog migration runner
- [ ] `scripts/create-blog-tables-simple.ts` - Create blog tables
- [ ] `scripts/seed-blog-content.ts` - Seed blog content
- [ ] `scripts/create-blog-analytics-table.ts` - Create blog analytics table
- [ ] `scripts/clear-blog-content.ts` - Clear blog content
- [ ] `scripts/create-quality-blog-content.ts` - Create quality blog content
- [ ] `scripts/create-quality-content-simple.ts` - Create quality content simple

### 7. Test Files (2 files)
- [ ] `test-chat-connector-plan.ts` - Chat connector test
- [ ] `test-email.ts` - Email test

## Conversion Patterns

### Common Patterns Used

1. **Class to TypeScript Class**
   ```javascript
   // Before
   class Database {
     constructor() { ... }
   }

   // After
   class Database {
     private pool: Pool;

     constructor() {
       this.pool = new Pool({ ... });
     }
   }
   ```

2. **Function Parameters with Types**
   ```javascript
   // Before
   async query(sql, params = []) { ... }

   // After
   async query<T = any>(sql: string, params: any[] = []): Promise<T[]> { ... }
   ```

3. **Import/Export Statements**
   ```javascript
   // Before
   const express = require("express");
   module.exports = router;

   // After
   import express from "express";
   export default router;
   ```

4. **Database Query Results**
   ```javascript
   // Before
   const users = await db.query("SELECT ...");

   // After
   const users = await db.query<User>("SELECT ...");
   ```

5. **Express Request/Response**
   ```javascript
   // Before
   router.get("/", async (req, res) => { ... });

   // After
   router.get("/", async (req: Request, res: Response) => { ... });
   ```

### Type Definitions

Use the existing entity types from `types/entities.ts`:

```typescript
import { User, SubscriptionPlan, StreamSource } from '../types/entities';
```

### Error Handling

Always use specific error types:

```typescript
try {
  // code
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    // handle token expired
  } else if (error instanceof Error) {
    // handle other errors
  }
}
```

## Conversion Steps for Each File

1. **Read the .js file**
2. **Add import statements** for TypeScript types
3. **Add type annotations** to:
   - Class properties
   - Function parameters
   - Function return types
   - Variable declarations
4. **Convert require() to import**
5. **Convert module.exports to export**
6. **Add interface/types** for complex objects
7. **Test compilation**: `npm run typecheck`
8. **Build**: `npm run build`

## Quick Conversion Commands

### Install TypeScript dependencies
```bash
cd /Users/farseen/Documents/projects/neustream/control-plane
npm install
```

### Type check all files
```bash
npm run typecheck
```

### Build the project
```bash
npm run build
```

### Watch mode for development
```bash
npm run build:watch
```

## Testing TypeScript Setup

1. Check if TypeScript is installed:
   ```bash
   npx tsc --version
   ```

2. Run type checking:
   ```bash
   npm run typecheck
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Check if dist folder is created with compiled files

## Important Notes

### Backward Compatibility
- Keep .js files alongside .ts files during migration
- Use the compatibility shims in `types/js-compat.d.ts`
- Update imports gradually

### Database Types
- Use generic type parameters for database queries
- Example: `db.query<User>(...)`

### Express Types
- Import types from 'express':
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  ```

### Environment Variables
- Use the types defined in `types/index.d.ts`
- All process.env variables are already typed

### Third-party Libraries
- Type definitions are already added to package.json
- Most popular libraries have @types packages included
- For custom types, create interfaces in types/entities.ts

## Benefits So Far

1. ✅ **Type Safety**: Core database and auth code now has compile-time type checking
2. ✅ **Better IDE Support**: Autocompletion and IntelliSense for core files
3. ✅ **Error Prevention**: Catch type errors before runtime
4. ✅ **Documentation**: Types serve as inline documentation
5. ✅ **Refactoring**: Safer to make changes to typed code

## Next Steps

1. Install dependencies: `npm install`
2. Run type check: `npm run typecheck`
3. Continue converting remaining 36 files following the patterns above
4. Test each conversion incrementally
5. Once all files are converted, remove .js files and update imports

## Estimated Time for Remaining Conversion

- **Per file**: 10-15 minutes (including testing)
- **Total estimated time**: 6-9 hours for all remaining files

## Support

If you encounter issues during conversion:
1. Check the TypeScript error messages
2. Refer to existing converted files for patterns
3. Use `npm run typecheck` to verify each conversion
4. Check `types/entities.ts` for database entity types
5. Review `types/index.d.ts` for global types
