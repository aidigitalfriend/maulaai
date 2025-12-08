// SECURE AUTH UPGRADE PLAN
// ======================

// 1. UPDATE LOGIN ENDPOINT - Add HttpOnly Cookie
// frontend/app/api/auth/login/route.ts

export async function POST(request: NextRequest) {
  // ... existing login logic ...

  // Generate JWT token
  const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
    expiresIn: '7d',
  });

  // Create response with user data (NO TOKEN in response)
  const response = NextResponse.json({
    message: 'Login successful',
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      // NO TOKEN HERE
    },
  });

  // Set HttpOnly cookie (SECURE)
  response.cookies.set('auth_token', token, {
    httpOnly: true,           // ✅ Not accessible to JavaScript
    secure: true,             // ✅ HTTPS only
    sameSite: 'strict',       // ✅ CSRF protection
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });

  return response;
}

// 2. UPDATE AUTH STORAGE - Remove localStorage usage
// frontend/lib/auth-storage-secure.ts

export const secureAuthStorage = {
  // ✅ NO localStorage usage for tokens
  setUser: (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user)); // User data is safe
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // ✅ Token verification via server call only
  verifySession: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include', // Includes HttpOnly cookies
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  clearSession: () => {
    localStorage.removeItem(USER_KEY);
    // Token cleared via logout endpoint
  }
};

// 3. UPDATE AUTH CONTEXT - Remove client-side token handling
// frontend/contexts/AuthContext-secure.tsx

const checkExistingSession = async () => {
  try {
    dispatch({ type: 'AUTH_START' });

    // ✅ Only verify session via server (HttpOnly cookie sent automatically)
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      credentials: 'include', // Sends HttpOnly cookie
    });

    if (response.ok) {
      const data = await response.json();
      if (data.valid && data.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        secureAuthStorage.setUser(data.user);
        return;
      }
    }

    // No valid session
    dispatch({ type: 'AUTH_LOGOUT' });
    secureAuthStorage.clearSession();
  } catch (error) {
    dispatch({ type: 'AUTH_LOGOUT' });
  }
};

// 4. UPDATE API MIDDLEWARE - Read HttpOnly cookies
// frontend/middleware.ts

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  
  // Verify token for protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    try {
      jwt.verify(token, JWT_SECRET);
      // Valid token, continue
    } catch {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }
  
  return NextResponse.next();
}

// 5. UPDATE AUTH VERIFY ENDPOINT
// frontend/app/api/auth/verify/route.ts

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Get user data from database
    await dbConnect();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}