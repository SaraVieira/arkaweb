import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Editor = import.meta.env.DEV
	? lazy(() => import("#/dev/editor").then((m) => ({ default: m.Editor })))
	: null;

function EditorRoute() {
	if (!Editor) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-black text-white">
				Not found
			</div>
		);
	}
	return (
		<Suspense
			fallback={
				<div className="flex h-screen w-screen items-center justify-center bg-black text-white">
					Loading editor…
				</div>
			}
		>
			<Editor />
		</Suspense>
	);
}

export const Route = createFileRoute("/editor")({
	component: EditorRoute,
	ssr: false,
});
