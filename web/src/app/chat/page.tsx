'use client'
import OnlineUser from '@/components/OnlineUser'
import { useEffect, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'
import { BsChatLeftText } from 'react-icons/bs'
import { uniqBy } from 'lodash'

interface User {
  userId: string
  username: string
}

export default function Chat() {
  const [ws, setWs] = useState<any | WebSocket>(null)
  const [onlinePeople, setOnlinePeople] = useState<any>({})
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessageText, setNewMessageText] = useState('')
  const [messages, setMessages] = useState<string[]>([])

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
    } else if ('text' in messageData) {
      setMessages((prev: any) => [...prev, { isOur: false, text: messageData.text }])
    }
  }

  function selectContact(userId: string) {
    setSelectedUserId(userId)
  }

  function sendMessage(e: any) {
    e.preventDefault()
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    )
    setNewMessageText('')
    setMessages((prev: any) => [...prev, { text: newMessageText, isOur: true }])
  }

  const messagesWithoutDupes = uniqBy(messages, 'id')

  return (
    <div className="bg-emerald-100">
      <div className="flex max-w-[1660px] h-[100vh] mx-auto border-slate-500 border">
        <section className="w-1/4 border-r border-black bg-slate-900 text-white overflow-hidden flex flex-col">
          <div className="h-16 border-black border-b bg-slate-700 flex items-center text-3xl justify-center gap-5 pr-7">
            <div className="pt-4">
              <BsChatLeftText />
            </div>
            <h1 className="text-4xl font-bold">Pappo</h1>
          </div>
          <div className="flex justify-around h-16 items-center border-b border-slate-700">
            <div className="flex-1">
              <p className="text-center font-bold text-xl hover:cursor-pointer">Groups</p>
            </div>
            <p className="h-full border border-black"></p>
            <div className="flex-1 bg-slate-500 h-full flex justify-center items-center">
              <p className=" text-center border-black font-bold text-xl hover:cursor-pointer">Contacts</p>
            </div>
          </div>
          {Object.keys(onlinePeople).map((userId: any) => {
            return (
              <OnlineUser
                key={userId}
                selectedUserId={selectedUserId}
                selectContact={selectContact}
                userId={userId}
                username={onlinePeople[userId]}
              />
            )
          })}
        </section>
        {selectedUserId ? (
          <section className="w-full h-full flex flex-col">
            <div className="h-16 border-b border-black pl-8 bg-slate-700 text-white flex items-center">
              <p className="w-fit text-2xl font-bold">{`${selectedUserId ? onlinePeople[selectedUserId] : ''}`}</p>
            </div>
            <div className="flex-1 bg-emerald-200">
              {messagesWithoutDupes.map((message: any) => {
                return (
                  <div key={selectedUserId} className={`flex ${message.isOur ? 'justify-end' : ''}`}>
                    <p className="text-xl bg-emerald-400 w-fit p-2 mx-4 my-7 rounded-lg">{message.text}</p>
                  </div>
                )
              })}
            </div>
            <div className="flex bg-emerald-400 h-14 items-center justify-around">
              <div className="font-bold text-xl w-fit px-3 hover:cursor-pointer">Add File</div>
              <form className="w-[90%] flex gap-4" onSubmit={sendMessage}>
                <input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="py-1.5 rounded-2xl w-full pl-3 text-lg focus:outline-none"
                  type="text"
                  placeholder="Digite sua mensagem"
                />
                <button
                  type="submit"
                  className=" right-10 bottom-3.5 font-bold text-3xl text-white bg-emerald-500 px-2">
                  <AiOutlineSend />
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section className="w-full h-full flex justify-center items-center bg-emerald-200">
            <p className="text-4xl opacity-50 text-black font-bold">
              Select a contact in the left list to start a chat
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
