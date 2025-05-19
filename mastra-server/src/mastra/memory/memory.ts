import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";

export const storage = new LibSQLStore({
	url: "file:../../memory.db",
});

export const memory = new Memory({
	options: {
		lastMessages: 10,
		semanticRecall: false,
		threads: {
			generateTitle: true,
		},
	},
	storage,
});
