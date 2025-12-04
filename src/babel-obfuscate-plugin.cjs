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
      Identifier(path) {
        const name = path.node.name;

        // Skip reserved
        if (RESERVED.has(name)) return;

        // Skip export default
        if (
          path.parent.type === "ExportDefaultDeclaration" ||
          path.parent.type === "ExportNamedDeclaration"
        ) {
          return;
        }

        // Skip import specifiers
        if (path.parent.type === "ImportSpecifier" ||
            path.parent.type === "ImportDefaultSpecifier" ||
            path.parent.type === "ImportNamespaceSpecifier") {
          return;
        }

        // Skip keys in ObjectExpression: { default: value }
        if (path.parent.type === "ObjectProperty" &&
            path.parent.key === path.node) {
          return;
        }

        const newName =
          "_zozz_" + Math.random().toString(36).substring(2, 8);

        path.scope.rename(name, newName);
      }
    }
  };
};
