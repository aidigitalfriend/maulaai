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
