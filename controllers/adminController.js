const express = require('express')
const app = express()
const { connectToDb, getDb } = require("../dbconnections/db")
const { ObjectId } = require('mongodb')
const fileUpload = require('express-fileupload')

app.use(fileUpload())


let db;
connectToDb((err) => {
  db = getDb()
})



// getting loginpage
const adminloginPage = (req, res) => {
  res.render('admin/adminLogin')
}


const signin = ((req, res) => {
  let email = req.body.adminLogemail
  let password = req.body.adminpass

  db.collection('admin').findOne({ email: email })
    .then((resolve) => {
      console.log(resolve);
      if (password == resolve.password) {
        res.render('admin/admin-dashboard')
      }
    })
})


// getting dashboard

const gettingdashboard = (req,res)=>{
  res.render('admin/admin-dashboard')
}



const addbookpage = (req, res) => {
  let catarray = []
  db.collection('category').find()
    .forEach(Categoryname => catarray.push(Categoryname))
    .then(() => {
      console.log(catarray, 'catearray product')
      res.render('admin/admin-add-book', { catarray })
    })
    .catch((err) => {
      console.log('err found')
    })
}


// admin get book page
const getBookpage = (async (req, res) => {
  return new Promise(async (resolve, reject) => {
    let books = await db.collection('books').find().toArray()
    res.render('admin/admin-books', { books })
  })
})



// admin add book 
const Addbooks = ((req, res) => {
  const {
    name,
    category,
    author,
    price,
    description
  } = req.body
  db.collection('books').insertOne({ name: name, category: category, author: author, price: price, description: description })
    .then((response) => {
      let id = response.insertedId
      let imageOne = req.files.imageOne;
      imageOne.mv('./public/product-images/' + id + '.jpg')
      res.redirect('/admin-books')
    })
})



// admin edit books
const editbook = (req, res) => {
  const bookid = req.query.id
  db.collection('books').findOne({ _id: ObjectId(bookid) })
    .then((resolve) => {

      let name = resolve.name
      let category = resolve.category
      let author = resolve.author
      let price = resolve.price
      let description = resolve.description
      let id = bookid

      res.render('admin/edit-book', { name, category, author, price, description, id })

    })
    .catch((error) => {
      console.log("error");
    })
}


// edit book submiting
const submitbooks = ((req, res) => {
  return new Promise((resolve, reject) => {
    const {
      id,
      name,
      category,
      author,
      price,
      description
    } = req.body
    db.collection("books").updateOne({ _id: ObjectId(id) }, {
      $set: {
        name: name,
        category: category,
        author: author,
        price: price,
        description: description
      }
    }).then((response) => {
      console.log(response, 'hellow world')
      res.redirect('/admin-books')
    })
  })
    .catch((err) => {
      console.log(err)
      console.log('cannot add books');
    })
})



// getting category page
const getcategoryPage = (req, res) => {
  let category = []
  db.collection('category').find()
    .forEach(Categoryname => category.push(Categoryname))
    .then(() => {
      res.render('admin/admin-category', { category })
    })
}



// getting Add category
const getAddcategoryPage = (req, res) => {
  res.render('admin/admin-add-category')
}
 



// sumbit add category
const  submitcategory = (req, res) => {
  const { name, description } = req.body
  db.collection('category').insertOne({ Categoryname: name, Description: description })
    .then((resolve) => {
      let details = resolve
      res.redirect('/admin/admin-category')
    })
}



//  Getting edit category
const geteditcategoryPage = (req, res) => {
  const id = req.params.id
  db.collection('category').findOne({ _id: ObjectId(id) })
    .then((resolve) => {
      let name = resolve.Categoryname
      let description = resolve.Description
      res.render('admin/edit-category', { name, description })
    })
}


// submitimig edit category
const submitEditcategory  = (req,res)=>{
 const { name,description
  }=req.body
  console.log(name,'submitio name')


}



// Delete Category
const deletecategory = (req, res) => {
  const id = req.query.id
  db.collection('category').deleteOne({ _id: ObjectId(id) })
    .then(() => {
      res.redirect('/admin/admin-category')
    })
}





const deletebooks = (req, res) => {
  const id = req.query
  console.log(id, 'iddddd')
  db.collection('books').deleteOne({ _id: ObjectId(id) })
    .then(() => {
      res.redirect('/admin-books')
    })
}




const userslist = ((req, res) => {
  const userlist = []
  db.collection('user').find().forEach(name => userlist.push(name))
    .then(() => {
      res.render('admin/user-list', { userlist })
    })
})




//blocking user
const blockUser = (req, res) => {
  const id = req.params.id
  db.collection('user').updateOne({ _id: ObjectId(id) }, { $set: { status: 'inactive' } })
    .then((resolve) => {
      res.redirect("/admin/users")
    })
}

// unblocking user

const unblockUser = (req, res) => {
  const id = req.params.id
  db.collection('user').updateOne({ _id: ObjectId(id) }, { $set: { status: 'active' } })
    .then((resolve) => {
      res.redirect('/admin/users')
    })
}



const addCoupons=(req,res)=>{
  const{name,discount,date}=req.body
  console.log(req.files);
  db.collection('coupons').insertOne({name:name,discount:discount,date:date}).
  then((response)=>{
  

    console.log(response,"coupon updated");
    res.render('admin/add-coupon',{message:'coupon added successfully'})
  })
}


const getCoupons =(req,res)=>{
  let coupons =[]
  db.collection('coupons').find()
  .forEach((name)=>coupons.push(name))
  .then(()=>{
    res.render('admin/coupon',{coupons})
  })
  
}








// ordermanagement

const ordermanagement = (req,res)=>{
 
  let orderDetails =[]

   db.collection("orders").find()
  .forEach((userId)=>orderDetails.push(userId))
  .then(()=>{
    console.log(orderDetails,"order details ssss");
    res.render('admin/oredermanagement',{orderDetails});   
  })  
}

const statusChanger = (req, res) => {
  const {
    userId,
    productId
} = req.query
console.log(req.body)
const status = req.body.status
    
db.collection('orders').updateOne({
  _id : ObjectId(userId), 'productDetails.items.item' : ObjectId(productId)
}, { $set : { 'productDetails.items.$.status' : status}})
.then((resolve) => {
  res.redirect('/admin/order')
})



}



module.exports = {
  adminloginPage,
  signin,gettingdashboard,
  getBookpage, userslist,
  getcategoryPage,
  deletecategory,
  getAddcategoryPage,
  submitcategory,
  geteditcategoryPage,
  submitEditcategory,
  Addbooks,
  ordermanagement,
  addbookpage,
  deletebooks,
  getCoupons,
  editbook,
  blockUser,
  unblockUser,
  submitbooks,addCoupons,
  statusChanger
}