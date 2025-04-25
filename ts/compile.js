const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');



fs.readdir(".", (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err.message}`);
        return;
      }
  
      // Filter out only .ts files
      const tsFiles = files.filter((file) => path.extname(file) === '.ts');
  
      if (tsFiles.length === 0) {
        console.log('No TypeScript files found in the current directory.');
        return;
      }

      for (let i = 0; i < tsFiles.length; i++) {
        run(tsFiles[i])
      }
    })


function run(filePath) {
  exec(`tsc ${filePath} --outdir "../js"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error compiling ${filePath}: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Compilation errors/warnings for ${filePath}: ${stderr}`);
      return;
    }

    console.log(`Successfully compiled: ${filePath}`);
    console.log(stdout);
  });
}