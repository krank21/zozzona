module.exports = function () {
  const RESERVED = new Set([
    "default",
    "export",
    "import",
    "require",
    "module",
    "exports",
    "__dirname",
    "__filename"
  ]);

  return {
    visitor: {
      // ------------------------------------------------------------
      // 🚫 NEVER touch import/export declarations
      // ------------------------------------------------------------
      ImportDeclaration() {
        return;
      },
      ExportNamedDeclaration() {
        return;
      },
      ExportDefaultDeclaration() {
        return;
      },
      ExportAllDeclaration() {
        return;
      },

      // ------------------------------------------------------------
      // 🔒 Identifier renaming (safe)
      // ------------------------------------------------------------
      Identifier(path) {
        const name = path.node.name;

        // Skip reserved built-ins and keywords
        if (RESERVED.has(name)) return;

        // Skip keys in objects: { default: value }
        if (
          path.parent.type === "ObjectProperty" &&
          path.parent.key === path.node
        ) {
          return;
        }

        // Skip function names used as labels
        if (path.parent.type === "LabeledStatement") return;

        // Skip property names in member expressions (obj.prop)
        if (
          path.parent.type === "MemberExpression" &&
          path.parent.property === path.node &&
          !path.parent.computed
        ) {
          return;
        }

        const newName = "_zozz_" + Math.random().toString(36).substring(2, 10);
        path.scope.rename(name, newName);
      }
    }
  };
};
