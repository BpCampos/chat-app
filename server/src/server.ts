import express from 'express'

import { Router } from 'express'

const app = express()
const route = Router()

const port = 3000

app.use(express.json())

route.get('/', (req, res) => {
  res.json('Hello World')
})

app.use(route)

app.listen(port, () => console.log(`Server running on port: http://localhost:${port}/`))
