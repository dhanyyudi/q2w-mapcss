/**
 * q2w-mapcss Tailwind plugin
 *
 * Phase 5 scope: exposes q2w design tokens through Tailwind theme extensions.
 * This plugin does not inject compiled q2w component classes in v0.1.x.
 * Continue loading q2w-mapcss CSS separately in your application.
 *
 * CommonJS usage:
 *   const q2w = require('q2w-mapcss/tailwind');
 *
 * ESM usage:
 *   import q2w from 'q2w-mapcss/tailwind';
 */
const plugin = require("tailwindcss/plugin");

module.exports = plugin(
  function () {},
  {
    theme: {
      extend: {
        colors: {
          "q2w-accent": "var(--q2w-accent)",
          "q2w-accent-hover": "var(--q2w-accent-hover)",
          "q2w-surface": "var(--q2w-surface)",
          "q2w-surface-soft": "var(--q2w-surface-soft)",
          "q2w-text": "var(--q2w-text)",
          "q2w-text-muted": "var(--q2w-text-muted)",
          "q2w-border": "var(--q2w-border)",
          "q2w-success": "var(--q2w-success)",
          "q2w-warning": "var(--q2w-warning)",
          "q2w-danger": "var(--q2w-danger)",
          "q2w-info": "var(--q2w-info)",
        },
        borderRadius: {
          "q2w-xs": "var(--q2w-radius-xs)",
          "q2w-sm": "var(--q2w-radius-sm)",
          "q2w-md": "var(--q2w-radius-md)",
          "q2w-lg": "var(--q2w-radius-lg)",
          "q2w-xl": "var(--q2w-radius-xl)",
          "q2w-full": "var(--q2w-radius-full)",
        },
        spacing: {
          "q2w-1": "var(--q2w-space-1)",
          "q2w-2": "var(--q2w-space-2)",
          "q2w-3": "var(--q2w-space-3)",
          "q2w-4": "var(--q2w-space-4)",
          "q2w-6": "var(--q2w-space-6)",
          "q2w-8": "var(--q2w-space-8)",
        },
        boxShadow: {
          "q2w-sm": "var(--q2w-shadow-sm)",
          "q2w-md": "var(--q2w-shadow-md)",
          "q2w-lg": "var(--q2w-shadow-lg)",
        },
      },
    },
  }
);
