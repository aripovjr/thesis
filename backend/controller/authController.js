const formidable = require('formidable')
const validator = require('validator')
const registerModel = require('../models/authModel')
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports.userRegister = (req, res) => {
    const form = formidable()
    form.parse(req, async(err,fields, files)=>{
        const {userName, email, password, confirmPassword} = fields
        const {image} = files
        const error = []
        console.log(files)
        if(!userName){
            error.push('Please enter your UserName')
        }
        if(!email){
            error.push('Please enter your Email')
        }
        if(email && !validator.isEmail(email)){
            error.push('Please enter your Valid Email')
        }
        if(!password){
            error.push('Please enter your Password')
        }
        if(!confirmPassword){
            error.push('Please confirm your Password')
        }
        if(password && confirmPassword && password !== confirmPassword){
            error.push('Your password does not match, please check it')
        }
        if(password && password.length < 6){
            error.push('Character is not enough for password')
        }
        if(Object.keys(files).length === 0){
            error.push('Please select an Image')
        }
        if(error.length > 0){
            res.status(400).json({
                error: {
                    errorMessage: error
                }
            })
        }else{
            const getImageName = files.image.originalFilename
            const randomNumber = Math.floor(Math.random() * 99999)
            const newImageName = randomNumber + getImageName
            files.image.originalFilename = newImageName
            
            
            //const newPath = __dirname + `/Users/aripov/Desktop/thesisproject/frontend/public/image/${files.image,originalFilename}`
            const newPath = __dirname+` ../../../frontend/public/image/${files.image.originalFilename}`
            
            try{
                const checkUser = await registerModel.findOne({
                    email: email
                })
                if(checkUser){
                    res.status(404).json({
                        error: {
                            errorMessage: ['Email already exists']
                        }
                    })
                }else{
                    fs.copyFile(files.image.filepath,newPath, async(error)=>{
                        if(error){
                            const userCreate = await registerModel.create({
                                userName,
                                email,
                                password: await bcrypt.hash(password,10),
                                image: files.image.originalFilename
                            })
                            const token = jwt.sign({
                                id: userCreate._id,
                                email: userCreate.email,
                                userName: userCreate.userName,
                                image: userCreate.image,
                                registerTime: userCreate.createdAt
                            }, process.env.SECRET,{
                                expiresIn: process.env.TOKEN_EXP
                            })

                            const options = {expires: new Date(Date.now() + process.env.COOKIE_EXP*24*60*60*1000)}
                            res.status(201).cookie('authToken', token, options).json({
                                successMessage: 'Successfully registered!', token
                            })
                        }else{
                            res.status(500).json({
                                error: {
                                    errorMessage: ['Internal Server Error']
                                }
                            })
                        }
                    })
                }
            }catch(err){
                res.status(500).json({
                    err: {
                        errorMessage: ['Internal Server Error']
                    }
                })
            }
        }

    })//end formidable

}

module.exports.userLogin = async (req, res) => {

    const error = []
    console.log(req.body)
    const {email, password} = req.body

    if(!email){
        error.push('Please enter your Email')
    }
    if(!password){
        error.push('Please enter your Password')
    }
    if(email && !validator.isEmail(email)){
        error.push('Please enter your Valid Email')
    }     
    if(error.length > 0){
        res.status(400).json({
            error: {
                errorMessage: error
            }
        })
    }else{

        try{
            const checkUser = await registerModel.findOne({
                email : email
            }).select('+password')

            if(checkUser){
                const matchPassword = await bcrypt.compare(password, checkUser.password)

                if(matchPassword){
                            const token = jwt.log({
                                id: checkUser._id,
                                email: checkUser.email,
                                userName: checkUser.userName,
                                image: checkUser.image,
                                registerTime: checkUser.createdAt
                            }, process.env.SECRET,{
                                expiresIn: process.env.TOKEN_EXP
                            })

                            const options = {expires: new Date(Date.now() + process.env.COOKIE_EXP*24*60*60*1000)}
                            res.status(200).cookie('authToken', token, options).json({
                                successMessage: 'Successfully Loged in!', token
                            })
                            console.log(options)
                }else{
                    res.status(400).json({
                        error: {
                            errorMessage: ['Your password is not Valid!']
                        }
                    })
                }
            }else{
                res.status(400).json({
                    error: {
                        errorMessage: ['Oops, your email is not found!']
                    }
                })

            }
        }catch{
            res.status(404).json({
                error: {
                    errorMessage: ['Internal Server Error']
                }
            })
        }
    }
}

module.exports.userLogout = (req,res) =>{
    res.status(200).cookie('authToken','').json({
        success: true 
    })
}