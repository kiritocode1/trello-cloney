import { FC } from 'react'



interface pageProps {
  
}
import { auth } from "@/auth";

async function UserAvatar() {
    const session = await auth();

    if (typeof session === null  ) { return <div className='w-full min-h-screen'>{JSON.stringify(session)}</div> }
    return <div className='w-full min-h-screen'>
            <img src={session?.user?.image!} alt="user avatar" width={100} height={100} />
        </div>
    
};





const page: FC<pageProps> = ({}) => {
    return <div className='w-full min-h-screen'>
      <UserAvatar />
  </div>
}

export default page