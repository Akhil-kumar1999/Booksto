

//importing mongodb package
const{MongoClient}=require('mongodb')
let dbConnection


module.exports={

    //connectin dbs
    connectToDb:(cb)=>{
        MongoClient.connect("mongodb+srv://akhil:akhil12345@cluster0.pfmboqr.mongodb.net/Bookstore?retryWrites=true&w=majority")
    // MongoClient.connect('mongodb://127.0.0.1:27017/Bookstore?directConnection=true')
   .then((client)=>{
     dbConnection=client.db()
     return cb()
    })
   
    .catch((err)=>{
        console.log(err);
        return cb(err)
    })
}, 
//return the dbs connection
getDb:( )=>dbConnection

}
