const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const auditDir = path.join(__dirname, '../.audit-report');
const outputFile = path.join(auditDir, `audit-${timestamp}.zip`);

// Create audit directory
if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

// Create write stream
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Audit ZIP created: ${outputFile} (${archive.pointer()} bytes)`);
  process.exit(0);
});

archive.on('error', (err) => {
  console.error('❌ Archive error:', err);
  process.exit(1);
});

archive.pipe(output);

// Add files
const filesToAdd = [
  { file: 'qa/gaga-audit.mjs', name: 'gaga-audit.mjs' },
  { file: 'package.json', name: 'package.json' },
  { file: 'package-lock.json', name: 'package-lock.json' },
];

filesToAdd.forEach(({ file, name }) => {
  const filepath = path.join(__dirname, '..', file);
  if (fs.existsSync(filepath)) {
    archive.file(filepath, { name });
  }
});

// Add audit metadata
const metadata = {
  timestamp,
  gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
  gitCommit: execSync('git rev-parse HEAD').toString().trim(),
  nodeVersion: process.version,
  npm: execSync('npm --version').toString().trim(),
};

archive.append(JSON.stringify(metadata, null, 2), { name: 'AUDIT_METADATA.json' });

archive.finalize();
