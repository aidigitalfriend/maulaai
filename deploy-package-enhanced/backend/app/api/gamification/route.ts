// Next.js App Router placeholder to avoid build errors.
// Real Gamification API is served by the Express server (server-simple.js) at /api/gamification/*.

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  })
}

export async function GET() {
  return json(501, {
    success: false,
    error: 'Gamification API is provided by the Express server at /api/gamification/*'
  })
}

export async function POST() {
  return json(501, {
    success: false,
    error: 'Gamification API is provided by the Express server at /api/gamification/*'
  })
}

export async function PUT() {
  return json(501, {
    success: false,
    error: 'Gamification API is provided by the Express server at /api/gamification/*'
  })
}

export async function DELETE() {
  return json(501, {
    success: false,
    error: 'Gamification API is provided by the Express server at /api/gamification/*'
  })
}
