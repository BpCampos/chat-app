import express from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'
import * as jwt from 'jsonwebtoken'
import cors from 'cors'
import { UserModel as User } from './models/User'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import websocket from 'ws'

const mongodbConnection: string = process.env.DATABASE_URI!

mongoose.connect(mongodbConnection)
const jwtSecret = process.env.JWT_SECRET!
const bcryptSalt = bcrypt.genSaltSync(10)

const app = express()
const port = 3030

app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
)
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json('Hello World')
})

app.get('/profile', async (req, res) => {
  const token = req.cookies?.token
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err
      res.json(userData)
    })
  } else {
    res.status(401).json('No token')
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const userFound = await User.findOne<string | any>({ username })
  if (userFound) {
    const passOk = bcrypt.compareSync(password, userFound.password)
    if (passOk) {
      jwt.sign({ userId: userFound._id, username }, jwtSecret, {}, (err, token) => {
        res.cookie('token', token, { sameSite: 'none', secure: true }).json({
          id: userFound._id,
        })
      })
    }
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
    const createdUser = await User.create({ username: username, password: hashedPassword })
    jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err: any, token?: string) => {
      if (err) throw err
      res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
        id: createdUser._id,
        username,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json('error')
  }
})

const server = app.listen(port, () => console.log(`Server running on port: http://localhost:${port}/`))

const wss = new websocket.WebSocketServer({ server })

wss.on('connection', (connection) => {
  console.log('connected')
})
