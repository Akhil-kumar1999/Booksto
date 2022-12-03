
const express = require('express')
const app = express();
const { connectToDb, getDb } = require("./dbconnections/db")
const userRouter= require('./routs/indexRoutes')
const adminRouter= require('./routs/adminRoutes')
const session=require('express-session')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')


let db;
connectToDb((err) =>{
  if(!err){
  console.log('Database connected');  
  app.listen(3000,()=>{
  console.log('server listening started');
  })
  db=getDb()
  }
  })

const fileUpload = require('express-fileupload')
app.use(fileUpload())


app.use(session({secret: "key",cookie:{maxAge:86400000}, resave:false,saveUninitialized:true}));
app.use(express.static(path.join(__dirname,"public")))
app.use(expressLayouts)

app.set('layout','./layout/userlayout')
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: true}))


app.use(userRouter)
app.use(adminRouter)


app.use( function(req,res,next){
  res.set('cache-control','no-cache , no-store,must-revalidate,max-stale=0,post-check=0,pre-checked=0');
  next();
});

app.use((req ,res) =>{
  console.log('not found !!')
  res.status(404).render('user/404page');
})