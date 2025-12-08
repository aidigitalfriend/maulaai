#!/usr/bin/env node
// 🔍 ADVANCED DUPLICATE & IMPORT ANALYZER
// Finds exact duplicates, naming conflicts, and missing imports

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_ROOT = '/Users/onelastai/Downloads/shiny-friend-disco';
const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

console.log('🔍 ADVANCED DUPLICATE & IMPORT ANALYSIS');
console.log('==========================================\n');

// Helper function to recursively get all files
function getAllFiles(dirPath, fileTypes = ['.tsx', '.ts', '.js']) {
  const files = [];

  function traverse(currentPath) {
    if (currentPath.includes('node_modules') || currentPath.includes('.next'))
      return;

    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        traverse(itemPath);
      } else if (fileTypes.some((type) => item.endsWith(type))) {
        files.push({
          name: item,
          path: itemPath,
          relativePath: path.relative(PROJECT_ROOT, itemPath),
          basename: path.basename(item, path.extname(item)),
          ext: path.extname(item),
        });
      }
    }
  }

  traverse(dirPath);
  return files;
}

// 1. EXACT DUPLICATE ANALYSIS
console.log(`${COLORS.blue}1. EXACT DUPLICATE FILES:${COLORS.reset}`);
console.log('-------------------------');

const allFiles = getAllFiles(PROJECT_ROOT);
const duplicates = {};

allFiles.forEach((file) => {
  if (!duplicates[file.name]) {
    duplicates[file.name] = [];
  }
  duplicates[file.name].push(file);
});

let duplicateCount = 0;
Object.entries(duplicates).forEach(([filename, files]) => {
  if (files.length > 1) {
    duplicateCount++;
    console.log(
      `${COLORS.red}⚠️  ${filename}${COLORS.reset} (${files.length} copies):`
    );
    files.forEach((file) => {
      console.log(`   → ${file.relativePath}`);
    });
    console.log('');
  }
});

if (duplicateCount === 0) {
  console.log(
    `${COLORS.green}✅ No exact duplicate filenames found${COLORS.reset}\n`
  );
}

// 2. NAMING CONFLICT ANALYSIS
console.log(
  `${COLORS.blue}2. NAMING CONFLICTS (Same basename, different extensions):${COLORS.reset}`
);
console.log('--------------------------------------------------------');

const basenames = {};
allFiles.forEach((file) => {
  const key = `${path.dirname(file.relativePath)}/${file.basename}`;
  if (!basenames[key]) {
    basenames[key] = [];
  }
  basenames[key].push(file);
});

let conflictCount = 0;
Object.entries(basenames).forEach(([basename, files]) => {
  if (files.length > 1) {
    const extensions = [...new Set(files.map((f) => f.ext))];
    if (extensions.length > 1) {
      conflictCount++;
      console.log(`${COLORS.yellow}⚠️  ${basename}${COLORS.reset}:`);
      files.forEach((file) => {
        console.log(`   → ${file.relativePath}`);
      });
      console.log('');
    }
  }
});

if (conflictCount === 0) {
  console.log(`${COLORS.green}✅ No naming conflicts found${COLORS.reset}\n`);
}

// 3. IMPORT ANALYSIS
console.log(`${COLORS.blue}3. IMPORT RELATIONSHIP ANALYSIS:${COLORS.reset}`);
console.log('----------------------------------');

function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];

    // Match various import patterns
    const importPatterns = [
      /import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g,
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    importPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push({
          module: match[1],
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    });

    return imports;
  } catch (error) {
    return [];
  }
}

// Check for missing local imports
const tsxFiles = allFiles.filter((f) => f.ext === '.tsx');
let missingImports = 0;

console.log('Analyzing local imports in TSX files...\n');

tsxFiles.slice(0, 10).forEach((file) => {
  // Limit to first 10 for demo
  const imports = analyzeImports(file.path);
  const localImports = imports.filter(
    (imp) =>
      imp.module.startsWith('./') ||
      imp.module.startsWith('../') ||
      imp.module.startsWith('@/')
  );

  localImports.forEach((imp) => {
    const baseDir = path.dirname(file.path);
    let importPath;

    if (imp.module.startsWith('@/')) {
      importPath = path.join(PROJECT_ROOT, imp.module.replace('@/', ''));
    } else {
      importPath = path.resolve(baseDir, imp.module);
    }

    // Check various possible extensions
    const possiblePaths = [
      importPath + '.tsx',
      importPath + '.ts',
      importPath + '.js',
      importPath + '/index.tsx',
      importPath + '/index.ts',
      importPath + '/index.js',
    ];

    const exists = possiblePaths.some((p) => fs.existsSync(p));

    if (!exists) {
      missingImports++;
      console.log(
        `${COLORS.red}❌ ${file.relativePath}:${imp.line}${COLORS.reset}`
      );
      console.log(`   Missing: ${imp.module}`);
      console.log(
        `   Checked: ${possiblePaths
          .map((p) => path.relative(PROJECT_ROOT, p))
          .join(', ')}`
      );
      console.log('');
    }
  });
});

if (missingImports === 0) {
  console.log(
    `${COLORS.green}✅ All analyzed imports are valid${COLORS.reset}\n`
  );
}

// 4. COMPONENT-LOGIC RELATIONSHIP ANALYSIS
console.log(`${COLORS.blue}4. COMPONENT-LOGIC RELATIONSHIPS:${COLORS.reset}`);
console.log('-----------------------------------');

const components = allFiles.filter(
  (f) => f.ext === '.tsx' && f.relativePath.includes('components/')
);

let orphanedComponents = 0;

components.forEach((component) => {
  const logicFile = allFiles.find(
    (f) =>
      f.basename === component.basename &&
      f.ext === '.ts' &&
      !f.relativePath.includes('node_modules')
  );

  if (!logicFile) {
    orphanedComponents++;
    console.log(`${COLORS.yellow}⚠️  ${component.relativePath}${COLORS.reset}`);
    console.log(`   No matching ${component.basename}.ts logic file found`);
    console.log('');
  }
});

if (orphanedComponents === 0) {
  console.log(
    `${COLORS.green}✅ All components have supporting logic or are self-contained${COLORS.reset}\n`
  );
}

// SUMMARY
console.log(`${COLORS.green}📊 ANALYSIS SUMMARY:${COLORS.reset}`);
console.log('====================');
console.log(`• Duplicate files: ${duplicateCount}`);
console.log(`• Naming conflicts: ${conflictCount}`);
console.log(`• Missing imports: ${missingImports}`);
console.log(`• Orphaned components: ${orphanedComponents}`);
console.log(`• Total files analyzed: ${allFiles.length}`);
console.log('');
