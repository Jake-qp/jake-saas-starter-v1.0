const rulesDirPlugin = require("eslint-plugin-rulesdir");
rulesDirPlugin.RULES_DIR = "eslint-rules";

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "next/core-web-vitals",
  ],
  plugins: ["rulesdir"],
  ignorePatterns: [
    ".eslintrc.cjs",
    "eslint-rules",
    "convex/_generated",
    // There are currently ESLint errors in shadcn/ui
    "components/ui",
    "e2e",
    // React Email templates require inline styles (no CSS class support in emails)
    "emails",
  ],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    // All of these overrides ease getting into
    // TypeScript, and can be removed for stricter
    // linting down the line.

    // Error on unused variables, ignore variables starting with `_`
    "@typescript-eslint/no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],

    // Allow escaping the compiler
    "@typescript-eslint/ban-ts-comment": "error",

    // Warn on explicit `any`s — tightened for AI-generated code quality
    "@typescript-eslint/no-explicit-any": "warn",

    // START: Allow implicit `any`s
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    // END: Allow implicit `any`s

    // Allow async functions without await
    // for consistency (esp. Convex `handler`s)
    "@typescript-eslint/require-await": "off",

    "@typescript-eslint/no-unnecessary-condition": "error",

    // ═══════════════════════════════════════════════════════════════
    // Design System Enforcement (F001-002)
    // ═══════════════════════════════════════════════════════════════

    // Ban raw Tailwind color classes — force semantic tokens
    "rulesdir/no-raw-tailwind-colors": "error",

    // Ban inline styles — force Tailwind semantic tokens or component variants
    "no-restricted-syntax": [
      "error",
      {
        selector: "JSXAttribute[name.name='style']",
        message: "Inline styles banned. Use Tailwind semantic tokens or component variants.",
      },
    ],

    // Ban direct Radix imports (use shadcn wrappers) and lucide-react
    "no-restricted-imports": [
      "error",
      {
        paths: [
          { name: "@radix-ui/react-dialog", message: "Use @/components/ui/dialog instead." },
          { name: "@radix-ui/react-dropdown-menu", message: "Use @/components/ui/dropdown-menu instead." },
          { name: "@radix-ui/react-select", message: "Use @/components/ui/select instead." },
          { name: "@radix-ui/react-tabs", message: "Use @/components/ui/tabs instead." },
          { name: "@radix-ui/react-popover", message: "Use @/components/ui/popover instead." },
          { name: "lucide-react", message: "Use @radix-ui/react-icons (project standard)." },
        ],
      },
    ],
  },
};
