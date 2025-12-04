module.exports = function () {
  const RESERVED = new Set([
    "default",
    "export",
    "import",
    "require",
    "module",
    "exports",
    "__dirname",
    "__filename",
    // React JSX runtime identifiers
    "jsx",
    "jsxs",
    "Fragment",
    "StrictMode",
    "_jsx",
    "_jsxs"
  ]);

  return {
    visitor: {
      // ------------------------------------------
      // 🚫 NEVER rename inside import declarations
      // ------------------------------------------
      ImportDeclaration(path) {
        path.skip();
      },
      ImportSpecifier(path) {
        path.skip();
      },
      ImportDefaultSpecifier(path) {
        path.skip();
      },
      ImportNamespaceSpecifier(path) {
        path.skip();
      },

      // ------------------------------------------
      // 🚫 NEVER rename inside export declarations
      // ------------------------------------------
      ExportNamedDeclaration(path) {
        path.skip();
      },
      ExportDefaultDeclaration(path) {
        path.skip();
      },
      ExportAllDeclaration(path) {
        path.skip();
      },

      // ------------------------------------------
      // 🔒 Identifier Renaming
      // ------------------------------------------
      Identifier(path) {
        const name = path.node.name;

        // Skip reserved names
        if (RESERVED.has(name)) return;

        // Skip object keys: { default: value }
        if (
          path.parent.type === "ObjectProperty" &&
          path.parent.key === path.node &&
          !path.parent.computed
        ) {
          return;
        }

        // Skip member expressions: obj.prop  (unless computed: obj["prop"])
        if (
          path.parent.type === "MemberExpression" &&
          path.parent.property === path.node &&
          !path.parent.computed
        ) {
          return;
        }

        // Skip labeled statement names
        if (path.parent.type === "LabeledStatement") return;

        // Skip identifiers used as part of a function declaration name
        if (
          path.parent.type === "FunctionDeclaration" &&
          path.parent.id === path.node
        ) {
          return;
        }

        // Skip identifiers used as function parameter names
        if (
          path.parent.type === "FunctionExpression" ||
          path.parent.type === "ArrowFunctionExpression"
        ) {
          return;
        }

        // Skip class names
        if (
          path.parent.type === "ClassDeclaration" &&
          path.parent.id === path.node
        ) {
          return;
        }

        // ---- SAFE RENAME ----
        const newName =
          "_zozz_" + Math.random().toString(36).substring(2, 10);

        try {
          path.scope.rename(name, newName);
        } catch {
          // Ignore rename failures — keeps obfuscation stable
        }
      }
    }
  };
};
