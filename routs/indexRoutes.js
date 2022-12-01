const express= require ('express')
const router = express.Router();

const userlogin= require ('../controllers/userLogincontroller')
const usersignup= require ('../controllers/userSignupcontroller')



router.use((req, res, next) => {
    // changing layout for my admin panel
    req.app.set("layout", "layout/userlayout");
    next();
  });


router.get('/', userlogin.getHome)

router.get('/login', userlogin.checkingForLogin)

router.post('/signin', userlogin.userValidation)

router.get('/logout', userlogin.reqForLogout)

router.post('/otplogin',userlogin.otpValidation)


router.get('/viewproduct:id', userlogin.getViewProduct)

router.get('/wishlist',userlogin.getWhishlist)

router.post('/verifyPayment', userlogin.verifyPayment)
  



router.get('/product',(req,res)=>{
    res.render('product')
})




router.get('/signup',usersignup.usersignupPage)

router.post('/signup',usersignup.signupValidation)

router.post('/addtocart',userlogin.Addtocart)

router.get('/getCart',userlogin.getcartPage)

router.post('/changeQuantity',userlogin.changequantity)

router.get('/removeCartproduct',userlogin.removeCartproduct)

router.get('/checkout',userlogin.getCheckoutpage)

router.post('/checkout',userlogin.confromcheckout)

router.get('/myaccount',userlogin.getMyaccount)

router.get('/coupon',userlogin.getcoupons)

// router.get('/wishlist',userlogin.getWhishlist)

router.get('/orderSuccess',userlogin.orderSuccess)
router.post('/applycoupon',userlogin.applycoupon)

router.post('user/cancelOrder',userlogin.ordercancelling)

// router.
//  router.get('/wishlist',(req,res)=>{
//   res.render('user/wishlist')
// })
router.get('/view',(req,res)=>{
    res.render('view')
})


router.get('/checkoout',(req,res)=>{
    res.render('Checkoout')
})




module.exports=router