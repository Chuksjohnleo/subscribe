const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const sendEmail = async (req, res, jwt) =>{
  if(!req.user.email.includes('@')) return res.json({error:'<p style="font-weight: 800;color: red;background: white;">Invalid Email, please change your email and retry</p>'});
  const string = Math.random().toString(36).toUpperCase().slice(2);
  const hash = await  bcrypt.hash(string+req.user.email, 10);
  let token = jwt.sign(
    {
      string: string+req.user.email,
      email: req.user.email
    },
    'secretkeye',
    {expiresIn: 900}
  );
  let message = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta
        name="description"
        content="Web site created by chuksjohnleo"
      />
      
      <title>Email Verification</title>
    </head>
    <body style="background-color: aqua; text-align: center;">
      <div id="root">
          <h1>Hello dear ${req.user.firstName} ${req.user.lastName}, please verify your email</h1>
          <section>
            <div class="container">
             <h1>Email Verification</h1>
             <div><strong>Click the button below to verify your email</strong></div>
             <div><a href="https://subscribe-i9vr.onrender.com/user/authe?n=${req.user.firstName}&t=${token}&v=${hash}&e=${req.user.email}" style="margin:50px 10px;
              display:inline-block;
              padding: 10px;
              border: 5px double black;
              font-weight: 900;
              background-color: transparent;
              border-radius: 10px;
              cursor: pointer;
              color: rgb(19, 17, 17);" class="confirm btn">Verify email</a></div>
            </div>
          </section>
      </div>
      <footer style="position: sticky;font-weight:800;bottom: 0px;transform: translateY(30vh); text-align: center;border-top: 2px solid grey;">
        <p>Website by <a style="text-decoration: none;color: blue;" href="https://chuksjohnleo.github.io">Chuksjohnleo</a></p>
        <p>Copyright © 2023 Chuksjohnleo, All rights reserved.</p>
      </footer>
    </body>
  </html>
  `
   const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user: 'nwanonenyichukwuka@gmail.com',
      pass: 'mnukhkxohqthdnqz'
    }
   });

   const mailOptions = {
    from: 'nwanonenyichukwuka@gmail.com',
    to: req.user.email,
    subject: 'Verify your email',
    html:message
   };

   transporter.sendMail(mailOptions, function(error, info){
    if (error) {
           console.log(error,req.user)
           res.json({error:'<p style="font-weight: 800;color: red;background: white;">Invalid Email, please change your email and retry</p>'})
        } else {
           res.json({message:'<p style="font-weight: 800;color: blue;background: white;">Email sent successfully, the link expires in 15 minutes</p>'});
        };
     });
 }

 
 async function getUsers(req,res,MongoClient,uri){
  const client = new MongoClient(uri);
 
  try {
    await client.connect();
    const db = client.db('suscribe');
    const users = db.collection('users');
  
   
    await users.findOne(
      {email:req.user.email,_id:req.user._id},
      { projection: { _id: 1,friends:1}})
      .then(async (user)=>{
     
        await users.find({$and:[{_id:{$nin: user.friends}},{_id:{$ne:req.user._id}}]},{ projection: { _id: 1,email:1,profilePicture:1,username:1}}).toArray().then(resp=>{
        
          res.json(resp);
        });
      });

}catch (err) {
  console.log("Transaction failed:", err)
  res.json('failed');
}
finally{
      await client.close();
  }
}

async function addFriends(req,res,MongoClient,uri){
  const client = new MongoClient(uri);
  const session = client.startSession();
  try {
    await client.connect();
    const db = client.db('suscribe');
    const users = db.collection('users');
  
  session.startTransaction();
 
 const a= await users.updateOne({_id: req.user._id}, {$push:{friends: req.body.friend}},{session});
 const b= await users.updateOne({_id: req.body.friend}, {$push:{friends: req.user._id}},{session});

 await session.commitTransaction();
  console.log("Add friend Transaction committed");
  res.json('Added')
    
}catch (err) {
  res.json('failed');
  console.log(err)
}
finally{
      await client.close();
  }
}

 module.exports = {
                    sendEmail: sendEmail,
                    getUsers: getUsers,
                    addFriends: addFriends
                  }