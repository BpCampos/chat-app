'use client'
import { useEffect, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'

export default function Chat() {
  const [ws, setWs] = useState<null | WebSocket>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3030')
    setWs(ws)
  }, [])

  return (
    <div className="flex">
      <section className="w-1/4 h-[100vh] border-r border-black bg-slate-600 text-white">
        <div className="flex justify-around border-black h-16 items-center border border-r-0">
          <div className="flex-1">
            <p className="flex-1 text-center border-black font-bold text-xl hover:cursor-pointer">Groups</p>
          </div>
          <p className="h-full border border-black"></p>
          <div className="flex-1 bg-slate-500 h-full flex justify-center items-center">
            <p className=" text-center border-black font-bold text-xl hover:cursor-pointer">Contacts</p>
          </div>
        </div>
      </section>
      <section className="w-3/4 h-[100vh] flex flex-col">
        <div className="h-16 border border-l-0 border-black pl-8 bg-slate-600 text-white flex items-center">
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
  )
}
