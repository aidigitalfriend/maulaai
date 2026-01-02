const fs = require('fs');
const path = require('path');

// Function to add CORS headers to a route file
function addCorsHeaders(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has OPTIONS handler
  if (content.includes('export async function OPTIONS')) {
    console.log(`Skipping ${filePath} - already has CORS`);
    return;
  }

  // Add OPTIONS handler after imports
  const importEndIndex = content.lastIndexOf("import { NextRequest, NextResponse } from 'next/server'");
  if (importEndIndex === -1) {
    console.log(`Skipping ${filePath} - no NextRequest/NextResponse import`);
    return;
  }

  const afterImports = content.indexOf('\n\n', importEndIndex) + 2;

  const corsOptionsHandler = `
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

`;

  content = content.slice(0, afterImports) + corsOptionsHandler + content.slice(afterImports);

  // Add CORS headers to all NextResponse.json calls
  content = content.replace(
    /NextResponse\.json\(([^,]+),\s*\{([^}]*)\}\)/g,
    (match, data, options) => {
      // If already has headers, skip
      if (options.includes('Access-Control-Allow-Origin')) {
        return match;
      }
      // Add headers to options
      const newOptions = options.trim() + `,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }`;
      return `NextResponse.json(${data}, {${newOptions}})`;
    }
  );

  // Handle NextResponse.json calls without options object
  content = content.replace(
    /NextResponse\.json\(([^)]+)\)(?!.*\{)/g,
    (match, data) => {
      return `NextResponse.json(${data}, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })`;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// Find all route.ts files
const toolsDir = '/Users/onelastai/Downloads/shiny-friend-disco/frontend/app/api/tools';

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const routeFile = path.join(fullPath, 'route.ts');
      if (fs.existsSync(routeFile)) {
        addCorsHeaders(routeFile);
      }
      // Recurse into subdirectories
      processDirectory(fullPath);
    }
  }
}

processDirectory(toolsDir);
console.log('CORS headers added to all API routes');