import { Mastra } from "@mastra/core";
import { mastraAgent } from "./agents/mastra-agent";
import { storage } from "./memory/memory";
import { cors } from "hono/cors";

export const mastra = new Mastra({
	agents: { mastraAgent },
	storage,
	server: {
		cors: {
			origin: "*",
			allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: false,
		},
	},
});
