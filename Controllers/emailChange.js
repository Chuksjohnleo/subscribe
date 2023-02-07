const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


 async function verify(email,firstName,res,token,hash,MongoClient,uri){
  const client = new MongoClient(uri);
  try {
    await client.connect().catch();
    const db = client.db('suscribe');
    const login = db.collection('login');
    const users = db.collection('users');

     // Start the transaction
     const session = client.startSession();
     session.startTransaction();

    const getInfo = await login.findOne({email: email},{session});
    
    if(getInfo !== null){
        await login.updateOne({email:email}, { $set: {verified:true}},{session})
        .then(async (resp)=>{
          await users.updateOne({email:email}, { $set: {verified:true}},{session})
          
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
          <h1>Hello dear ${firstName}, Your email have been verified</h1>
          <section>
            <div class="container">
             <h1>Email verified</h1>
             <div><strong>Click the button below to login and continue</strong></div>
             <div><a href=http://localhost:4001/login style=" margin:50px 10px;
              display:inline-block;
              padding: 10px;
              border: 5px double black;
              font-weight: 900;
              background-color: transparent;
              border-radius: 10px;
              cursor: pointer;
              color: rgb(19, 17, 17);" class="confirm btn">Back to Login</a></div>
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
  const v = bcrypt.compareSync(token,hash);
  if(v)return res.send(message);
    return res.send('<h1>Expired or unauthorised link</h1>');    
  });
}else{
  res.send('<h1>An error occurred</h1>');
  return;
}

//End session
await session.commitTransaction();
console.log("Transaction committed");
}catch (err) {
  console.log("Transaction failed:", err);
  // If an error occurred, abort the transaction
  if (session) await session.abortTransaction();
  res.json('failed')
}
finally{
      await client.close();
  }
}

async function emailVerifier(email,firstName,lastName,jwt,res){
  const string = Math.random().toString(36).toUpperCase().slice(2);
  const hash = await  bcrypt.hash(string+email, 10);
  let token = jwt.sign(
    {string: string+email},
    'secretkeye',
    {expiresIn: 1500}
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
      
      <title>Home</title>
    </head>
    <body style="background-color: aqua; text-align: center;">
      <div id="root">
          <h1>Hello dear ${firstName} ${lastName}, please confirm your data</h1>
          <section>
            <div class="container">
             <h1>Data Confirmation</h1>
             <div><strong>Click the button below to confirm your data</strong></div>
             <div><a href=http://localhost:4001/user/authe?n=${firstName}&t=${token}&v=${hash}&e=${email} style=" margin:50px 10px;
              display:inline-block;
              padding: 10px;
              border: 5px double black;
              font-weight: 900;
              background-color: transparent;
              border-radius: 10px;
              cursor: pointer;
              color: rgb(19, 17, 17);" class="confirm btn">Confirm your data</a></div>
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
      pass: 'pass'
    }
   });

   const mailOptions = {
    from: 'nwanonenyichukwuka@gmail.com',
    to: email,
    subject: 'Confirm your email',
    html:message
   };

   transporter.sendMail(mailOptions, function(error, info){
    if (error) {
           console.log(error)
        } else {
           res.json({message:'<p style="font-weight: 800;color: blue;background: white;">Email sent successfully</p>'});
        };
     });
}
async function editEmail(req,res,MongoClient,uri,jwt){
   const client = new MongoClient(uri);
   const session = client.startSession();
    try {
        await client.connect().catch();
        const db = client.db('suscribe');
        const login = db.collection('login');
        const users = db.collection('users');
         // Start the transaction
      
        session.startTransaction();

        const getInfo = await login.findOne({email: req.user.email},{session});
        
        if(getInfo !== null){
        const validUser = bcrypt.compareSync(req.body.password, getInfo.hash)
        if(validUser){  
            await users.updateOne({email: req.body.email}, { $set: {email:req.body.newEmail,modified:req.body.modified}},{session})
            .then(async (resp)=>{
                if(resp.modifiedCount === 1){
                    await login.updateOne({email: req.body.email}, { $set: {email:req.body.newEmail,modified:req.body.modified}},{session})
                    .then( async (resp)=>{
                      if(resp.modifiedCount === 1){
                      const data =  await users.findOne({email:req.body.newEmail},{session});
                      let token = jwt.sign(
                        data,
                        'secretkey',
                        {expiresIn: '6h'}
                      );
                       emailVerifier(data.email,data.firstName,data.lastName,jwt,res)
                       .catch((err)=>{
                        console.log(err);
                       });
                       return res.json({token});
                      }
                    }).catch(err=>{
                      console.error;
                    })
                }      
            })
           .catch(err=>{
                console.log(err);
                res.json('Oshirike');
            });

           }else{
            return res.json("incorrect password1");
           }
        }else{
            return res.json("incorrect password2");
           }
           //END SSESSION
           await session.commitTransaction();
           console.log("Transaction committed");
      } catch (err) {
        console.log("Trx failed:", err);
        // If an error occurred, abort the transaction
        if (session) await session.abortTransaction();
        res.json('failed');
      }
      finally {
        // Close the database connection when finished or an error occurs
        await client.close();
       }
     }
    
     module.exports = { editEmail : editEmail,verify:verify };