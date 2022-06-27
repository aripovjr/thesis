const User = require('../models/authModel')
const messageModel = require('../models/messageModel')
const formidable = require('formidable')

const getLastMessage = async(myId, fdId)=>{
    const msg = await messageModel.findOne({
        $or:[{
            $and:[{
                senderID:{
                    $eq: myId
                }
            }, {
                recevierID:{
                    $ed: fdId
                }
            }]
        },{
            $and:[{
                senderID:{
                    $eq: fdId
                }
            },{
                recevierID: {
                    $eq: myId
                }
            }]
        }]
    }).sort({
        updatedAt: -1,
    })
    return msg
}
module.exports.getFriends = async (req, res)=>{
    console.log("backend is fine")
    const myId = req.myId
    let friend_message = []
    try {
        const friendGet = await User.find({
            _id:{
                $ne: myId
            }
        })
        console.log(friendGet)
        for (let i=0; i < friendGet.length; i++){
            let last_message = await getLastMessage(myId, friendGet[i].id )
            friend_message = [...friend_message, {
                friend_info: friendGet[i],
                message_info: last_message
            }]
        }
        //Delete Loged user from the list of contacts
        //const filter = friendGet.filter(deleted=>deleted.id !== myId)
        res.status(200).json({
            success: true, 
            friends: friend_message 
        })
    } catch (error) {
        res.status(500).json({
            error:{
                errorMessage: 'Internal Server Error'
            }
        })
    }
}

module.exports.messageUploadDB = async (req, res)=>{

    const{senderName, recevierID, message} = req.body
    const senderID = req.myId

    try {
        const insertMessage = await messageModel.create({
            senderID: senderID,
            senderName: senderName,
            recevierID: recevierID, 
            message: {
                text: message,
                image: ''
            }
        })
        res.status(201).json({
            success: true,
            message: insertMessage
        })
    } catch (error) {
        res.status(500).json({
            error:{
                errorMessage: 'Internal Server Error'
            }
        })
    }
}

module.exports.messageGet = async (req, res) => {
    const myId = req.myId//check loging user's id
    const fdId = req.params.id

    try {
        let getAllMessage = await messageModel.find({
            $or:[{
                $and:[{
                    senderID:{
                        $eq: myId
                    }
                }, {
                    recevierID:{
                        $ed: fdId
                    }
                }]
            },{
                $and:[{
                    senderID:{
                        $eq: fdId
                    }
                },{
                    recevierID: {
                        $eq: myId
                    }
                }]
            }]
        })

        //when the senderID will be equal to loging users id
        getAllMessage = getAllMessage.filter(message=>message.senderID === myId && message.recevierID === fdId || message.recevierID === myId && message.senderID === fdId)

        res.status(200).json({
            success: true,
            message: getAllMessage
        })
    }catch (error) {
        res.status(500).json({
            error: {
                errorMessage: 'Internal Server Error'
            }
        })
    }
}

module.exports.ImageMessageSend = (req,res) => {
    const senderID = req.myId;
    const form = formidable();

    form.parse(req, (err, fields, files) => {
         const {
             senderName,
             recevierID,
             imageName 
         } = fields;

         const newPath = __dirname + `../../../frontend/public/image/${imageName}`
         files.image.originalFilename = imageName;

         try{
              fs.copyFile(files.image.filepath, newPath, async (err)=>{
                   if(err){
                        res.status(500).json({
                             error : {
                                  errorMessage: 'Image upload fail'
                             }
                        })
                   } else{
                        const insertMessage = await messageModel.create({
                             senderID : senderID,
                             senderName : senderName,
                             recevierID : recevierID,
                             message : {
                                  text: '',
                                  image : files.image.originalFilename
                             }
                        })
                        res.status(201).json({
                             success : true,
                             message: insertMessage
                        })

                   }
              } )

         }catch (error){
              res.status(500).json({
                   error : {
                        errorMessage: 'Internal Sever Error'
                   }
              })

         }


    })
}

module.exports.messageSeen = async(req,res)=>{
    const messageID = req.body._id

    await messageModel.findByIdAndUpdate(messageID,{
        status: 'seen'
    }).then(()=>{
        res.status(200).json({
            success: true
        })
    }).catch(()=>{
        res.status(500).json({
            error:{
                errorMessage: 'Internal Server Error'
            }
        })
    })
}

module.exports.deliveredMessage  = async(req,res)=>{
    const messageID = req.body._id

    await messageModel.findByIdAndUpdate(messageID,{
        status: 'delivered'
    }).then(()=>{
        res.status(200).json({
            success: true
        })
    }).catch(()=>{
        res.status(500).json({
            error:{
                errorMessage: 'Internal Server Error'
            }
        })
    })
}