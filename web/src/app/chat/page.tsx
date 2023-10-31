'use client'
import Contacts from '@/components/Contacts'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineSend, AiOutlineUser } from 'react-icons/ai'
import { BsChatLeftText } from 'react-icons/bs'
import { ImAttachment } from 'react-icons/im'
import { uniqBy } from 'lodash'
import { api } from '@/lib/api'

interface User {
  userId: string
  username: string
}

export default function Chat() {
  const [ws, setWs] = useState<any | WebSocket>(null)
  const [onlinePeople, setOnlinePeople] = useState<any>({})
  const [offlinePeople, setOfflinePeople] = useState<any>({})
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessageText, setNewMessageText] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [myId, setMyId] = useState()
  const [myUsername, setMyUsername] = useState('')

  const divUnderMessages = useRef<any>()

  useEffect(() => {
    connectToWs()
  }, [])

  function connectToWs() {
    const ws = new WebSocket('ws://localhost:3030')
    setWs(ws)
    ws.addEventListener('message', handleMessage)
    ws.addEventListener('close', () => {
      console.log('Disconnected. Trying to reconnect')
      setTimeout(() => {
        connectToWs()
      }, 1000)
    })
  }

  useEffect(() => {
    const div = divUnderMessages.current
    if (div) {
      div.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    api.get('/people').then((res: any) => {
      const offlinePeopleArr = res.data
        .filter((p: any) => p._id !== myId)
        .filter((p: any) => !Object.keys(onlinePeople).includes(p._id))

      const offlinePeople: any = {}
      offlinePeopleArr.forEach((p: any) => {
        offlinePeople[p._id] = p
      })

      setOfflinePeople(offlinePeople)
    })
  }, [onlinePeople])

  useEffect(() => {
    if (selectedUserId) {
      api.get(`/messages/${selectedUserId}`).then((res) => {
        setMessages(res.data)
      })
    }
  }, [selectedUserId])

  async function showOnlinePeople(peopleArray: User[]) {
    const response = await api.get('/profile')
    setMyId(response.data.userId)
    setMyUsername(response.data.username)
    const people: any = {}
    peopleArray
      .filter((user) => user.userId != response.data.userId)
      .forEach(({ userId, username }) => {
        people[userId] = username
      })
    setOnlinePeople(people)
  }

  function handleMessage(e: any) {
    const messageData = JSON.parse(e.data)
    if (messageData.online) {
      showOnlinePeople(messageData.online)
    } else if ('text' in messageData) {
      setMessages((prev: any) => [...prev, { ...messageData, isOur: false }])
    }
  }

  function selectContact(userId: string) {
    setSelectedUserId(userId)
  }

  function sendMessage(e: any, file: any = null) {
    if (e) e.preventDefault()
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    )

    if (file) {
      api.get(`/messages/${selectedUserId}`).then((res) => {
        setMessages(res.data)
      })
    } else {
      setNewMessageText('')
      setMessages((prev: any) => [...prev, { text: newMessageText, _id: Date.now() }])
    }
  }

  function sendFile(e: any) {
    const reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      sendMessage(null, {
        info: e.target.files[0].name,
        data: reader.result,
      })
    }
  }

  async function logout() {
    await api.post('/logout')
  }

  const messagesWithoutDupes = uniqBy(messages, '_id')

  return (
    <div className="bg-emerald-100">
      <div className="flex max-w-[1660px] h-[100vh] mx-auto border-slate-500 border">
        <section className="  w-1/5  bg-slate-900 border-r border-black  text-white overflow-hidden flex flex-col">
          <div className="h-16 border-black border-b bg-slate-700 flex items-center text-3xl justify-center gap-5 pr-7">
            <div className="pt-4">
              <BsChatLeftText />
            </div>
            <h1 className="text-4xl font-bold">Pappo</h1>
          </div>
          <div className="flex justify-around h-16 items-center border-b bg-slate-900 border-slate-700">
            <div className="flex-1">
              <p className="text-center font-bold text-xl hover:cursor-pointer">Groups</p>
            </div>
            <p className="h-full border border-black"></p>
            <div className="flex-1 bg-slate-500 h-full flex justify-center items-center">
              <p className=" text-center border-black font-bold text-xl hover:cursor-pointer">Contacts</p>
            </div>
          </div>
          <div className="flex-grow ">
            {Object.keys(onlinePeople).map((userId: any) => {
              return (
                <Contacts
                  key={userId}
                  selectedUserId={selectedUserId}
                  selectContact={selectContact}
                  userId={userId}
                  username={onlinePeople[userId]}
                  online={true}
                />
              )
            })}
            {Object.keys(offlinePeople).map((userId: any) => {
              return (
                <Contacts
                  key={userId}
                  selectedUserId={selectedUserId}
                  selectContact={selectContact}
                  userId={userId}
                  username={offlinePeople[userId].username}
                  online={false}
                />
              )
            })}
          </div>
          <div className="flex justify-around mr-3 mb-3 items-center gap-4">
            <span className="opacity-50 flex gap-2 items-center text-4xl">
              <AiOutlineUser />
              <p className="font-bold text-2xl">{myUsername}</p>
            </span>
            <a
              onClick={logout}
              href="api/auth/logout"
              className="opacity-60 hover:opacity-90 duration-150 font-bold text-xl bg-slate-800  py-2 px-3 rounded-lg">
              Logout
            </a>
          </div>
        </section>
        {selectedUserId ? (
          <section className="w-4/5 h-full flex flex-col">
            <div className="h-16 border-b border-black pl-8 bg-slate-700 text-white flex items-center">
              <p className="w-fit text-2xl font-bold">
                {selectedUserId == offlinePeople[selectedUserId]?._id
                  ? offlinePeople[selectedUserId].username
                  : onlinePeople[selectedUserId]}
              </p>
            </div>
            <div className="flex-1 bg-emerald-200 overflow-y-scroll">
              {messagesWithoutDupes.map((message: any) => {
                return (
                  <div
                    key={message._id}
                    className={`flex ${message.sender == selectedUserId ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`w-1/2 mx-10 flex ${
                        message.sender == selectedUserId ? 'justify-start' : 'justify-end'
                      }`}>
                      <p
                        className={`text-xl w-fit ${
                          message.sender == selectedUserId ? 'bg-gray-600' : 'bg-emerald-600'
                        } text-white p-2 my-4 rounded-lg max-w-full break-words`}>
                        {message.text}
                        {message.file && (
                          <span className="flex items-center gap-1 border-white border-b">
                            <ImAttachment />
                            <a target="_blank" href={`http://localhost:3030/uploads/${message.file}`}>
                              {message.file}
                            </a>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={divUnderMessages}></div>
            </div>
            <div className="flex bg-emerald-400 h-14 items-center justify-around">
              <form className="w-full flex  justify-center items-center" onSubmit={sendMessage}>
                <label className="font-bold  w-fit px-3 hover:cursor-pointer text-2xl mx-2">
                  <input className="hidden" type="file" onChange={sendFile} />
                  <ImAttachment />
                </label>
                <input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="py-1.5 rounded-2xl max-w-full w-full px-3 text-lg focus:outline-none"
                  type="text"
                  placeholder="Digite sua mensagem"
                />
                <button
                  type="submit"
                  className=" right-10 py-1.5 mx-2 bottom-3.5 font-bold text-3xl text-white bg-emerald-500 px-2 rounded-lg">
                  <AiOutlineSend />
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section className="w-[80%] h-full flex justify-center items-center bg-emerald-200">
            <p className="text-4xl opacity-50 text-black font-bold">
              Select a contact in the left list to start a chat
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
