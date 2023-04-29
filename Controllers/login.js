const bcrypt = require('bcrypt');

async function login(req,res,user,jwt,MongoClient,uri){
const client = new MongoClient(uri);
try {
    await client.connect().catch();
    const db = client.db('suscribe');
    const login = db.collection('login');
    const users = db.collection('users');
     // Start the transaction
     const session = client.startSession();
     session.startTransaction();

    const getInfo = await login.findOne({email: user.email},{session});
    if(getInfo !== null){
    const validUser = bcrypt.compareSync(req.body.password, getInfo.hash);
    if(validUser){ 
    await users.findOne({_id:getInfo._id, email: getInfo.email},{session}).then(resp=>{
      if(resp === null) return res.json('error not found');
      let token = jwt.sign(
        resp,
        'secretkey',
        {expiresIn: '6h'}
      );
      console.log(resp)
     return res.json({token:token,username:resp.username,isVerified:resp.verified});
    });
     }else{console.log(validUser)
        return res.json('incorrect details');
       }
    }else{
        return res.json('incorrect details');
       }
       //END SESSION
       await session.commitTransaction();
       console.log("Transaction committed");
  } catch (err) {
    console.log("Transaction failed:", err);
    // If an error occurred, abort the transaction
    if (session) await session.abortTransaction();
    res.json('Action failed: Please try again')
  }
  finally {
    // Close the database connection when finished or an error occurs
    await client.close();
   }
 }

 module.exports = { login : login };