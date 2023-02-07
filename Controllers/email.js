const nodemailer = require('nodemailer');

const sendEmail = (req, res, userEmail) =>{
 
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
      
      <title>Home</title>
    </head>
    <body style="background-color: aqua; text-align: center;">
      <div id="root">
          <h1>Hello dear ${req.user.firstName} ${req.user.lastName}, please confirm your data</h1>
          <section>
            <div class="container">
             <h1>Data Confirmation</h1>
             <div><strong>Click the button below to confirm your data</strong></div>
             <div><button style=" margin:50px 10px;
              padding: 10px;
              border: 5px double black;
              font-weight: 900;
              background-color: transparent;
              border-radius: 10px;
              cursor: pointer;
              color: rgb(19, 17, 17);" class="confirm btn">Confirm your data</button></div>
            </div>
          </section>
      </div>
      <footer style="position: sticky;bottom: 0px;transform: translateY(30vh); text-align: center;border-top: 2px solid grey;">
        <p>Website by <a style="text-decoration: none;color: blue;" href="https://chuksjohnleo.github.io">Chuksjohnleo</a></p>
        <p>Copyright © 2023 Chuksjohnleo, All rights reserved.</p>
      </footer>
    </body>
  </html>
  `

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nwanonenyichukwuka@gmail.com',
    pass: 'pass'
  }
});

const mailOptions = {
  from: 'nwanonenyichukwuka@gmail.com',
  to: userEmail,
  subject: 'Confirm your data',
  html: message
 };

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
         console.log(error)
         res.json({errorMessage:'<p style="font-weight: 800;color: red;background: white;">There was error confirming your data, please try again</p>'});
     } else {
         res.json({message:'<p style="font-weight: 800;color: blue;background: white;">Email sent successfully</p>'});
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
      {email:req.user.email},
      { projection: { _id: 0,friends:1}})
      .then(async (user)=>{
      
        await users.find({$and:[{email:{$nin: user.friends}},{email:{$ne:req.user.email}}]},{ projection: { _id: 0,email:1,profilePicture:1,username:1}}).toArray().then(resp=>{
          
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
  await users.updateOne({email: req.user.email}, {$push:{friends: req.body.email}},{session});
  await users.updateOne({email: req.body.email}, {$push:{friends: req.user.email}},{session});
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