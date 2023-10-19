import React from 'react'

interface User {
  userId: string
  username: string
  selectContact: (userId: string) => void
  selectedUserId: string | null
}

export default function OnlineUser({ userId, username, selectContact, selectedUserId }: User) {
  return (
    <div
      onClick={() => selectContact(userId)}
      className={`flex gap-3 pt-2 h-fit hover:cursor-pointer px-4 ${
        selectedUserId === userId ? 'bg-slate-600' : 'bg-slate-900'
      }`}>
      <section className="flex items-center ">
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
