"use client";

import {
	AssistantRuntimeProvider,
	useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useMastraStoreAdapter } from "@/hooks/use-mastra-store-adapter";

export const MastraRuntimeProvider = ({
	threadId,
	children,
}: { threadId?: string; children: React.ReactNode }) => {
	const mastraAdapter = useMastraStoreAdapter(threadId);
	const runtime = useExternalStoreRuntime(mastraAdapter);

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			{children}
		</AssistantRuntimeProvider>
	);
};
