import React from 'react'

interface User {
  userId: string
  username: string
  selectContact: (userId: string) => void
  selectedUserId: string | null
  online: boolean
}

export default function OnlineUser({ userId, username, selectContact, selectedUserId, online }: User) {
  return (
    <div
      onClick={() => selectContact(userId)}
      className={`flex gap-3 pt-2 h-fit hover:cursor-pointer px-4 ${
        selectedUserId === userId ? 'bg-slate-600' : 'bg-slate-900'
      }`}>
      <section className="flex items-center relative">
        <div
          className={`w-[14px] h-[14px] rounded-full ${
            online ? 'bg-green-400' : 'bg-gray-500'
          }  border border-black border-opacity-70 absolute top-[43px] right-0`}></div>
        <span className="text-center w-[40px] h-[40px] bg-emerald-500 text-2xl pt-1 rounded-full">
          {username[0].toUpperCase()}
        </span>
      </section>
      <section className="w-full pb-3 border-b border-opacity-50 border-slate-500">
        <p className="flex flex-col justify-center text-2xl font-bold items-start">{username}</p>
        <p>Last message</p>
      </section>
    </div>
  )
}
