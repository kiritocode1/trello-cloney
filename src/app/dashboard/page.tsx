
import { FC, Suspense } from 'react'
import Image from 'next/image'


interface pageProps {
  
}
import { auth } from "@/auth";
import { KanbanBoard } from '@/components/KanbanBoard';

async function UserAvatar() {
    const session = await auth();

    if (typeof session === null  ) { return <div className='w-full min-h-screen'>{JSON.stringify(session)}</div> }
    return <div className='w-full min-h-screen'>
            <Image src={session?.user?.image!} alt="user avatar" width={100} height={100} />
        </div>
    
};





const page: FC<pageProps> = ({}) => {
    return (
		<div className="w-full min-h-screen">
			<UserAvatar />

			<Suspense fallback={<div>Loading...</div>}>
				<KanbanBoard />
			</Suspense>
		</div>
	);
}

export default page