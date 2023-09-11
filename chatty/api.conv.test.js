import { NextResponse } from 'next/server';

export async function POST(req: Request, res: NextResponse) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(req),
		}
	);
	const result = await response.json();

	return NextResponse.json({output: result.generated_response}, { status: 200 })
}