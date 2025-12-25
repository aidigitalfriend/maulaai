const fs = require('fs');

function extractYearContent(year) {
  const content = fs.readFileSync(
    'frontend/app/resources/blog/page.tsx',
    'utf8'
  );

  // Find the year entry - look for the pattern from year to next year or end
  const yearStartPattern = new RegExp(`    ${year}: \\{`);
  const nextYearPattern = new RegExp(`    (\\d+): \\{`);

  const startMatch = content.match(yearStartPattern);
  if (!startMatch) {
    console.log(`No start match found for year ${year}`);
    return null;
  }

  const startIndex = startMatch.index + startMatch[0].length;

  // Find the end - either next year or the closing of blogPosts
  let endIndex = content.indexOf('  };', startIndex);
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
    return null;
  }

  return contentMatch[1];
}

// Extract content for all years from 1937 to 2025
const years = [];
for (let year = 1937; year <= 2025; year++) {
  years.push(year);
}

// Also include any other years that might exist
const content = fs.readFileSync('frontend/app/resources/blog/page.tsx', 'utf8');
const yearMatches = content.matchAll(/    (\d+): \{/g);
const allYears = Array.from(yearMatches)
  .map((match) => parseInt(match[1]))
  .filter((y) => y >= 1936);

console.log('Found years:', allYears);

for (const year of allYears) {
  if (year === 1936) continue; // Already done

  const yearContent = extractYearContent(year);
  if (yearContent) {
    const fileName = `frontend/app/resources/blog/content/${year}.ts`;
    const fileContent = `export default \`
${yearContent}
\`;`;

    fs.writeFileSync(fileName, fileContent);
    console.log(`Created ${fileName}`);
  }
}
