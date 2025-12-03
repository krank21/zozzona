// Simple reversible obfuscation plugin for dist builds
// Generates short identifier names but does NOT track mapping.
// Dist obfuscation is one-way.

module.exports = function () {
  return {
    visitor: {
      Identifier(path) {
        // Skip special cases
        if (path.node.name.startsWith("_zozz_")) return;
        if (path.node.name === "require") return;
        if (path.node.name === "module") return;
        if (path.node.name === "__dirname") return;
        if (path.node.name === "__filename") return;

        // Generate randomized short names
        const newName =
          "_zozz_" + Math.random().toString(36).substring(2, 8);

        path.scope.rename(path.node.name, newName);
      }
    }
  };
};
