
import { KanbanBoard } from "@/components/KanbanBoard";
import { SignIn } from "@/components/signin";
import { Suspense } from "react";

export default function Home() {
  return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignIn />
      <Suspense fallback={<div>Loading...</div>}>
        <KanbanBoard />
        
      </Suspense>
		</main>
  );
}
