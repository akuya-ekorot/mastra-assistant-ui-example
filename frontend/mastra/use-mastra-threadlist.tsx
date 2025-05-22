import type {
	ExternalStoreThreadData,
	ExternalStoreThreadListAdapter,
} from "@assistant-ui/react";
import { useMastraClient } from "./use-mastra-client";
import { useEffect, useState } from "react";

interface UseMastraThreadListArgs {
	agentId: string;
	baseUrl?: string;
	threadId: string;
	resourceId: string;
}

export const useMastraThreadList = (
	args: UseMastraThreadListArgs,
): ExternalStoreThreadListAdapter => {
	const [threads, setThreads] = useState<ExternalStoreThreadData<"regular">[]>(
		[],
	);
	const [archivedThreads, setArchivedThreads] = useState<
		ExternalStoreThreadData<"archived">[]
	>([]);

	const client = useMastraClient({ baseUrl: args.baseUrl });

	useEffect(() => {
		client
			.getMemoryThreads({ agentId: args.agentId, resourceId: args.resourceId })
			.then((threads) => {
				setThreads(
					threads
						.filter((thread) => !thread.metadata?.isArchived)
						.map((thread) => ({
							threadId: thread.id,
							title: thread.title,
							status: "regular",
						})),
				);
				setArchivedThreads(
					threads
						.filter((thread) => thread.metadata?.isArchived)
						.map((thread) => ({
							threadId: thread.id,
							title: thread.title,
							status: "archived",
						})),
				);
			});
	}, [client, args.agentId, args.resourceId]);

	return {
		threads,
		archivedThreads,
		threadId: args.threadId,
		onArchive(threadId) {
			console.log("onArchive", threadId);
		},
		onDelete(threadId) {
			console.log("onDelete", threadId);
		},
		onRename(threadId, newTitle) {
			console.log("onRename", threadId, newTitle);
		},
		onUnarchive(threadId) {
			console.log("onUnarchive", threadId);
		},
		onSwitchToNewThread() {
			console.log("onSwitchToNewThread");
		},
		onSwitchToThread(threadId) {
			console.log("onSwitchToThread", threadId);
		},
	};
};
