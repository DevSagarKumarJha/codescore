import React from 'react'
import LogoutButton from '../components/Buttons/LogoutButton'
import { useAuthStore } from '../store/useAuthStore'


const HomePage = () => {
  const {authUser} = useAuthStore();
  return (
    <div>
      <h1>Home Page</h1>
      <p>Hello, {authUser?.name}</p>
      <LogoutButton/>
    </div>
  )
}

export default HomePage