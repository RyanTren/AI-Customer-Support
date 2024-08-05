import { NextResponse } from "next/server"

export default function POST(req){
    // console.log('POST /api/chat')
    console.log(req.json())
    return NextResponse.json({message: 'Hello from the server!'})
}