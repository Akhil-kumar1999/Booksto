

//importing mongodb package
const{MongoClient}=require('mongodb')

let dbConnection


module.exports={

    //connectin dbs
    connectToDb:(cb)=>{
        MongoClient.connect('mongodb+srv://Akhilkumar:akhil123@cluster0.pfmboqr.mongodb.net/Bookstore?retryWrites=true&w=majority')
    // MongoClient.connect('mongodb://localhost:27017/Bookstore')
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