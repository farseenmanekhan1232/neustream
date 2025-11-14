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
