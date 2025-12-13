import { $ } from "bun";

// CLI targets for --compile (cross-compilation)
type CompileTarget = "bun" | "bun-darwin-arm64" | "bun-darwin-x64" | "bun-linux-arm64" | "bun-linux-x64";

interface CompileOptions {
  target: CompileTarget;
  outfile: string;
  minify?: boolean;
  sourcemap?: "none" | "inline" | "external";
}

const EXTERNAL_DEPENDENCIES = [
  "@ast-grep/napi",
  "@libsql/darwin-arm64",
  "@libsql/darwin-x64",
  "@libsql/linux-arm64-gnu",
  "@libsql/linux-x64-gnu",
  "vscode-ripgrep",
];

const MASTRA_OUTPUT = ".mastra/output/index.mjs";
const DEFAULT_OUTDIR = "./dist";

const TARGET_MAP: Record<string, CompileTarget> = {
  "darwin-arm64": "bun-darwin-arm64",
  "darwin-x64": "bun-darwin-x64",
  "linux-arm64": "bun-linux-arm64",
  "linux-x64": "bun-linux-x64",
  default: "bun",
};

async function buildMastra(debug: boolean = false): Promise<void> {
  console.log("Building with Mastra...");
  const args = ["build", "--dir", "src"];
  if (debug) {
    args.push("--debug");
  }
  await $`bunx mastra ${args}`;
  console.log("Mastra build complete.");
}

async function compileExecutable(options: CompileOptions): Promise<void> {
  const { target, outfile, minify = false, sourcemap = "none" } = options;

  console.log(`Compiling executable for target: ${target}`);
  console.log(`Output: ${outfile}`);

  // Bun.build doesn't support --compile directly, use CLI for compiled executables
  const args = [
    "build",
    MASTRA_OUTPUT,
    "--compile",
    "--target",
    target,
    "--outfile",
    outfile,
    ...EXTERNAL_DEPENDENCIES.flatMap((dep) => ["--external", dep]),
  ];

  if (minify) {
    args.push("--minify");
  }

  if (sourcemap !== "none") {
    args.push("--sourcemap", sourcemap);
  }

  await $`bun ${args}`;
  console.log(`Build successful: ${outfile}`);
}

function getOutfileName(target: CompileTarget): string {
  if (target === "bun") {
    return `${DEFAULT_OUTDIR}/mcp`;
  }
  const suffix = target.replace("bun-", "");
  return `${DEFAULT_OUTDIR}/mcp-${suffix}`;
}

async function buildAll(): Promise<void> {
  await buildMastra(true);

  const targets: CompileTarget[] = ["bun-darwin-arm64", "bun-darwin-x64", "bun-linux-arm64", "bun-linux-x64"];

  for (const target of targets) {
    await compileExecutable({
      target,
      outfile: getOutfileName(target),
    });
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "all": {
      await buildAll();
      break;
    }

    case "mastra": {
      const debug = args.includes("--debug");
      await buildMastra(debug);
      break;
    }

    case "compile": {
      const targetArg = args.find((arg) => arg.startsWith("--target="));
      const outfileArg = args.find((arg) => arg.startsWith("--outfile="));
      const minify = args.includes("--minify");
      const sourcemapArg = args.find((arg) => arg.startsWith("--sourcemap="));
      const targetKey = targetArg?.split("=")[1] || "default";
      const target = TARGET_MAP[targetKey] || (targetKey as CompileTarget);
      const outfile = outfileArg?.split("=")[1] || getOutfileName(target);
      const sourcemap = (sourcemapArg?.split("=")[1] as "none" | "inline" | "external") || "none";

      await compileExecutable({ target, outfile, minify, sourcemap });
      break;
    }

    default: {
      // Default: full build (mastra + compile for current platform)
      await buildMastra(true);
      await compileExecutable({
        target: "bun",
        outfile: `${DEFAULT_OUTDIR}/mcp`,
      });
      break;
    }
  }
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
