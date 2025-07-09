// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  react.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Agrega globales del navegador (window, document, etc.)
      },
    },
  },

  // Configuración específica para archivos TypeScript
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true, // Usa el tsconfig.json más cercano
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Tus reglas personalizadas para TS
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  // Configuración específica para archivos React (JSX/TSX)
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Desactiva la necesidad de importar React en cada archivo
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off", // Mejor usar TypeScript para tipos de props

      // Reglas para los Hooks de React
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // Ignora archivos de configuración y la carpeta 'dist'
  {
    ignores: ["dist/", "eslint.config.js"],
  },

  // Configuración para React
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);