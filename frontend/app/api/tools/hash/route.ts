import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest){
  try{
    const { data, key } = await req.json()
    // data is an array of bytes
    const buf = Buffer.from(new Uint8Array(data))
    const md5 = crypto.createHash('md5').update(buf).digest('hex')
    let hmac: string | undefined
    if(key){
      hmac = crypto.createHmac('sha256', key).update(buf).digest('hex')
    }
    return NextResponse.json({ md5, hmac })
  }catch(e:any){
    return NextResponse.json({ error: e.message || 'Failed to hash' }, { status: 400 })
  }
}
