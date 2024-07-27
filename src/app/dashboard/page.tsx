import { FC } from 'react'
import Image from 'next/image'
interface pageProps {
  
}
import { auth } from "@/auth";

async function UserAvatar() {
    const session = await auth();
    if (session?.user?.image) { 
        return <Image src={session.user.image} alt="avatar" className="w-12 h-12 rounded-full" />
    }
    return <div className="w-12 h-12 rounded-full bg-gray-200">No</div>
}





const page: FC<pageProps> = ({}) => {
    return <div className='w-full min-h-screen'>
      <UserAvatar />
  </div>
}

export default page