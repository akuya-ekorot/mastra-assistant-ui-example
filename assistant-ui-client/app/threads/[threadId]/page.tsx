import { Assistant } from "@/app/assistant";

export default async function ThreadPage({
	params,
}: { params: Promise<{ threadId: string }> }) {
	const threadId = (await params).threadId;
	return <Assistant threadId={threadId} />;
}
