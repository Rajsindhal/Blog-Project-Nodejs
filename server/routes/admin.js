const express = require('express');
const router = express.Router();
const post = require('../model/post');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// chech login

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    try{
    if(!token){
       return res.status(501).json({message: "Unauthorized"})
    }
    const decoded = jwt.verify(token, "ThisisBlog");
    req.userId = decoded.userId;
    next();
}catch(error){
    return res.status(501).json({message: "Unauthorized"});
}
}



router.get('/admin', async (req, res) => {
    try {
      const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
      console.log(error);
    }
  });


//   post 
//   admin check 

router.post("/admin", async (req, res) => {

try {
    const { username, password} = req.body;

    const user = await User.findOne({username});

    if(!user){
      return res.status(404).json({message: "Invaid Credential"});  
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        return res.status(401).json({message: "Invalid Credential p"});
    }

    const token = jwt.sign({userId: user._id},"ThisisBlog");
    res.cookie('token', token, {httpOnly: true});
    res.redirect('/dashboard');

} catch (error) {
    console.log(error);
}

})


//   get 
//   admin DAshboard 

router.get("/dashboard",authMiddleware, async (req, res) => {
  try {
    
  
    const locals = {
      title: "Admin Dashboard",
      discription: "That is Admin DashBoard"
    }

    const data = await post.find()
    res.render('admin/dashboard' ,{
      locals, 
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error)
  }
});

// get
// admin Create-New Post


router.get("/add-post",authMiddleware, async (req, res) => {
  try {
    
    const locals = {
      title: "Add Post",
      discription: "That is Add Post"
    }

    const data = await post.find()
    res.render('admin/add-post' ,{
      locals, 
      layout: adminLayout
    });

  } catch (error) {
    console.log(error)
  }
});
  

// post
// admin Create-Post


router.post('/add-post',authMiddleware, async (req, res) => {
  
  try {
    console.log(req.body)
  
    try {
      const newPost = new post({
        title: req.body.title,
        body: req.body.title
      })

      await post.create(newPost);
      res.redirect("/dashboard");


    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
})

// get 
// admin Edit-Post


router.get('/edit-post/:id',authMiddleware, async (req, res) => {
  
  try {
    
    const locals = {
      title: "Add Post",
      discription: "That is Add Post"
    }

   const data = await post.findOne({_id: req.params.id});


   res.render('admin/edit-post', {
    locals,
    data,
    layout: adminLayout
   });

  } catch (error) {
    console.log(error)
  }
})



// put
// admin Edit-Post


router.put('/edit-post/:id',authMiddleware, async (req, res) => {
  
  try {
   await post.findByIdAndUpdate(req.params.id,{
    title: req.body.title,
    body: req.body.body,
    updatedAt: Date.now()
   });

   res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error)
  }
});


// delete
// post-Delete

router.delete('/delete-post/:id' , async (req, res) => {
  try {
    await post.deleteOne({_id: req.params.id});
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
});

// get 
// logout

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
})



//   post
//   admin register
  
// router.post("/register", async (req, res) => {
// try{    
//         const { username, password} = req.body;
//         const hashPassword = await bcrypt.hash(password, 10);
//     try{
//         const user = await User.create({username, password: hashPassword});
//         res.status(201).json({message: 'User Created', user});
//     } 
//      catch (error) {
//         if(error.code === 11000){
//             res.status(409).json({message: "user already in use"});
//         }
//         else{
//             res.status(500).json({message: "internal server error"});
//         }
//     }
// }
//         catch(error){

//        console.log(error);
//         }
    
    
//     })


module.exports = router;