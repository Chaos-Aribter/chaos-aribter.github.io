import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const portFlag = args.findIndex((arg) => arg === "--port" || arg === "-p");
const requestedPort = portFlag >= 0 ? Number(args[portFlag + 1]) : undefined;

if (portFlag >= 0 && (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535)) {
  console.error("\nPlease provide a valid port, for example: npm run dev -- --port 9000\n");
  process.exit(1);
}

const canListen = async (port) => {
  const net = await import("node:net");

  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    // Match Next's listener (which binds both IPv4 and IPv6 on macOS) so a
    // port that looks free on 127.0.0.1 cannot still fail during startup.
    server.listen(port);
  });
};

let port = requestedPort ?? 8999;
if (!requestedPort) {
  while (!(await canListen(port))) port += 1;
} else if (!(await canListen(port))) {
  console.error(`\nPort ${port} is already in use. Choose another one, for example: npm run dev -- --port ${port + 1}\n`);
  process.exit(1);
}

console.log(`\nStarting the development server at http://localhost:${port}\n`);
const nextBinary = new URL("../node_modules/next/dist/bin/next", import.meta.url);
const child = spawn(process.execPath, [nextBinary.pathname, "dev", "--port", String(port)], {
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
