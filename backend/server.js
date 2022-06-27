const express = require('express')
const app = express()
const dotenv = require('dotenv')
const databaseConnect = require('./config/database')
const authRouter = require('./routes/authRoute')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const messengerRoute = require('./routes/messengerRoute')


dotenv.config({
    path: 'backend/config/config.env'
})
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/api/thesisproject', authRouter)
app.use('/api/thesisproject/', messengerRoute)

const PORT = process.env.PORT || 4000 
app.get('/', (req, res)=>{
    res.send('This is from Backend Server')
})

databaseConnect()

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})