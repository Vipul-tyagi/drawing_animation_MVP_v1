const fs = require('fs-extra');
const path = require('path');

const tempDirs = ['./tmp/uploads', './tmp/outputs', './tmp/enhanced'];
const MAX_AGE = 15 * 60 * 1000; // 15 minutes

async function cleanupOldFiles() {
  const now = Date.now();
  for (const dir of tempDirs) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (now - stat.mtime.getTime() > MAX_AGE) {
          await fs.remove(filePath);
          console.log(`Removed old file: ${filePath}`);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Error cleaning up directory ${dir}:`, error);
      }
    }
  }
}

module.exports = { cleanupOldFiles };
