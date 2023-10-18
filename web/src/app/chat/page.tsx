'use client'
import { useEffect, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'

interface User {
  userId: string
  username: string
}

export default function Chat() {
  const [ws, setWs] = useState<null | WebSocket>(null)
  const [onlinePeople, setOnlinePeople] = useState<any>({})

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3030')
    setWs(ws)
    ws.addEventListener('message', handleMessage)
  }, [])

  function showOnlinePeople(peopleArray: User[]) {
    const people: any = {}
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username
    })
    setOnlinePeople(people)
  }

  function handleMessage(e: any) {
    const messageData = JSON.parse(e.data)
    if (messageData.online) {
      showOnlinePeople(messageData.online)
    }
  }

  return (
    <div className="bg-emerald-100">
      <div className="flex w-[1660px] mx-auto border-black border">
        <section className="w-1/4 h-[100vh] border-r border-black bg-slate-700 text-white overflow-hidden">
          <div className="h-16 border-black border-b">
            <h1 className="h-full flex items-center text-4xl font-bold justify-center pb-2 bg-slate-900">Pappo</h1>
          </div>
          <div className="flex justify-around border-black h-16 items-center border-b">
            <div className="flex-1">
              <p className="flex-1 text-center border-black font-bold text-xl hover:cursor-pointer">Groups</p>
            </div>
            <p className="h-full border border-black"></p>
            <div className="flex-1 bg-slate-500 h-full flex justify-center items-center">
              <p className=" text-center border-black font-bold text-xl hover:cursor-pointer">Contacts</p>
            </div>
          </div>
          {Object.keys(onlinePeople).map((userId: any) => {
            return (
              <div className="w-full bg-slate-700 h-14  border-b border-black flex gap-3 pl-2" key={userId}>
                <section>Photo</section>
                <section className="h-full w-full pl-2">
                  <p className="flex flex-col justify-center text-2xl font-bold items-start">{onlinePeople[userId]}</p>
                  <p>Last message</p>
                </section>
              </div>
            )
          })}
        </section>
        <section className="w-full h-[100vh] flex flex-col">
          <div className="h-16 border-b border-black pl-8 bg-slate-700 text-white flex items-center">
            <p className="w-fit text-2xl font-bold">Contact name</p>
          </div>
          <div className="flex-1 bg-emerald-200"></div>
          <div className="flex bg-emerald-400 h-14 items-center justify-around">
            <div className="font-bold text-xl w-fit px-3 hover:cursor-pointer">Add File</div>
            <form className="w-[90%] flex gap-4" action="">
              <input
                className="py-1.5 rounded-2xl w-full pl-3 text-lg focus:outline-none"
                type="text"
                placeholder="Digite sua mensagem"
              />
              <button className=" right-10 bottom-3.5 font-bold text-3xl text-white bg-emerald-500 px-2">
                <AiOutlineSend />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
