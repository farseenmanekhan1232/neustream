#!/bin/bash

# TypeScript Conversion Script
# This script helps convert JavaScript files to TypeScript
# Run from the control-plane directory: ./scripts/convert-to-typescript.sh

echo "=== TypeScript Conversion Script ==="
echo "This script will help convert remaining JS files to TS"
echo ""

# Create a list of files to convert
files=(
  "config/oauth.js"
  "lib/websocket.js"
  "services/emailService.js"
  "services/paymentService.js"
  "services/subscriptionService.js"
  "services/posthog.js"
  "routes/auth.js"
  "routes/streams.js"
  "server.js"
)

echo "Files to convert:"
for file in "${files[@]}"; do
  echo "  - $file"
done

echo ""
echo "Creating .d.ts shim files for backward compatibility..."

# Create a shim file to allow importing .js files as .ts
cat > types/js-compat.d.ts << 'EOF'
// Compatibility shims for JavaScript imports in TypeScript
// This allows TypeScript to resolve .js files during migration

declare module '*.js' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}
EOF

echo "✅ Created compatibility shim at types/js-compat.d.ts"
echo ""
echo "Next steps:"
echo "1. Install TypeScript dependencies: npm install"
echo "2. Run type checking: npm run typecheck"
echo "3. Build the project: npm run build"
echo ""
echo "For manual conversion of each file:"
echo "  1. Read the .js file"
echo "  2. Add TypeScript types"
echo "  3. Save as .ts"
echo "  4. Test compilation"
