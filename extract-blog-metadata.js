const fs = require('fs');
const content = fs.readFileSync('frontend/app/resources/blog/page.tsx', 'utf8');
const lines = content.split('\n');

// Find the blogPosts object
const startIndex = lines.findIndex((line) => line.includes('const blogPosts'));
const endIndex = lines.findIndex(
  (line, i) => i > startIndex && line.trim() === '};'
);

// Extract the blogPosts content
const blogPostsContent = lines.slice(startIndex, endIndex + 1).join('\n');

// Parse each year entry
const yearRegex = /    (\d+): \{([\s\S]*?)\n    \},/g;
let match;
const entries = [];

while ((match = yearRegex.exec(blogPostsContent)) !== null) {
  const year = match[1];
  const entryContent = match[2];

  // Extract metadata (everything except content)
  const metadataLines = entryContent
    .split('\n')
    .filter(
      (line) =>
        !line.includes('content:') &&
        !line.trim().startsWith('`') &&
        !line.trim().startsWith('<') &&
        line.trim() !== ''
    );

  const metadata = metadataLines.join('\n');
  entries.push({ year, metadata });
}

console.log('Found', entries.length, 'entries');

// Create the simplified blogPosts object
const simplifiedEntries = entries.map((entry) => {
  return `    ${entry.year}: {
${entry.metadata}
    }`;
});

const simplifiedBlogPosts = `  const blogPosts: { [key: number]: Omit<BlogPost, 'content'> } = {
${simplifiedEntries.join(',\n')}
  };`;

console.log('\n--- SIMPLIFIED BLOGPOSTS ---');
console.log(simplifiedBlogPosts);
