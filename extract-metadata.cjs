const fs = require('fs');

function extractBlogMetadata() {
  const content = fs.readFileSync(
    'frontend/app/resources/blog/page.tsx',
    'utf8'
  );
  const lines = content.split('\n');

  // Find the blogPosts object
  const startIndex = lines.findIndex((line) =>
    line.includes('const blogPosts')
  );
  let braceCount = 0;
  let endIndex = startIndex;

  // Find the matching closing brace
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('{')) braceCount++;
    if (lines[i].includes('}')) braceCount--;
    if (braceCount === 0 && lines[i].trim() === '};') {
      endIndex = i;
      break;
    }
  }

  // Extract the blogPosts content
  const blogPostsContent = lines.slice(startIndex, endIndex + 1).join('\n');

  // Split by year entries - look for lines that start with digits followed by colon
  const yearEntries = blogPostsContent.split(/\n(?=\s*\d+:\s*\{)/);

  const metadataEntries = [];

  for (const entry of yearEntries) {
    if (!entry.trim()) continue;

    console.log('Processing entry:', entry.substring(0, 100) + '...');

    // Extract year
    const yearMatch = entry.match(/(\d+):\s*\{/);
    if (!yearMatch) {
      console.log('No year match for entry');
      continue;
    }
    const year = yearMatch[1];

    // Find where content starts
    const contentStartIndex = entry.indexOf('content: `');
    let metadataPart = entry;
    if (contentStartIndex !== -1) {
      metadataPart = entry.substring(0, contentStartIndex);
    }

    // Clean up the metadata - remove the year: { and trailing comma
    const cleanMetadata = metadataPart
      .replace(/\d+:\s*\{/, '') // Remove the year: {
      .replace(/,$/, '') // Remove trailing comma
      .trim();

    metadataEntries.push({ year, metadata: cleanMetadata });
  }

  return metadataEntries;
}

const entries = extractBlogMetadata();
console.log(`Found ${entries.length} entries`);

// Create the simplified blogPosts
const simplifiedEntries = entries.map(
  (entry) =>
    `    ${entry.year}: {
${entry.metadata}
    }`
);

const simplifiedBlogPosts = `  const blogPosts: { [key: number]: Omit<BlogPost, 'content'> } = {
${simplifiedEntries.join(',\n')}
  };`;

console.log('\n--- SIMPLIFIED BLOGPOSTS ---');
console.log(simplifiedBlogPosts);

// Write to a file
fs.writeFileSync('simplified-blogposts.ts', simplifiedBlogPosts);
