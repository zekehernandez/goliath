const esbuild = require("esbuild");

// build user code
esbuild.buildSync({
  bundle: true,
  sourcemap: true,
  target: "es6",
  keepNames: true,
  logLevel: "silent",
  entryPoints: ["code/main.js"],
  outfile: "build/game.js",
});

esbuild.buildSync({
  bundle: true,
  sourcemap: true,
  target: "es6",
  keepNames: true,
  entryPoints: ["helper.ts"],
  outfile: "build/helper.js",
});