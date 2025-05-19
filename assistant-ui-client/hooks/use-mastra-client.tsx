import { useMemo } from "react";
import { MastraClient } from "@mastra/client-js";

export const MASTRA_AGENT_ID = "mastraAgent";

export const useMastraClient = () => {
	return useMemo(() => {
		const client = new MastraClient({
			baseUrl:
				process.env.NEXT_PUBLIC_MASTRA_BASE_URL ?? "http://localhost:4111",
		});
		return client;
	}, []);
};
