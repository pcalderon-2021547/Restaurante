const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const services = [
  'Delivery-service',
  'Menu-service',
  'Order-service',
  'Product-service',
  'Reports-service',
  'Reservation-service',
  'Review-service',
  'Table-service',
];

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'BackendRestaurante');
const pnpmCommand = 'pnpm';
const children = new Map();

const prefixStream = (stream, service, write) => {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => write(`[${service}] ${line}\n`));
};

const stopAll = () => {
  for (const [service, child] of children) {
    if (!child.killed) {
      console.log(`[${service}] Stopping...`);
      child.kill();
    }
  }
};

const startService = (service) => {
  const serviceDir = path.join(backendDir, service);
  if (!fs.existsSync(serviceDir)) {
    console.warn(`[${service}] Directory not found: ${serviceDir} — skipping`);
    return;
  }

  const pkgPath = path.join(serviceDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.warn(`[${service}] No package.json found in ${serviceDir} — skipping`);
    return;
  }

  const child = spawn(pnpmCommand, ['run', 'dev'], {
    cwd: serviceDir,
    shell: true,
    env: { ...process.env },
  });

  children.set(service, child);
  prefixStream(child.stdout, service, (line) => process.stdout.write(line));
  prefixStream(child.stderr, service, (line) => process.stderr.write(line));

  child.on('error', (error) => {
    console.error(`[${service}] Failed to start: ${error.message}`);
  });

  child.on('exit', (code, signal) => {
    children.delete(service);
    if (signal) {
      console.log(`[${service}] Exited with signal ${signal}`);
      return;
    }
    console.log(`[${service}] Exited with code ${code}`);
  });
};

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

console.log('Starting backend microservices...');
for (const service of services) {
  startService(service);
}
