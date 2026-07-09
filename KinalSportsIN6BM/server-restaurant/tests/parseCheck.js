(async () => {
  try {
    await import('../helpers/cloudinary.service.js');
    await import('../helpers/file-upload.service.js');
    await import('../src/fields/auth/auth.controller.js');
    console.log('Parse check: OK');
  } catch (err) {
    console.error('Parse check failed:', err);
    process.exit(1);
  }
})();
