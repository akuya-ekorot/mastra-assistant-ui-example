import type {
	ExternalStoreThreadData,
	ExternalStoreThreadListAdapter,
} from "@assistant-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MASTRA_AGENT_ID, useMastraClient } from "./use-mastra-client";

export const useMastraThreadListAdapter = (
	currentThread: string,
): ExternalStoreThreadListAdapter => {
	const [threads, setThreads] = useState<
		readonly ExternalStoreThreadData<"regular">[]
	>([]);
	const [threadId, setThreadId] = useState(currentThread);
	const [archivedThreads, setArchivedThreads] = useState<
		readonly ExternalStoreThreadData<"archived">[]
	>([]);

	const client = useMastraClient();

	useEffect(() => {
		const fetchThreads = () =>
			client
				.getMemoryThreads({
					resourceId: "default-resource",
					agentId: MASTRA_AGENT_ID,
				})
				.then((value) => {
					console.log("threads", value);
					setThreads(
						value
							.filter((t) => !t.metadata?.isArchived)
							.map((thread) => ({
								threadId: thread.id,
								title: thread.title,
								status: "regular",
							})),
					);
					setArchivedThreads(
						value
							.filter((t) => t.metadata?.isArchived)
							.map((thread) => ({
								threadId: thread.id,
								title: thread.title,
								status: "archived",
							})),
					);
				});

		fetchThreads();
	}, [client]);

	const onArchive = useCallback(
		async (threadId: string) => {
			const thread = client.getMemoryThread(threadId, MASTRA_AGENT_ID);
			const threadData = await thread.get();

			const updatedThread = await thread.update({
				title: threadData.title ?? "",
				resourceId: "default-resource",
				metadata: {
					isArchived: true,
				},
			});

			setThreads((prev) => prev.filter((t) => t.threadId !== threadId));
			setArchivedThreads((prev) => [
				...prev,
				{
					threadId: updatedThread.id,
					title: updatedThread.title,
					status: "archived",
				},
			]);
		},
		[client],
	);

	const onUnarchive = useCallback((threadId: string) => {}, []);
	const onDelete = useCallback((threadId: string) => {}, []);
	const onRename = useCallback((threadId: string, newTitle: string) => {}, []);
	const onSwitchToNewThread = useCallback(() => {}, []);
	const onSwitchToThread = useCallback((threadId: string) => {}, []);

	return {
		threads,
		threadId,
		archivedThreads,
		onArchive,
		onDelete,
		onRename,
		onUnarchive,
		onSwitchToNewThread,
		onSwitchToThread,
	};
};
