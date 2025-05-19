import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { getWeather } from "../tools/get-weather";
import { memory } from "../memory/memory";

export const mastraAgent = new Agent({
	name: "mastraAgent",
	instructions:
		"You are a helpful assistant. You have access to the following tools: getWeather(location: string).",
	model: anthropic("claude-3-7-sonnet-20250219"),
	tools: { getWeather },
	memory,
});
