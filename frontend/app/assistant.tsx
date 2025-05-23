"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useMastraRuntime } from "@/mastra/use-mastra-runtime";
import { WeatherToolUI } from "@/components/custom/weather-tool-ui";
import { useState } from "react";

export const Assistant = () => {
	/**
	 * TODO: Global way to set the resourceId and the agentID
	 * - agentId could be set as a config
	 * - resourceId could be dynamically set. e.g userId from authentication mechanisms
	 */

	/**
	 * TODO: ThreadId could be set dynamically once threads are fetched, or left undefined for a newThread
	 * disable messages fetching if threadId is undefined
	 */
	const [threadId, setThreadId] = useState("default");

	const runtime = useMastraRuntime({
		agentId: "mastraAgent",
		resourceId: "new-default-resource",
		threadId,
		setThreadId,
	});

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">
										Build Your Own ChatGPT UX
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Starter Template</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</header>
					<Thread />
					<WeatherToolUI />
				</SidebarInset>
			</SidebarProvider>
		</AssistantRuntimeProvider>
	);
};
