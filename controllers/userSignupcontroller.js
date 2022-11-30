const express = require ('express')
const { connectToDb, getDb } = require("../dbconnections/db")
const config=require('../otp/config')
let db;
connectToDb((err) =>{
  
  db=getDb()
  
})


const  client = require ('twilio')(config.accountSid, config.authToken, config.servieceId)


// signup validation

const signupValidation=(req,res)=>{
    

      let Username=req.body.username
      let Email= req.body.email
      let contact=req.body.mbno
      let password=req.body.password1
      let conformPassword=req.body.password2
     
      db.collection('user')
      .findOne({email:Email})
      .then((resolve)=>{
        
        if(resolve.email==Email){
          res.render('user/signup',{msgOne:'this email already exists'});
        } 
        
        else if(resolve.contact==contact){
          res.render('user/signup', {msgTwo:'this mobile number is already exists'})
        }

        else if(password!=conformPassword){
         res.render('user/signup',{msgTwo:'The password must be same'})
      }
      else if(resolve.contact==contact){
         res.render('user/signup',{msgThree:'This phone number is already exists '})
      }

      })

   .catch((rej)=>{
   db.collection('user').insertOne({name:Username,email:Email,password:conformPassword,contact:contact})
  .then((resolve)=>{
    if(resolve){
      client
    .verify
     .services(config.servieceId)
     .verifications
     .create({
      to:'+91'+contact,
    channel:'sms'   
  })
  res.render('user/login')
  }
  })
  .catch(err=>{
      res.status(500)
  })
 })

}


const usersignupPage=((req,res)=>{
  res.render('user/signup')
})


const checkForlogin=(req,res)=>{
    if( req.session.userloggedIn){
        res.render("index")
        console.log("log");
    }else{
    console.log("started")
    res.render("index",)
    }
  }


module.exports={signupValidation,usersignupPage,checkForlogin}

