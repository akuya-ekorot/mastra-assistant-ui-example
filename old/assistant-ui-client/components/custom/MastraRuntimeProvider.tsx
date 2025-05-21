"use client";

import {
	AssistantRuntimeProvider,
	useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useMastraStoreAdapter } from "@/hooks/use-mastra-store-adapter";
import { useMastraRuntime } from "@/hooks/mastra/useMastraRuntime";

export const MastraRuntimeProvider = ({
	threadId,
	children,
}: { threadId?: string; children: React.ReactNode }) => {
	// const mastraAdapter = useMastraStoreAdapter(threadId);
	// const runtime = useExternalStoreRuntime(mastraAdapter);
	const runtime = useMastraRuntime({
		adapters: {},
		onError: console.error,
		config: {
			agentId: "mastraAgent",
			resourceId: "default-resource",
			threadId: "default-thread",
		},
	});

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			{children}
		</AssistantRuntimeProvider>
	);
};
