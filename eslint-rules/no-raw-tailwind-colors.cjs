/**
 * ESLint rule: no-raw-tailwind-colors
 *
 * Bans raw Tailwind color classes (e.g., bg-red-500, text-blue-300) in JSX className attributes.
 * Forces use of semantic design tokens (bg-primary, bg-destructive, bg-warning, etc.).
 */

const RAW_COLOR_PREFIXES = [
  "red", "blue", "green", "yellow", "purple", "pink", "orange",
  "gray", "slate", "zinc", "stone", "neutral",
  "amber", "lime", "emerald", "teal", "cyan", "sky",
  "indigo", "violet", "fuchsia", "rose",
];

const UTILITY_PREFIXES = ["bg-", "text-", "border-", "ring-", "from-", "to-", "via-", "divide-", "outline-", "shadow-", "decoration-", "placeholder-", "accent-", "caret-", "fill-", "stroke-"];

// Build patterns like: bg-red-, text-blue-, border-green-, etc.
const BANNED_PATTERNS = [];
for (const utility of UTILITY_PREFIXES) {
  for (const color of RAW_COLOR_PREFIXES) {
    BANNED_PATTERNS.push(utility + color + "-");
  }
}
// Also ban bg-white and bg-black (use bg-background instead)
BANNED_PATTERNS.push("bg-white", "bg-black");

const BANNED_REGEX = new RegExp(
  "\\b(" + BANNED_PATTERNS.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|") + ")",
  "g"
);

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw Tailwind color classes. Use semantic design tokens instead.",
    },
    messages: {
      noRawColor: "Raw Tailwind color '{{match}}' is banned. Use semantic tokens (bg-primary, bg-destructive, bg-warning, bg-success, bg-info, text-muted-foreground, etc.).",
    },
    schema: [],
  },
  create(context) {
    function checkStringForColors(node, value) {
      const matches = value.match(BANNED_REGEX);
      if (matches) {
        for (const match of matches) {
          context.report({
            node,
            messageId: "noRawColor",
            data: { match },
          });
        }
      }
    }

    function checkNode(node) {
      if (!node) return;
      if (node.type === "Literal" && typeof node.value === "string") {
        checkStringForColors(node, node.value);
      } else if (node.type === "TemplateLiteral") {
        for (const quasi of node.quasis) {
          checkStringForColors(quasi, quasi.value.raw);
        }
      }
    }

    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.type === "JSXIdentifier" &&
          node.name.name === "className"
        ) {
          const value = node.value;
          if (!value) return;

          if (value.type === "Literal") {
            checkNode(value);
          } else if (value.type === "JSXExpressionContainer") {
            checkNode(value.expression);
            // Check cn() or clsx() calls
            if (
              value.expression.type === "CallExpression" &&
              value.expression.arguments
            ) {
              for (const arg of value.expression.arguments) {
                checkNode(arg);
              }
            }
          }
        }
      },
    };
  },
};
