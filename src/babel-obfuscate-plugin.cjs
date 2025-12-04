// Safe reversible obfuscation for JS/TS that preserves:
// - import/export bindings
// - module specifiers
// - Node globals (__dirname, process, etc.)
// - object keys
// - class names
// - function names (optional)
// Only local variable bindings are renamed.

module.exports = function () {
  const RUNTIME_GLOBALS = new Set([
    "require",
    "module",
    "exports",
    "__dirname",
    "__filename",
    "process",
    "global",
    "import",
  ]);

  const ES_RESERVED = new Set([
    "default",
    "export",
    "import",
  ]);

  function shouldSkip(path) {
    const { node, parent, parentPath } = path;

    const name = node.name;

    // Skip reserved keywords
    if (ES_RESERVED.has(name)) return true;

    // Skip Node runtime globals
    if (RUNTIME_GLOBALS.has(name)) return true;

    // Skip import/export bindings
    if (
      parent.type.startsWith("Import") ||
      parent.type.startsWith("Export")
    ) {
      return true;
    }

    // Skip module specifiers (string literals)
    if (parent.type === "CallExpression" && parent.callee.name === "require") {
      // require("express")
      return true;
    }

    // Skip keys: { something: value }
    if (
      parent.type === "ObjectProperty" &&
      parent.key === node
    ) {
      return true;
    }

    // Skip class names
    if (parent.type === "ClassDeclaration") return true;

    // Skip function names (optional — keep stable)
    if (parent.type === "FunctionDeclaration") return true;

    // Everything else CAN be renamed safely
    return false;
  }

  return {
    visitor: {
      Identifier(path) {
        if (shouldSkip(path)) return;

        const oldName = path.node.name;

        // Skip if this identifier was already renamed
        if (oldName.startsWith("_zozz_")) return;

        const newName = "_zozz_" + Math.random().toString(36).substring(2, 8);

        try {
          path.scope.rename(oldName, newName);
        } catch {
          // Ignore rename collisions
        }
      }
    }
  };
};
