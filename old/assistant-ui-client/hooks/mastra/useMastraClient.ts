import { useMemo } from "react";
import { MastraClient } from "@mastra/client-js";

/**
 *
 * @param baseUrl - The base URL of the Mastra API. Defaults to process.env.NEXT_PUBLIC_MASTRA_BASE_URL or "http://localhost:4111".
 * @returns A memoized MastraClient instance.
 */
export const useMastraClient = (baseUrl?: string) => {
	return useMemo(
		() =>
			new MastraClient({
				baseUrl:
					baseUrl ??
					process.env.NEXT_PUBLIC_MASTRA_BASE_URL ??
					"http://localhost:4111",
				retries: 3,
				backoffMs: 300,
				maxBackoffMs: 5000,
			}),
		[baseUrl],
	);
};
