const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const runInstall = (service) => {
  const serviceDir = path.join(backendDir, service);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(serviceDir)) {
      console.warn(`\n[${service}] Directory not found: ${serviceDir} — skipping`);
      resolve();
      return;
    }

    const pkgPath = path.join(serviceDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      console.warn(`\n[${service}] No package.json found in ${serviceDir} — skipping`);
      resolve();
      return;
    }

    console.log(`\n[${service}] Installing dependencies...`);

    const child = spawn(pnpmCommand, ['install'], {
      cwd: serviceDir,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env },
    });

    child.on('error', (err) => {
      reject(new Error(`[${service}] spawn error: ${err.message}`));
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`[${service}] Dependencies installed`);
        resolve();
        return;
      }

      reject(new Error(`[${service}] pnpm install failed with exit code ${code}`));
    });
  });
};

const main = async () => {
  for (const service of services) {
    await runInstall(service);
  }

  console.log('\nAll backend microservice dependencies were installed.');
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
