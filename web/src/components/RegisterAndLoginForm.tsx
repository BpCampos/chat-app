'use client'
import React, { FormEvent, useContext, useState } from 'react'
import { api } from '@/lib/api'
import { UserContext } from '@/context/UserContext'
import { redirect } from 'next/navigation'

export default function RegisterAndLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedOrRegistered, setIsLoggedOrRegistered] = useState('Register')
  const { setUsername: setLoggedInUser, username: loggedInUser, setId } = useContext(UserContext)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const url = isLoggedOrRegistered === 'Register' ? '/register' : '/login'
    const { data } = await api.post(url, { username, password })
    setLoggedInUser(username)
    setId(data.id)
  }

  if (loggedInUser) {
    redirect('/chat')
  }

  return (
    <div className="h-[100vh] w-full flex justify-center items-center font-poppins">
      <form className="bg-white flex flex-col w-1/5 h-fit p-6 gap-8 rounded-md justify-center" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-xl bg-emerald-300 w-[120px] py-1 text-center ">
            Username
          </label>
          <input
            value={username}
            className="border py-2 pl-2 focus:outline-none"
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            id="username"
            placeholder="Type your username"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-xl bg-emerald-300 w-[120px] py-1 text-center">
            Password
          </label>
          <input
            value={password}
            className="border py-2 pl-2 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name=""
            id="password"
            placeholder="Type your password"
          />
        </div>
        <button className="bg-emerald-300 text-3xl py-2 rounded-md hover:bg-emerald-400 duration-300" type="submit">
          {isLoggedOrRegistered}
        </button>
        {isLoggedOrRegistered === 'Register' ? (
          <div className="-mt-5">
            Already a user?
            <button
              onClick={() => setIsLoggedOrRegistered('Login')}
              type="button"
              className="text-emerald-400 hover:text-emerald-500 font-bold duration-200 ml-1">
              Login here
            </button>
          </div>
        ) : (
          <div className="-mt-5">
            Not registered?
            <button
              onClick={() => setIsLoggedOrRegistered('Register')}
              type="button"
              className="text-emerald-400 hover:text-emerald-500 font-bold duration-200 ml-1">
              Register here
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
