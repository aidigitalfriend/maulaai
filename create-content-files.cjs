const fs = require('fs');
const path = require('path');

const backupFile = 'frontend/app/resources/blog/page.tsx.backup';
const content = fs.readFileSync(backupFile, 'utf8');

// Get all years from the current simplified file
const currentContent = fs.readFileSync(
  'frontend/app/resources/blog/page.tsx',
  'utf8'
);
const yearMatches = currentContent.matchAll(/(\d+): \{/g);
const years = Array.from(yearMatches)
  .map((match) => parseInt(match[1]))
  .filter((y) => y >= 1937);

console.log('Creating content files for years:', years);

for (const year of years) {
  // Find the start of this year's entry
  const yearStartPattern = new RegExp(`    ${year}: \\{`);
  const startMatch = content.match(yearStartPattern);
  if (!startMatch) {
    console.log(`No start match for year ${year}`);
    continue;
  }

  const startIndex = startMatch.index + startMatch[0].length;

  // Find the end - either next year or the closing of blogPosts
  let endIndex = content.indexOf('  };', startIndex);
  const nextYearPattern = new RegExp(`    (\\d+): \\{`);
  const nextYearMatch = content.substring(startIndex).match(nextYearPattern);
  if (nextYearMatch) {
    const nextYearStart = startIndex + nextYearMatch.index;
    if (nextYearStart < endIndex) {
      endIndex = nextYearStart;
    }
  }

  const yearEntry = content.substring(startIndex, endIndex);

  // Extract content between backticks
  const contentMatch = yearEntry.match(/content: `\n([\s\S]*?)`,?\s*$/);
  if (!contentMatch) {
    console.log(`No content found for year ${year}`);
    continue;
  }

  const yearContent = contentMatch[1];

  // Write to file
  const filePath = path.join(
    'frontend/app/resources/blog/content',
    `${year}.ts`
  );
  const fileContent = `export default \`
${yearContent}
\`;`;

  fs.writeFileSync(filePath, fileContent);
  console.log(`Created ${filePath}`);
}
