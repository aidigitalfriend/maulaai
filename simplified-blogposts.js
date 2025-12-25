const years = [1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1953,1955,1957,1959,1961,1963,1965,1967,1969,1971,1973,1975,1977,1979,1981,1983,1985,1986,1987,1989,1991,1993,1995,1997,2012,2023,2024,2025];

const blogPosts = {};
years.forEach((year, index) => {
  blogPosts[year] = {
    id: index,
    year: year,
    title: `AI History ${year}`,
    excerpt: `Key developments in artificial intelligence during ${year}.`,
    author: 'AI History Research Team',
    date: 'December 15, 2025',
    tags: ['AI History'],
    references: []
  };
});

console.log(JSON.stringify(blogPosts, null, 2));
