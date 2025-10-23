import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Use 'node' for pure unit tests, 'happy-dom' for integration tests
    environment: 'happy-dom',
    include: ['tests/**/*.test.js'],
    environmentOptions: {
      happyDOM: {
        settings: {
          disableJavaScriptEvaluation: false,
          disableJavaScriptFileLoading: false,
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'public/**',
        'build/**',
        '*.config.js',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
