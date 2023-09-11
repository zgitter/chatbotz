import { NextResponse } from 'next/server';
//import dotenv from 'dotenv';
//dotenv.config();

const apiKey = process.env.API_KEY;


export async function POST(req: Request, res: NextResponse) {

	const body = await req.json()

	let last = Object.keys(body.messages).length - 1;

	let qsn = 
	
	{"inputs": {
		"text": (body.messages[last]).content
	}}

	let ansr = {
        content: "wzf!",
        role: "assistant"
      }

	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
		{
			headers: { Authorization: "Bearer "+apiKey },
			method: "POST",
			body: JSON.stringify(qsn),
		}
	);


	const result = await response.json();

	ansr.content = result.generated_text;


	console.log(body.messages[last]);

	return NextResponse.json({output: ansr}, { status: 200 })
}