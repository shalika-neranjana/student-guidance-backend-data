const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        ignores: ["node_modules/**"]
    },
    js.configs.recommended,
    {
        files: ["eslint.config.js", "server.js", "src/**/*.js", "test/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.node,
            sourceType: "commonjs"
        },
        rules: {
            "no-console": "off",
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
        }
    },
    {
        files: ["public/js/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.browser
        },
        rules: {
            "no-alert": "off",
            "no-console": "off",
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
        }
    }
];
