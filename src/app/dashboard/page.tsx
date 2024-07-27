import { FC } from 'react'
import Image from 'next/image'
interface pageProps {
  
}
import { auth } from "@/auth";

async function UserAvatar() {
    const session = await auth();


        return <div className='w-full min-h-screen'>{JSON.stringify(session)}</div>
    
};





const page: FC<pageProps> = ({}) => {
    return <div className='w-full min-h-screen'>
      <UserAvatar />
  </div>
}

export default page