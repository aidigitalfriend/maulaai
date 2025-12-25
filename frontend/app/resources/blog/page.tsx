'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation'
import { BlogPost } from '@/app/constants';

// Define blogPosts with available years
const years = [1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1953,1955,1957,1959,1961,1963,1965,1967,1969,1971,1973,1975,1977,1979,1981,1983,1985,1986,1987,1989,1991,1993,1995,1997,2012,2023,2024,2025];

const blogPosts: Record<number, BlogPost> = {};
years.forEach((year, index) => {
  blogPosts[year] = {
    id: index,
    year: year,
    title: `AI History ${year}`,
    excerpt: `Key developments in artificial intelligence during ${year}.`,
    author: 'AI History Research Team',
    date: 'December 15, 2025',
    tags: ['AI History'],
    references: [],
    content: ''
  };
});

const BlogPage: React.FC = () => {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState<number>(1936);
  const [blogContent, setBlogContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to content on mobile when year changes
  useEffect(() => {
    if (contentRef.current && window.innerWidth < 1024) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedYear])

  // Load content dynamically when year changes
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const modulePath = `./content/${selectedYear}.ts`;
        const contentModule = await import(modulePath);
        setBlogContent(contentModule.default);
      } catch (error) {
        console.error(`Failed to load content for year ${selectedYear}:`, error);
        setBlogContent('<div class="text-center text-gray-500">Content not available for this year.</div>');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [selectedYear]);

  // Function to determine the era based on year
  const getEra = (year: number | string | undefined) => {
    if (!year) return { name: 'Modern', color: 'bg-teal-500', icon: '🤖' };
    
    // Convert string years to number if needed (take the first year if range)
    const yearNum = typeof year === 'string' ? parseInt(year.split('-')[0]) : year;
    
    if (yearNum >= 1936 && yearNum <= 1955) return { name: 'Foundations', color: 'bg-purple-500', icon: '🧮' };
    if (yearNum >= 1956 && yearNum <= 1969) return { name: 'Birth of AI', color: 'bg-blue-500', icon: '🧠' };
    if (yearNum >= 1970 && yearNum <= 1979) return { name: 'Expert Systems', color: 'bg-green-500', icon: '💡' };
    if (yearNum >= 1980 && yearNum <= 1989) return { name: 'AI Winter', color: 'bg-gray-500', icon: '❄️' };
    if (yearNum >= 1990 && yearNum <= 1999) return { name: 'Revival', color: 'bg-orange-500', icon: '🔥' };
    if (yearNum >= 2000 && yearNum <= 2009) return { name: 'Data Era', color: 'bg-cyan-500', icon: '📊' };
    if (yearNum >= 2010 && yearNum <= 2019) return { name: 'Deep Learning', color: 'bg-indigo-500', icon: '🚀' };
    if (yearNum >= 2020 && yearNum <= 2025) return { name: 'Transformers', color: 'bg-pink-500', icon: '✨' };
    return { name: 'Modern', color: 'bg-teal-500', icon: '🤖' };
  };

  // Sample blog posts metadata - content loaded dynamically
  const blogPosts: { [key: number]: Omit<BlogPost, 'content'> } = {
    1936: {
      id: 0,
      year: 1936,
      title: "Alan Turing's Revolutionary Paper: The Birth of Computational Theory",
      excerpt: "Alan Turing's groundbreaking 1936 paper 'On Computable Numbers' laid the mathematical foundation for all modern computation and artificial intelligence, defining what machines can and cannot compute.",
      author: 'AI History Research Team',
      date: 'December 15, 2025',
      tags: ['Alan Turing', 'Turing Machine', 'Computational Theory', 'Entscheidungsproblem'],
      references: [
        'Turing, A. M. (1936). On computable numbers, with an application to the Entscheidungsproblem. Proceedings of the London Mathematical Society, 42(2), 230-265.',
        'Copeland, B. J. (2004). The Essential Turing: Seminal Writings in Computing, Logic, Philosophy, Artificial Intelligence, and Artificial Life. Oxford University Press.',
        'Hodges, A. (2012). Alan Turing: The Enigma. Princeton University Press.',
        'Davis, M. (2000). The Universal Computer: The Road from Leibniz to Turing. W. W. Norton & Company.',
        'Petzold, C. (2008). The Annotated Turing: A Guided Tour Through Alan Turing\'s Historic Paper on Computability and the Turing Machine. Wiley.'
      ]
    },
    1937: {
      id: 1,
      year: 1937,
      title: "The Year of the First Logical Machines",
      excerpt: "1937 marked the transition from theoretical computation to mechanical and electronic design, making real machines that could think and compute through Shannon's circuits, Turing's prototypes, and Zuse's Z1.",
      author: 'AI History Research Team',
      date: 'December 15, 2025',
      tags: ['Claude Shannon', 'Boolean Circuits', 'Turing Machine', 'Konrad Zuse', 'Z1 Computer'],
      references: [
        'Shannon, C. E. (1937). A Symbolic Analysis of Relay and Switching Circuits. MIT Master\'s Thesis.',
        'Turing, A. M. (1936-1937). On Computable Numbers. Proceedings of the London Mathematical Society.',
        'Zuse, K. (1937-1938). Z1 Computer Project. Zuse-Institut Berlin Archives.',
        'Church, A. (1937). Review of Turing\'s Computable Numbers. Journal of Symbolic Logic.',
        'Kleene, S. C. (1937). General Recursive Functions of Natural Numbers. American Journal of Mathematics, Vol. 59.'
      ]
    }
  };

  // Helper function to get post by year (handles both regular and misplaced entries)
  const getPostByYear = (year: number) => {
    const post = blogPosts[year];
    if (post) {
      return {
        ...post,
        content: blogContent
      };
    }
    
    // Check misplaced entries (string years like '1999-2000')
    const misplacedEntries = Object.values(blogPosts).filter(post => 
      typeof post.year === 'string' && post.year.includes('-')
    );
    
    for (const entry of misplacedEntries) {
      const yearRange = entry.year as string;
      const [startYear] = yearRange.split('-').map(y => parseInt(y));
      if (startYear === year) {
        return { ...entry, year: year }; // Return with numeric year
      }
    }
    
    // Finally check for posts with correct numeric year but stored under different keys (like sequential IDs)
    const allEntries = Object.values(blogPosts);
    for (const entry of allEntries) {
      if (typeof entry.year === 'number' && entry.year === year) {
        return entry;
      }
    }
    
    return null;
  };
    
    return null;
  };

  // Generate year entries based on which years actually have blog posts
  const generateYearEntries = () => {
    const entries: { year: number; display: string; isSpan: boolean }[] = [];
    
    // Get all available years from regular blogPosts
    const availableYears = Object.keys(blogPosts)
      .map(y => parseInt(y))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);
    
    // Add years from misplaced entries (string years like '1999-2000')
    const misplacedEntries = Object.values(blogPosts).filter(post => 
      typeof post.year === 'string' && post.year.includes('-')
    );
    
    for (const entry of misplacedEntries) {
      const yearRange = entry.year as string;
      const [startYear] = yearRange.split('-').map(y => parseInt(y));
      if (!isNaN(startYear) && !availableYears.includes(startYear)) {
        availableYears.push(startYear);
      }
    }
    
    // Add years from posts with numeric years but stored under different keys
    const allEntries = Object.values(blogPosts);
    for (const entry of allEntries) {
      if (typeof entry.year === 'number' && !availableYears.includes(entry.year)) {
        availableYears.push(entry.year);
      }
    }
    
    availableYears.sort((a, b) => a - b);
    
    for (const year of availableYears) {
      if (year >= 1936 && year <= 1950) {
        // Individual years 1936-1950
        entries.push({ year, display: year.toString(), isSpan: false });
      } else if (year >= 1951 && year <= 2020 && year % 2 === 1) {
        // Paired years for odd years from 1951-2019 (representing 2-year spans)
        const endYear = year + 1;
        entries.push({ 
          year, 
          display: `${year}-${endYear}`, 
          isSpan: true 
        });
      } else if (year >= 2021) {
        // Individual years from 2021 onwards
        entries.push({ year, display: year.toString(), isSpan: false });
      }
      // Skip other years that don't fit the pattern
    }
    
    return entries;
  };

  const yearEntries = generateYearEntries();
  const currentPost = getPostByYear(selectedYear);
  const era = getEra(selectedYear);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-5rem)]">
        {/* Left Sidebar - Years Panel (Mobile: Grid at top, Desktop: Sidebar) */}
        <div className="w-full lg:w-80 ca-glass-primary border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col max-h-[40vh] lg:max-h-none">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-white/10">
            <h2 className="text-xl lg:text-2xl font-bold ca-text-primary">AI History Timeline</h2>
            <p className="text-xs lg:text-sm ca-text-secondary mt-2">Explore 85+ years of artificial intelligence development</p>
          </div>
          
          {/* Year List */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2">
            {yearEntries.map((entry) => {
              const yearEra = getEra(entry.year);
              const isSelected = selectedYear === entry.year;
              const hasPost = getPostByYear(entry.year);
              
              return (
                <button
                  key={entry.year}
                  onClick={() => setSelectedYear(entry.year)}
                  disabled={!hasPost}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ca-magnetic ${
                    isSelected
                      ? 'ca-glass-hover ca-text-primary border border-white/20 shadow-lg'
                      : hasPost
                      ? 'ca-glass-secondary hover:ca-glass-hover ca-text-secondary hover:ca-text-primary'
                      : 'ca-glass-secondary ca-text-secondary opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex lg:items-center justify-between flex-col lg:flex-row items-start">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <span className={`${yearEra.color} text-white w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                        {yearEra.icon}
                      </span>
                      <div>
                        <div className="font-bold text-sm lg:text-lg">{entry.display}</div>
                        <div className="text-xs opacity-75 hidden lg:block">{yearEra.name}</div>
                      </div>
                    </div>
                    {hasPost && (
                      <div className="w-2 h-2 rounded-full bg-teal-400 mt-1 lg:mt-0"></div>
                    )}
                  </div>
                </button>
              );
            })}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-3 lg:p-4 border-t border-white/10">
            <button 
              onClick={() => router.push('/')} 
              className="w-full ca-btn-secondary ca-magnetic text-center text-sm lg:text-base"
            >
              <i className="fas fa-home mr-2"></i>Back to Home
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div ref={contentRef} className="flex-1 flex flex-col scroll-mt-4 min-h-screen lg:min-h-0">
          {currentPost ? (
            <>
              {/* Content Header */}
              <div className="p-4 lg:p-6 ca-glass-primary border-b border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-2 lg:space-x-3 flex-wrap gap-2">
                    <span className={`${era.color} text-white px-2 lg:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      <span>{era.icon}</span>
                      <span className="hidden sm:inline">{era.name}</span>
                    </span>
                    <span className="font-bold text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm shadow-md" style={{ 
                      background: 'linear-gradient(135deg, var(--ca-teal), var(--ca-amber))',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {currentPost.year}
                    </span>
                  </div>
                  <div className="text-xs lg:text-sm ca-text-secondary">
                    {currentPost.date} • By {currentPost.author}
                  </div>
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold ca-text-primary mb-3 lg:mb-4">{currentPost.title}</h1>
                <p className="ca-text-secondary text-base lg:text-lg">{currentPost.excerpt}</p>
                
                {currentPost.tags && (
                  <div className="flex flex-wrap gap-2 mt-3 lg:mt-4">
                    {currentPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="ca-text-secondary px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm"
                        style={{ background: 'var(--ca-glass-bg)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div 
                  className="prose prose-invert prose-sm lg:prose-lg max-w-none text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentPost.content }} 
                />
                
                {currentPost.references && currentPost.references.length > 0 && (
                  <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-800">
                    <h3 className="text-base lg:text-lg font-semibold ca-text-primary mb-3 lg:mb-4">References</h3>
                    <ul className="space-y-2">
                      {currentPost.references.map((ref, index) => (
                        <li key={index} className="text-xs lg:text-sm ca-text-secondary">
                          {index + 1}. {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center ca-text-secondary">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold mb-2">No Content Available</h2>
                <p>Content for {selectedYear} is coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .prose-invert h1, .prose-invert h2, .prose-invert h3, .prose-invert h4, .prose-invert h5, .prose-invert h6, .prose-invert strong { color: #fff; }
        .prose-invert a { color: #67e8f9; }
        .prose-invert a:hover { color: #22d3ee; }
        .prose-invert blockquote { border-left-color: #0891b2; color: #9ca3af; }
        .prose-invert p { color: #d1d5db; }
      `}</style>
    </div>
  );
};

export default BlogPage;