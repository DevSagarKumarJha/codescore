import React from 'react'
import LogoutButton from '../components/Buttons/LogoutButton'
import { useAuthStore } from '../store/useAuthStore'


const HomePage = () => {
  const {authUser} = useAuthStore();
  return (
    <div className='min-h-screen flex flex-col items-center mt-14 px-4'>

    </div>
  )
}

export default HomePage