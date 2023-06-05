const jwt=require('jsonwebtoken');
const User=require('./../models/User');

const authenticate=async (req,res,next)=>{

    try{

        console.log("in authenticate");
        const token=req.cookies.jwtoken;
        const verifytoken=jwt.verify(token,"MYNAMEISVANSHAJBAJAJANDIAMNOTATERRORIST");

        const rootUser=await User.findOne({_id:verifytoken._id,'tokens.token':token});

        if(!rootUser){throw new Error("User not found")};

        req.token=token; 
        req.rootUser=rootUser;
        req.userID=rootUser._id;
        req.userName=rootUser.name;

        // console.log(rootUser);

        next();

    }
    catch(err){
        res.status(401).send('Unauthorized:No token found');
        console.log(err)
    }

}

module.exports=authenticate;