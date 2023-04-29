async function chat(data,MongoClient,uri,userdata,connectedUsers,status){
   const client = new MongoClient(uri);
   try {
        await client.connect();
        const db = client.db('suscribe');
        const chats = db.collection('chats');
        await chats.insertOne(data).then(res=>{
         
          if(res.acknowledged === true){
           status();
          }
        })
      }catch (err) {
        console.log("saving chat failed: "+data, err);
      } finally {
        await client.close();
       }
     
}

async function lastSeen(user,MongoClient,uri){
  const client = new MongoClient(uri);
  try {
       await client.connect();
       const db = client.db('suscribe');
       const users = db.collection('users');
     
       await users.updateOne({_id:user},{$set:{lastSeen:Date()}})
     }catch (err) {
       console.log("saving lastseen failed: "+user, err);
     } finally {
       await client.close();
      }
    
}



async function fetchMessages(req,res,MongoClient,uri){
    const client = new MongoClient(uri);
    await client.connect();
    const session = client.startSession();
    try {
         const db = client.db('suscribe');
         const chats = db.collection('chats');
         const users = db.collection('users');

         session.startTransaction();
         const messages = await chats.find( {
            $and: [
                { $or: [ { sender:req.user._id }, {receiver: req.user._id } ] },
                { $or: [ {sender: req.body.friend}, {receiver: req.body.friend} ] }
            ]
        },{session} ).toArray();
       if(messages.length > 0) await chats.updateMany({$and: [{ sender:req.body.friend }, {receiver: req.user._id} ]},{$set:{seen:true}},{session})
        await users.updateOne({ _id:req.user._id },{$set:{lastSeen:''}},{session})
        const lastseen =  await users.findOne({ _id:req.body.friend},{projection:{_id:0,lastSeen:1}})
       
        await session.commitTransaction();
         console.log("Fetch messages Transaction committed");
       let user = req.params.user;
       if(user === req.user.username){
         res.json({user:req.user,messages:messages,lastSeen:lastseen});
         return;
       }
        res.redirect('/login');
    }catch (err) {
         if (session) await session.abortTransaction();
         res.json('failed');
          console.log("Fetch messages Transaction failed:", err);
       } finally {
         await client.close();
        }
      
 }
 
async function fetchFriends(req,res,MongoClient,uri){
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('suscribe');
    const users = db.collection('users');
  
    await users.findOne(
      {_id:req.user._id},
      { projection: { _id: 1,friends:1}})
      .then(async (user)=>{
       const friends = await users.find({_id:{$in:user.friends}},{projection:{_id:1,email:1,username:1,profilePicture:1}}).toArray()
   
       res.json(friends);
      });

}catch (err) {
  console.log(err)
  res.json('failed')
}
finally{
      await client.close();
  }
}

module.exports = { 
                   lastSeen:lastSeen,
                   chat: chat,
                   fetchFriends: fetchFriends,
                   fetchMessages: fetchMessages
                 }