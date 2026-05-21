// Requiere: node 18+ (fetch global) y servidor en ejecución
const BASE = `http://localhost:${process.env.PORT || 3010}/restaurantManagement/v1`;

const log = (label, obj) => console.log('\n===', label, '===\n', JSON.stringify(obj, null, 2));

export const checkHealth = async () => {
  const r = await fetch(`${BASE}/Health`);
  log('Health', { status: r.status, ok: r.ok });
};

// Este script es solo un helper para pruebas manuales automatizables.
// No intenta autenticarse ni subir archivos por simplicidad.

if (require.main === module) {
  (async () => {
    await checkHealth();
    console.log('Manual checks: revisa tests/manual-checks.md para instrucciones.');
  })();
}
