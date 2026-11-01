import mongoose from 'mongoose'

import app from './app.js'

const PORT = process.env.PORT || 3000

mongoose
  .connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DATABASE}`)
  .then(function () {
    app.listen(PORT, () => console.log('Listen on port: ', PORT))
  })
  .catch((err) => {
    console.log('Connection to mongo failed: ', err)
  })
