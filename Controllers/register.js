const bcrypt = require('bcrypt');
const saltRounds = 10;

async function register(res,user,jwt,MongoClient,uri){
const client = new MongoClient(uri);
const hash = await  bcrypt.hash(user.password, saltRounds);
  try {
    await client.connect();
    const db = client.db('suscribe');
    const users = db.collection('users');
    const login = db.collection('login');

     //start session
    const session = client.startSession();
    session.startTransaction();

    const checkEmail = await users.findOne({$or:[{email:user.email},{username:user.username}]},{session});
    if(checkEmail === null){
    await login.insertOne({email: user.email,hash:hash},{session});
    const email = await login.findOne({email: user.email,hash:hash},{session});
    await users.insertOne({
        _id: email._id.toString(),
        firstName: user.fname,
        lastName:user.lname,
        joined: user.joined,
        email: email.email,
        username: user.username,
        friends: ["nwanonenyichukwuka@gmail.com"]
    },{session});
    await users.findOne({email: email.email},{session}).then(resp=>{
      JSON.stringify(resp);
      let token = jwt.sign(
          resp,
          'secretkey',
          {expiresIn: 3600}
        );
        res.json({token});
    });
    }else{
      res.json('Email or Username already exists');
    }

  // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed");

  }catch (err) {
    console.log("Transaction failed:", err);
    // If an error occurred, abort the transaction
    if (session) await session.abortTransaction();
    res.json('Something went wrong');
  } finally {
    await client.close();
   }
 }

 module.exports = { register:register };