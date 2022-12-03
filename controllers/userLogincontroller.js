const { localsName } = require("ejs");
const {
  MongoExpiredSessionError,
  MongoServerClosedError,
  ObjectId,
} = require("mongodb");
const { connectToDb, getDb } = require("../dbconnections/db");
const config = require("../otp/config");
const router = require("../routs/indexRoutes");
const Razorpay = require("razorpay");
const { options } = require("../routs/indexRoutes");
const internal = require("stream");
 const dotenv =require('dotenv').config()

const authToken = process.env.authToken
const accountSid = process.env.accountSid
const servieceId = process.env.servieceId
// const client = require('twi/lio')(authToken,accountSid)
let db;
connectToDb((err) => {
  db = getDb();
});

var instance = new Razorpay({
  key_id: "rzp_test_u78E67f6nj6E0c",
  key_secret: "PR2elwhZSaaPGzjKBia0kF1n",
});

const client = require("twilio")(
  config.accountSid,
  config.authToken,
  config.servieceId
);

//get Home page

const getHome = (req, res) => {
  const books = [];
  let category =[]
  db.collection("books")
    .find()
    .forEach((name) => books.push(name))
    .then(() => {
      if (req.session.userloggedIn) {
        const userId = req.session.user._id;
        db.collection("user")
          .findOne({ _id: ObjectId(userId) })
          .then(async (resolve) => {
            // const getCart = await getCartTotal(userId);
            // console.log(getCart);
            // const count = getCart.cartItems.items.length;
            console.log("home coming");
            console.log(resolve);
            db.collection('category').find()
            .forEach(Categoryname=>category.push(Categoryname))
            .then(()=>{
              res.render("user/home", { books, category });
            })
            
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        db.collection('category').find()
        .forEach(Categoryname=>category.push(Categoryname))
        .then(()=>{
          console.log('hjbjhbkjh');
        
          res.render("user/home", { books, count:null,category,status: "notLoggedIn" });
        })
        
       
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// checking for login

const checkingForLogin = (req, res) => {
  const books = [];
  db.collection("books")
    .find()
    .forEach((name) => books.push(name));
  if (req.session.userloggedIn) {
    const userId = req.session.user._id;
    db.collection("user")
      .findOne({ _id: ObjectId(userId) })
      .then((resolve) => {
       
          res.render("user/home", { books, count:null,status: "userloggedIn" });
      
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.render("user/login");
  }
};

// login validation
const userValidation = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  db.collection("user")
    .findOne({ email: email })
    .then((resolve) => {
      if (resolve) {
        if (resolve.password == password) {
          req.session.user = resolve;
          req.session.userloggedIn = true;
          res.redirect("/login");
        } else {
          res.render("user/login", { msgOne: "password is incorrect" });
        }
      } else {
        res.render("user/login", { msgTwo: "user doesnt exists" });
      }
    })
    .catch((rej) => {
      console.log(rej, "this is rej");
    });
};

// login otp validation
const otpValidation = (req, res) => {
  console.log(req.body);
  let email = req.body.email;
  db.collection("user")
    .findOne({ email: email })
    .then((resolve) => {
      if (resolve) {
        client.verify
          .services(servieceId)
          .verifications.create({
            to: "+91" + resolve.contact,
            channel: "sms",
          })
          .then((resolve) => {
            res.render("index");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.render("user/login", { msgTwo: "user does not exist" });
      }
    })
    .catch((rej) => {
      console.log(rej);
    });
};

// single product view
const getViewProduct = (req, res) => {
  const productId = req.url.slice(12);
  db.collection("books")
    .findOne({ _id: ObjectId(productId) })
    .then((resolve) => {
      let singleproduct = resolve;
      if (req.session.userloggedIn) {
        const userId = req.session.user._id;
        db.collection("user")
          .findOne({ _id: ObjectId(userId) })
          .then((resolve) => {
            res.render("user/viewproduct", {
              resolve,
              singleproduct,
              status: "loggedIn",
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.redirect("/login");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// getting wishlist page

const getWhishlist = (req, res) => {
  if (req.session.userloggedIn) {
    const productId = req.query.id
    const userId = req.session.user._id
    db.collection('books').findOne({_id:ObjectId(productId)})
    .then((resolve)=>{
      let name = resolve.name
      let price = resolve.price
     
      let productdetails = {name,price}

      console.log('this is product details',productdetails)
      // db.collection('wishlist').insertOne({proid:ObjectId(productId)})
      // .then((resolve)=>{
      //   consolve.log('this is inserted details',resolve)
      // })
     res.render("user/wishlist",{productdetails});
    })
    .catch((err)=>{
      console.log("the product is not here")
    })
    }
};

//   Adding product to the cart

const Addtocart = async (req, res) => {
  if (req.session.userloggedIn) {
    let productid = req.body.proId;
    console.log(req.body);
    let userid = req.session.user._id;
    

    db.collection("books")
      .findOne({ _id: ObjectId(productid) })
      .then((resolve) => {
        let bname = resolve.name;
        let bprice = resolve.price;
        let author = resolve.author;

        let cartObject = {
          item: ObjectId(productid),
          name: bname,
          price: bprice,
          author: author,
          quantity: 1,
        };

        // avoiding adding of same product ----------------------
       
        db.collection("cart")
          .findOne({ user: ObjectId(userid) }) 
          .then((resolve) => {

            if (resolve) {
              let proExist = resolve.items.findIndex(
                (items) => items.item == productid );    
              console.log(proExist, "product already exist");
              if (proExist != -1) {
                db.collection("cart")
                  .updateOne(
                    { "items.item": ObjectId(productid) },
                    { $inc: { "items.$.quantity": 1 } }
                  )
                  .then((resolve) => {
                    res.json({message:'exist'})
                  })
                  .catch(() => {
                    console.log("cannot added the quantity");
                  });
              }

              // -----------------------------------
              else {
                db.collection("cart")
                  .updateOne({ user: ObjectId(userid) },
                    { $push: { items: cartObject } } )
                  .then((resolve) => {
                  /*   db.collection("cart")
                      .findOne({ user: ObjectId(userid) })
                      .then(async (resolve) => {
                        const totalAmount = await getCartTotal(userid);
                        let product = resolve;
                        console.log(product, "hello world");
                        console.log(totalAmount, "hello resolve");
                        res.render("user/cart", { product, totalAmount,resolve, status: "loggedIn",  });
                      })
                      .catch(() => {
                        console.log("error");
                      }); */
                      res.json({message:"item added to cart "})
                  });
              }
            } else {
              let proObject = { user: ObjectId(userid), items: [cartObject] };
              db.collection("cart")
                .insertOne(proObject)
                .then((resolve) => {
                /*   db.collection("cart")
                    .findOne({ user: ObjectId(userid) })
                    .then(async (resolve) => {
                      const totalAmount = await getCartTotal(userid);
                      let product = resolve;
                      res.render("user/cart", {
                        product,
                        resolve,
                        totalAmount,
                        status: "loggedIn",
                      });
                    }); */
                    res.json({message:'New usercart added'})
                });
            }
          });
      })

      .catch((err) => {
        console.log(err);
      });
  }
  else {
    res.redirect('/login')
  }
};



// getcarttotalFunction
const getCartTotal = async (userId) => {
  let cartItems = await db
    .collection("cart")
    .findOne({ user: ObjectId(userId) });

  let total = 0;
  cartItems.items.forEach((x) => {
    total += x.price * x.quantity;
  });
  return { cartItems, total };
};



// view cart page
const getcartPage = (req, res) => {
  if (req.session.userloggedIn) {
    let userId = req.session.user._id;
    db.collection("cart")
      .findOne({ user: ObjectId(userId) })
      .then((response) => {
        if(response){
          console.log('this ti ', response)
          let count = response.items.length;
          console.log(count,'qqqqqqqqqqqqqqqqqqqqqqq')
          db.collection("user")
            .findOne({ _id: ObjectId(userId) })
            .then(async (resolve) => {
              totalAmount = await getCartTotal(userId);
              let product = response;
              res.render("user/cart", { product, totalAmount, resolve, count });
            });
        }else{
          res.render("user/cartempty");
        }
     
      });
  } else {
    res.redirect("/login");
  }
};


// get coupons

const getcoupons =(req,res)=>{
  let coupon = []
  db.collection('coupons').find().forEach((discount)=>coupon.push(discount))
  .then(()=>{
    console.log('hgjggh');
    res.render('user/coupon',{coupon})
  })
 
}








// getting checkout page
const getCheckoutpage = (req, res) => {
  console.log('enterd to check out')
  if (req.session.userloggedIn) {
    let userId = req.session.user._id;
    db.collection("user")
      .findOne({ _id: ObjectId(userId) })
      .then(async(resolve) => {
        let userDetails = resolve;
        console.log(userDetails,'checking user details')
        let totalAmount = await getCartTotal(userId);
        db.collection('cart').findOne({user:ObjectId(userId)})
        .then((resolve)=>{  
        let productDetails= resolve
        console.log(productDetails,'checking product details')
        console.log(productDetails.items.item)
           res.render("user/checkout", { userDetails, totalAmount,productDetails});
        })
      });
  }
   else 
   {
    res.redirect("/getCart");
  }
};


// apply coupon

const applycoupon=(req,res)=>{
  let userId=req.session.user._id
  db.collection('usercoupons').findOne({user:ObjectId(userId)})
  .then((resolve)=>{
if(resolve){
  res.json({Message:'You can only apply for one offer'})

}
else{
  console.log('jhj',req.body);
  db.collection('coupons').findOne({name:req.body.coupon})
  .then((resolve)=>{
    console.log(resolve.discount);
    let price=req.body.price-resolve.discount

db.collection('usercoupons').
insertOne({user:ObjectId(userId),couponname:resolve.name,offerapplied:resolve.discount})
.then(()=>{
  res.json({price})
})
   
  })
}
  })
 
}

// conform checkout
const confromcheckout = (req, res) => {
  console.log('hellomone')
  let userDtails = req.body;
  const { firstname, lastname, payment_method } = req.body;
  let userId = req.session.user._id;
  console.log(req.body);
  db.collection("cart")
    .findOne({ user: ObjectId(userId) })
    .then(async (resolve) => {
      totalAmount = await getCartTotal(userId);
      total = totalAmount.total;
      resolve.items.forEach((x) => {
        x.status = "pending";
      });

      let productDetails = resolve;
let date=new Date();
let month=date.getMonth();
      if (payment_method == "cod") {
        db.collection("orders")
          .insertOne({
            userId: ObjectId(userId),
            userDtails,
            productDetails,
            total,
            date:date,
            month:month
          })
          .then((resolve) => {
            let orderId = resolve.insertedId;
            console.log(orderId,"orderid");
            db.collection("cart")
              .deleteOne({ user: ObjectId(userId) })
              .then((resolve) => {
                res.json({status : 'cod-success',orderId})
              })
              .catch((err) => {});
          });
      }
       else if (payment_method == "online") {
        db.collection("orders")
          .insertOne({
            userId: ObjectId(userId),
            userDtails,
            productDetails,
            total,
            date: date,
            month:month

          })
          .then(async (resolve) => {
            console.log(`resolve:${resolve}`)
            let orderId = resolve.insertedId;
            let totalAmount = await getCartTotal(userId);
            let total = totalAmount.total;
            db.collection("cart")
              .deleteOne({ user: ObjectId(userId) })
              .then(async (resolve) => {
                const razorpay = await generateRazorpay(orderId, total);
                console.log(`razorpay:${razorpay}`)
                res.json(razorpay);
              });
          });
      }
    })
    .catch(() => {
      console.log("the cart is empty");
    });
};




// generateRazorpay
const generateRazorpay = (orderId, total) => {
  return new Promise((resolve, reject) => {
    console.log(orderId,total);
    var options = {
      amount:total*100,
      currency: "INR",
      receipt: "" + orderId,
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.log(err, "error find");
      } else 
        console.log('by'+order)
        resolve(order);
    });
  });
};

//verify payment
const verifyPayment = (req, res) => {
  console.log('helo')
  console.log(req.body);
  let details = req.body;
  const crypto = require("crypto");

  let hmac = crypto.createHmac("sha256","PR2elwhZSaaPGzjKBia0kF1n");
  hmac.update(
    details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id
  );
  hmac = hmac.digest("hex");

  if (hmac == details.payment.razorpay_signature) {
    res.json({ status: "success", orderId: details.order.receipt });
    console.log("payment succes full");
  } else {
    res.json({ status: "failed" });
    console.log("payment  failed");
  }
};

//order success 
const orderSuccess = (req, res) => {
  const orderId = req.query.id
  console.log();
  db.collection('orders').findOne({ _id : ObjectId(orderId)})
  .then((resolve) => {
    console.log(resolve,"address");
    let details = resolve
    res.render('user/orderSuccess',{details})
  })
}







// gettig Myaccount
const getMyaccount = (req, res) => {
  let orderDetails = [];
  if (req.session.userloggedIn) {
    let userId = req.session.user._id;
    db.collection("user")
      .findOne({ _id: ObjectId(userId) })
      .then((resolve) => {
        db.collection("orders")
          .find({ userId: ObjectId(userId) })
          .forEach((userId) => orderDetails.push(userId))
          .then((response) => {
          res.render("user/my-account", { resolve, orderDetails });
          });
      })
      .catch(() => {
        console.log("user not found");
      });
  }else{
    res.redirect('/login')
  }
};

// change quantity
const changequantity = async (req, res) => {
  let userId = req.session.user._id;
  const { productId, count } = req.body;
  const findUser = await new Promise((resolve, reject) => {
    const items = db
      .collection("cart")
      .aggregate([
        {
          $match: {
            user: ObjectId(userId),
          },
        },
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.item": ObjectId(productId),
          },
        },
      ])
      .toArray();
    resolve(items);
    console.log(items);
  }).then((resolve) => {
    console.log(resolve[0].items.quantity);
    if (resolve[0].items.quantity == 1 && count == -1) {
      res.json({ status: "blockButton" });
    } else {
      db.collection("cart")
        .updateOne(
          {
            user: ObjectId(userId),
            "items.item": ObjectId(productId),
          },
          {
            $inc: {
              "items.$.quantity": parseInt(count),
            },
          }
        )
        .then(async (resolve) => {
          let totalAmount = await getCartTotal(userId);
          let total = totalAmount.total;
          res.json({ status: "done", total });
        });
    }
  });
};

// Remove cart product
const removeCartproduct = (req, res) => {
  const userId = req.session.user._id;
  const bookid = req.query.id;
  db.collection("cart")
    .updateOne(
      { user: ObjectId(userId) },
      {
        $pull: {
          items: { item: ObjectId(bookid) },
        },
      }
    )
    .then((resolve) => {
      console.log(resolve);
      res.redirect("/getCart");
    });
};

// order cancellin
 
const ordercancelling =(req,res)=>{
let userId=req.session.user._id
const {
  orderId,
  productId
} = req.body
console.log(req.body);
db.collection('orders').findOne
db.collection('orders').updateOne({
  _id : ObjectId(orderId), 'productDetails.items.item' : ObjectId(productId)
}, { $set : { 'productDetails.items.$.status' : 'cancelled' }})
.then((resolve) => {
  console.log(resolve,'sssssssssssssss')
  res.json({message:'productcancelled'})
})
}

const addressAdd=(req,res)=>{
  if(req.session.userloggedIn){
    console.log(req.body);
let userId=req.session.user._id
console.log(userId);
    db.collection('user').updateOne({_id:ObjectId(userId)},{$set:{address:req.body}}).then((resolve)=>{
      console.log('address updated');
      console.log(resolve);
      res.json({Message:'Address Added Successfully'})
    })
  }else{
    res.redirect('/login')
  }

}

const updateAddress=(req,res)=>{
  let userId=req.session.user._id
  console.log(req.body);
  db.collection('user').updateOne({_id:ObjectId(userId)},{$set:{address:req.body}}).then((resolve)=>{
    console.log('address updated');
    console.log(resolve);
    db.collection('user').findOne({_id:ObjectId(userId)}).then((response)=>{
      console.log(response,'gjghj');
      res.json({Message:'Address updated Successfully',response})
    })
   
  })
}

// logout
const reqForLogout = (req, res) => {
  req.session.userloggedIn = false;
  res.redirect("/");
};


module.exports = {
  getHome,
  userValidation,
  checkingForLogin,
  confromcheckout,
  otpValidation,
  getViewProduct,
  getcoupons,
  getWhishlist,
  getcartPage,
  getCheckoutpage,
  reqForLogout,
  Addtocart,
  ordercancelling,
  changequantity,
  removeCartproduct,
  getMyaccount,
  verifyPayment,
  orderSuccess,applycoupon,addressAdd,updateAddress
}
