import { MastraClient } from "@mastra/client-js";

// export const runtime = "edge";
export const maxDuration = 30;

const client = new MastraClient({
	baseUrl: process.env.NEXT_PUBLIC_MASTRA_BASE_URL ?? "http://localhost:4111",
});

export async function POST(req: Request) {
	const body = await req.json();

	console.dir({ body }, { depth: Number.POSITIVE_INFINITY });

	const { messages, system, tools } = body;

	// console.dir({ messages, system, tools }, { depth: Number.POSITIVE_INFINITY });

	const agent = client.getAgent("mastraAgent");

	const result = await agent.stream({
		messages,
	});

	// console.dir({ result }, { depth: Number.POSITIVE_INFINITY });

	// result.processDataStream({
	// 	onToolCallPart: (toolCall) => {
	// 		console.log(toolCall);
	// 	},
	// 	onToolResultPart: (toolResult) => {
	// 		console.log(toolResult);
	// 	},
	// 	onTextPart: (text) => {
	// 		process.stdout.write(text);
	// 	},
	// 	onFilePart: (file) => {
	// 		console.log(file);
	// 	},
	// 	onDataPart: (data) => {
	// 		console.log(data);
	// 	},
	// 	onErrorPart: (error) => {
	// 		console.error(error);
	// 	},
	// });

	return result;
}
