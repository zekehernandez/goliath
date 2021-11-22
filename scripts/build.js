const esbuild = require("esbuild");

// build user code
esbuild.buildSync({
  bundle: true,
  sourcemap: false,
  target: "es6",
  keepNames: false,
  logLevel: "silent",
  entryPoints: ["code/main.js"],
  outfile: "build/game.js",
});

esbuild.buildSync({
  bundle: true,
  sourcemap: false,
  target: "es6",
  keepNames: false,
  entryPoints: ["helper.ts"],
  outfile: "build/helper.js",
});