import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getWeather = createTool({
	id: "getWeather",
	description: "Get the weather for a given location.",
	inputSchema: z.object({
		location: z.string().describe("The location to get the weather for."),
	}),
	execute: async ({ context: { location } }) => {
		const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
		await delay(5000);
		return `The weather in ${location} is sunny.`;
	},
});
