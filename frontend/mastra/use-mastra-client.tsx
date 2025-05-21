import { useMemo } from "react";
import { MastraClient } from "@mastra/client-js";

interface UseMastraClientArgs {
	/**
	 * optional base url for the mastra server, defaults to process.env.NEXT_PUBLIC_MASTRA_BASE_URL or http://localhost:4111
	 */
	baseUrl?: string;
}
export const useMastraClient = (args: UseMastraClientArgs) => {
	return useMemo(
		() =>
			new MastraClient({
				baseUrl:
					args.baseUrl ??
					process.env.NEXT_PUBLIC_MASTRA_BASE_URL ??
					"http://localhost:4111",
				retries: 3,
				backoffMs: 100,
				maxBackoffMs: 5000,
			}),
		[args.baseUrl],
	);
};
