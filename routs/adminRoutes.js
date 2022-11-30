
const { Router } = require('express')
const express= require ('express')
const Routes = require('twilio/lib/rest/Routes')
const router = express.Router()
const admin= require ('../controllers/adminController')
   

router.use((req, res, next) => {
    // changing layout for my admin panel
    req.app.set("layout", "layout/adminlayouts");
    next();
  });




router.get('/admin',admin.adminloginPage)
router.post("/admin",admin.signin)
router.get('/admin-dashboard',admin.gettingdashboard)

router.get('/admin-books',admin.getBookpage)
router.get('/admin/addbooks',admin.addbookpage)
router.post("/addbooks",admin.Addbooks)

router.get('/admin/edit-book',admin.editbook)
router.post('/editbooks',admin.submitbooks)
router.get('/admin/deletebooks',admin.deletebooks)

router.get('/admin/users',admin.userslist)
router.get('/admin/blockUser/:id',admin.blockUser)
router.get('/admin/unblockUser/:id',admin.unblockUser)


router.get('/admin/admin-category',admin.getcategoryPage)
router.get('/admin/admin-add-category',admin.getAddcategoryPage)
router.post('/admin/addcategory',admin. submitcategory)
router.get('/admin/edit-category/:id',admin.geteditcategoryPage)
router.get('/admin/delete-category',admin.deletecategory)
router.post('/admin/submit-editcategory',admin.submitEditcategory)

router.get('/admin/order',(req,res)=>{
    res.render('admin/oredermanagement')
})
 


router.get('/admin/coupon',(req,res)=>{
    res.render('admin/coupon')
})

router.get('/admin/addcoupon',(req,res)=>{
    res.render('admin/add-coupon')
})

router.get('/admin/userProfile',(req,res)=>{
    res.render('admin/profile')
})

router.get('/admin/profile-edit',(req,res)=>{
    res.render('admin/profile-edit')
})




    
module.exports=router















router.get('/sign-up',(req,res)=>{
    res.render('admin/adminsign-up')
})



router.get('/admin/admin-dashboard',(req,res)=>{
    res.render('admin/admin-dashboard')
})


router.get('/admin/checkout',(req,res)=>{
    res.render('admin/Checkoout')
})



router.get('/admin/admin-add-author',(req,res)=>{
    res.render('admin/admin-add-author')
})



router.get('/admin/adminsign-out',(req,res)=>{
    res.render('admin.adminsign-up')
})

