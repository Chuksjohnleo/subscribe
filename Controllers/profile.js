const bcrypt = require('bcrypt');

async function profilePicture(req,res,MongoClient,uri,jwt,deleter){
  const client = new MongoClient(uri);
  const session = client.startSession();
  try {
    await client.connect().catch();
    const db = client.db('suscribe');
    const login = db.collection('login');
    const users = db.collection('users');

     // Start the transaction
    
     session.startTransaction();

    const getInfo = await login.findOne({_id:req.user._id,email: req.user.email},{session});
    
    if(getInfo !== null){
          await users.updateOne({_id:req.user._id,email:req.user.email}, { $set: {profilePicture: req.file.filename}},{session});
     };
      const data =  await users.findOne({_id:req.user._id,email:req.user.email},{session});
      console.log(data,'at line 22 profile');
      if(req.user.profilePicture !== undefined) deleter(req.user.profilePicture);
      let token = jwt.sign(
        data,
        'secretkey',
        {expiresIn: '6h'}
      );
          //END SSESSION
           await session.commitTransaction();
           res.json({msg:"successful",token:token});
           console.log("Transaction committed");
    }catch(e){
      console.log("Profile picture save Trx failed:", e);
      // If an error occurred, abort the transaction
      if (session) await session.abortTransaction();
      res.json('failed');
    } finally {
      // Close the database connection when finished or an error occurs
      await client.close();
     }
  
}

async function editProfile(req,res,MongoClient,uri,jwt){
   const client = new MongoClient(uri);
    try {
        await client.connect().catch();
        const db = client.db('suscribe');
        const login = db.collection('login');
        const users = db.collection('users');
        //start session
        const session = client.startSession();
        session.startTransaction();

        const getInfo = await login.findOne({_id:req.user._id,email: req.user.email},{session});
        const checkInfo = await users.findOne({username: req.body.username},{session});
        if(checkInfo !== null)return res.json("username already exist");
        if(getInfo !== null){
        const validUser = bcrypt.compareSync(req.body.password, getInfo.hash)
        if(validUser){ 
          console.log(req.body)
            await users.updateOne({_id:req.user._id, email: req.body.email}, { $set: { username: req.body.username, firstName: req.body.fname,lastName:req.body.lname,modified: req.body.modified }},{session})
            .then( async (resp)=>{
              if(resp.modifiedCount === 1){
              const data =  await users.findOne({_id:req.user._id,email:req.user.email},{session})
              let token = jwt.sign(
                data,
                'secretkey',
                {expiresIn: '6h'}
              );
             return res.json({token});
              }
            
            });

           }else{
            return res.json("incorrect password");
           }
        }else{
            return res.json("incorrect password");
           }

           //end session
           await session.commitTransaction();
           console.log("Transaction committed");
      }catch (err) {
        console.log("Transaction failed:", err);
        // If an error occurred, abort the transaction
        if (session) await session.abortTransaction();
        res.json('Something went wrong');
      }
       finally {
        // Close the database connection when finished or an error occurs
        await client.close();
       }
     }
    
     module.exports = { 
                        editProfile : editProfile,
                        profilePicture : profilePicture
                       };