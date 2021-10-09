const { ZipFile } = require('yazl');
const fs = require('fs');

const artifactOutputPath = 'infrastructure/dist';

require('esbuild')
  .build({
    entryPoints: ['src/lambda.ts'],
    tsconfig: './tsconfig.json',
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: `${artifactOutputPath}/main.js`,
    platform: 'node',
    target: 'node14'
  })
  .then(() => {
    const zipFile = new ZipFile();
    zipFile.addFile(`${artifactOutputPath}/main.js.map`, 'main.js.map');
    zipFile.addFile(`${artifactOutputPath}/main.js`, 'main.js');
    zipFile.outputStream.pipe(fs.createWriteStream(`${artifactOutputPath}/lambda.zip`)).on('close', () => {
      console.log('Lambda artifact zipped successfully');
    });
    zipFile.end();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
