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
        console.log("saving chat failed:", err);
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

         session.startTransaction();
         const messages = await chats.find( {
            $and: [
                { $or: [ { sender:req.user.email }, {receiver: req.user.email } ] },
                { $or: [ {sender: req.body.friend}, {receiver: req.body.friend} ] }
            ]
        },{session} ).toArray();
       if(messages.length > 0) await chats.updateMany({$and: [{ sender:req.body.friend }, {receiver: req.user.email} ]},{$set:{seen:true}},{session})
        
        await session.commitTransaction();
         console.log("Transaction committed");
       let user = req.params.user;
       if(user === req.user.username){
         res.json({user:req.user,messages:messages});
         return;
       }
        res.redirect('/login');
    }catch (err) {
         if (session) await session.abortTransaction();
         res.json('failed');
          console.log("Transaction failed:", err);
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
      {email:req.user.email},
      { projection: { _id: 0,friends:1}})
      .then(async (user)=>{
       
        res.json(user.friends);
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
                   chat: chat,
                   fetchFriends: fetchFriends,
                   fetchMessages: fetchMessages
                 }