"use client";

import {
	AssistantRuntimeProvider,
	useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useMastraStoreAdapter } from "@/hooks/use-mastra-store-adapter";

export const MastraRuntimeProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const mastraAdapter = useMastraStoreAdapter();
	const runtime = useExternalStoreRuntime(mastraAdapter);

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			{children}
		</AssistantRuntimeProvider>
	);
};
