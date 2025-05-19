"use client";

import { AssistantRuntimeProvider, useThreadList } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
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
import { WeatherToolUI } from "@/components/custom/weather-tool-ui";
import { ScratchComponent } from "@/components/custom/scratch-component";
import { MastraRuntimeProvider } from "@/components/custom/MastraRuntimeProvider";

export const Assistant = () => {
	return (
		<MastraRuntimeProvider>
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
					<ScratchComponent />
					<Thread />
				</SidebarInset>
			</SidebarProvider>
			<WeatherToolUI />
		</MastraRuntimeProvider>
	);
};
