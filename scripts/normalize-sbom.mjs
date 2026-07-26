let source = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  source += chunk;
});

process.stdin.on('end', () => {
  const sbom = JSON.parse(source);
  delete sbom.serialNumber;
  delete sbom.metadata?.timestamp;
  process.stdout.write(`${JSON.stringify(sbom, null, 2)}\n`);
});
