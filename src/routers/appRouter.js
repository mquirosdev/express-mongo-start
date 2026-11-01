import express from 'express'

import jwtAuthentication from '../middleware/jwtAuthentication.js'

const appRouter = express.Router()
appRouter.use(jwtAuthentication)

appRouter.get('/', (_req, res) => {
  res.status(200).json({ message: 'Home' })
})

export default appRouter
