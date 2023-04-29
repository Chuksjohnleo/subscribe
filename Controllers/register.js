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
    const counter = db.collection('counter');

     //start session
    const session = client.startSession();
    session.startTransaction();

    const checkEmail = await users.findOne({$or:[{email:user.email},{username:user.username}]},{session});
    if(checkEmail === null){
    await counter.findOneAndUpdate(
                                  { _id: "userid" },
                                  { $inc: { count: 1 } },
                                  {upsert:true, returnDocument: 'after' },
  async (e,response)=>{
    if(e)return;
    await login.insertOne({_id: 'U'+response.value.count,email: user.email,hash:hash},{session});
    const email = await login.findOne({email: user.email,hash:hash},{session});
    await users.insertOne({
        _id: 'U'+response.value.count,
        firstName: user.fname,
        lastName:user.lname,
        joined: user.joined,
        email: email.email,
        username: user.username,
        lastSeen: '',
        gender: user.gender,
        friends: ["U1"]
    },{session});
    await users.findOne({_id:'U'+response.value.count,email: email.email},{session}).then(resp=>{
      JSON.stringify(resp);
      let token = jwt.sign(
          resp,
          'secretkey',
          {expiresIn: 3600}
        );
        res.json({token});
    });
  });
    }else{
      res.json('Email or Username already exists');
    }

  // Commit the transaction
    await session.commitTransaction();
    console.log("Registration Transaction committed");

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