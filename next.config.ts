import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  env: {
    // Turbopack virtualizes process.cwd() and import.meta.url in bundled code,
    // so we compute the real tsx path here (in the config process) and inline it.
    RUNNER_TSX_BIN: join(process.cwd(), 'node_modules', '.bin', 'tsx'),
  },
};

export default nextConfig;
