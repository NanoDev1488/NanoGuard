const fs = require("fs");
const path = require("path");

const KEEP_LOCALES = new Set(["en-US.pak", "ru.pak"]);

function localesDirFor(context) {
  if (context.electronPlatformName === "darwin") {
    const productFilename = context.packager.appInfo.productFilename;
    return path.join(context.appOutDir, `${productFilename}.app`, "Contents", "Resources", "locales");
  }
  return path.join(context.appOutDir, "locales");
}

exports.default = async function afterPack(context) {
  const localesDir = localesDirFor(context);
  if (!fs.existsSync(localesDir)) {
    console.log(`[afterPack] locales dir not found: ${localesDir} (${context.electronPlatformName})`);
  } else {
    let removedCount = 0;
    let removedBytes = 0;
    for (const file of fs.readdirSync(localesDir)) {
      if (KEEP_LOCALES.has(file)) continue;
      const full = path.join(localesDir, file);
      try {
        const size = fs.statSync(full).size;
        fs.unlinkSync(full);
        removedCount += 1;
        removedBytes += size;
      } catch (e) {
        console.log(`[afterPack] Error removing ${full}: ${e.message}`);
      }
    }
    console.log(
      `[afterPack] (${context.electronPlatformName}) Pruned ${removedCount} unused Chromium locales from ${localesDir}, saved ~${Math.round(removedBytes / 1024 / 1024)} MB`
    );
  }

  // macOS extra pruning: unused .lproj directories
  if (context.electronPlatformName === "darwin") {
    const productFilename = context.packager.appInfo.productFilename;
    const resourcesDir = path.join(context.appOutDir, `${productFilename}.app`, "Contents", "Resources");
    const KEEP_LPROJ = new Set(["en.lproj", "ru.lproj", "Base.lproj"]);
    if (fs.existsSync(resourcesDir)) {
      for (const item of fs.readdirSync(resourcesDir)) {
        if (item.endsWith(".lproj") && !KEEP_LPROJ.has(item)) {
          const itemPath = path.join(resourcesDir, item);
          try {
            fs.rmSync(itemPath, { recursive: true, force: true });
          } catch (_) {}
        }
      }
    }
  }

  // Prune debug files (.map, .pdb, .dSYM)
  function pruneDebugFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const p = path.join(dir, item);
      try {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) {
          pruneDebugFiles(p);
        } else if (item.endsWith(".map") || item.endsWith(".pdb") || item.endsWith(".dSYM")) {
          fs.unlinkSync(p);
        }
      } catch (_) {}
    }
  }
  try { pruneDebugFiles(context.appOutDir); } catch (_) {}
};
