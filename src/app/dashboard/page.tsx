import { FC, Suspense } from "react";
import Image from "next/image";

interface pageProps {}
import { auth } from "@/auth";
import { KanbanBoard } from "@/components/KanbanBoard";

async function UserAvatar() {
	const session = await auth();

	if (typeof session === null) {
		return <div className="w-full min-h-screen">{JSON.stringify(session)}</div>;
	}
	return (
		<div className="">
			<img
				src={session?.user?.image!}
				alt="user avatar"
				width={100}
        height={100}
        className="rounded-full"
      />
      
      {session?.user?.name!}
		</div>
	);
}

const page: FC<pageProps> = ({}) => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<div className="w-full min-h-screen">
				<UserAvatar />
				<KanbanBoard />
			</div>
		</Suspense>
	);
};

export default page;
