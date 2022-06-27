const mongoose = require('mongoose')

const databaseConnect = () => {
    mongoose.connect(process.env.DATABASE_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log('MongoDB Database Connected')
    }).catch(error=>{
        console.log(error)
    })
}
module.exports = databaseConnect

//connecting to mongo Database