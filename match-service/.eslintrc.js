module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "script",
  },
  rules: {
    "no-unused-vars": ["error", { vars: "all", args: "none" }],
    "no-undef": "error",
  },
};