const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


 async function verify(email,firstName,res,req,hash,MongoClient,uri){
  const v = bcrypt.compareSync(req.user.string,hash);
  if(v === true && req.user.email === email){
  const client = new MongoClient(uri);
  try {
    await client.connect().catch();
    const db = client.db('suscribe');
    const login = db.collection('login');
    const users = db.collection('users');

     // Start the transaction
     const session = client.startSession();
     session.startTransaction();

    const getInfo = await login.findOne({email:email},{session});
   
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
             <div><a href="https://subscribe-i9vr.onrender.com/login" style="margin:50px 10px;
              display:inline-block;
              padding: 10px;
              border: 5px double black;
              font-weight: 900;
              background-color: transparent;
              text-decoration:none;
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
  // const v = bcrypt.compareSync(token,hash);
   if(v) res.send(message);
   // return res.send('<h1>Expired or unauthorised link</h1>');    
  });
}else{
  res.send('<h1>An error occurred</h1>');
  return;
 }
//End session
await session.commitTransaction();
console.log("Verify Transaction committed");
}catch (err) {
  console.log("Verify Transaction failed:", err);
  // If an error occurred, abort the transaction
  if (session) await session.abortTransaction();
  res.json('failed')
}
finally{
      await client.close();
  }
 }else  return res.send('<h1>Expired or unauthorised link</h1>')
}

async function emailVerifier(email,firstName,lastName,jwt,res){
  const string = Math.random().toString(36).toUpperCase().slice(2);
  const hash = await  bcrypt.hash(string+email, 10);
  let token = jwt.sign(
    {
      string: string+email,
      email:email
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
          <h1>Hello dear ${firstName} ${lastName}, please verify your email</h1>
          <section>
            <div class="container">
             <h1>Email Verification</h1>
             <div><strong>Click the button below to verify your email</strong></div>
             <div><a href="https://subscribe-i9vr.onrender.com/user/authe?n=${firstName}&t=${token}&v=${hash}&e=${email}" style="margin:50px 10px;
              display:inline-block;
              padding: 10px;
              border: 5px double black;
              font-weight: 900;
              background-color: transparent;
              border-radius: 10px;
              cursor: pointer;
              color: rgb(19, 17, 17);" class="confirm btn">verify your email</a></div>
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
    to: email,
    subject: 'Verify your email',
    html:message
   };

   transporter.sendMail(mailOptions, function(error, info){
    if (error) {
           console.log(error)
        } else {
           res.json({message:'<p style="font-weight: 800;color: blue;background: white;">Email sent successfully, the link expires in 15 minutes</p>'});
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

        const getInfo = await login.findOne({email: req.body.newEmail},{session});

        if(getInfo === null){
        const getUser = await login.findOne({_id:req.user._id,email: req.body.email},{session});
        const validUser = bcrypt.compareSync(req.body.password, getUser.hash)
        if(validUser){  
            await users.updateOne({_id:req.user._id,email: req.body.email}, { $set: {email:req.body.newEmail,verified:false,modified:req.body.modified}},{session})
            .then(async (resp)=>{
                if(resp.modifiedCount === 1){
                    await login.updateOne({_id:req.user._id,email: req.body.email}, { $set: {email:req.body.newEmail,modified:req.body.modified}},{session})
                    .then( async (resp)=>{
                      if(resp.modifiedCount === 1){
                      const data =  await users.findOne({_id:req.user._id,email:req.body.newEmail},{session});
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
            return res.json("incorrect password");
           }
        }else{
         
            return res.json("incorrect password");
           }
           //END SSESSION
           await session.commitTransaction();
           console.log("Change email Transaction committed");
      } catch (err) {
        console.log("Change email Trx failed:", err);
        // If an error occurred, abort the transaction
        if (session) await session.abortTransaction();
        res.json('failed');
      }
      finally {
        // Close the database connection when finished or an error occurs
        await client.close();
       }
     }


     async function recoverPassword(req,res,jwt){
      const code = Math.random().toString().slice(2);
      const emailhash = await  bcrypt.hash(req.body.email, 10);
      const codehash = await  bcrypt.hash(code, 10);

      let token = jwt.sign(
        {
          emailhash: emailhash,
          codehash: codehash
        },
        'secretkeyp',
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
          
          <title>Home</title>
        </head>
        <body style="background-color: aqua; text-align: center;">
          <div id="root">
              <h1>Hello</h1>
              <p>Dear ${req.body.email}</p>
              <section>
                <div class="container">
                 <h2>Reset Code</h2>
                 <div><strong>Use this code to rest your password</strong></div>
                 <div>
                  <strong style="margin:50px 10px;
                  display:inline-block;
                  padding: 10px;
                  border: 5px double black;
                  font-weight: 900;
                  background-color: transparent;
                  border-radius: 10px;
                  cursor: pointer;
                  color: rgb(19, 17, 17);" 
                  class="confirm btn">${code}
                  </strong>
                 </div>
                 <p><strong>Please ignore this message if you did not request for password reset code</strong></p>
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
        to: req.body.email,
        subject: 'Password Reset Code',
        html:message
       };
    
       transporter.sendMail(mailOptions, function(error, info){
        if (error) {
               res.json({error: '<p class="bold">An error occured,<button class="btn block" onclick="location.reload()"> Please  retry</button></p>'})
               console.log(error)
            } else {
               res.json({
                         message:'<p style="font-weight: 800;color: blue;background: white;text-align:center;">Password reset code sent successfully, go to your email, get and input the code here to reset your password. The code expires in 15 minutes</p>',
                         token:token
                        });
            };
         });
    }

    
 async function saveNewPass(req,res,MongoClient,uri,email){
  console.log(req.user)
  const e = bcrypt.compareSync(req.body.email,req.user.emailhash);
  const c = bcrypt.compareSync(req.body.code.toString(),req.user.codehash);
  if(e && c){
  const client = new MongoClient(uri);
  
  try {
    await client.connect().catch();
    const db = client.db('suscribe');
    const login = db.collection('login');
    const users = db.collection('users');

     // Start the transaction
     const session = client.startSession();
     session.startTransaction();

    const getInfo = await login.findOne({email:email},{session});
   
    if(getInfo !== null){
      const hash = await  bcrypt.hash(req.body.password, 10);
        await login.updateOne({email:email}, { $set: {hash:hash,modifiedpass:new Date()}},{session})
        .then(async (response)=>{
          await users.updateOne({email:email}, { $set: {modifiedpass:new Date()}},{session}).then(resp=>{
           if(response.modifiedCount === 1 && response.acknowledged === true){
            res.json({msg:'<p><strong>Password reset successful </strong><span class="block" style="transform: translateX(20%);"><a href="/login" class="bold link"> Back to login </a></span></p>'})
           }else{
            res.json('An error occurred while resetting password')
           }
          });    
  });
}else{
  res.json('<h1>An error occurred</h1>');
  return;
}

//End session
await session.commitTransaction();
console.log("reset pass in savepass Transaction committed");
}catch (err) {
  console.log("reset pass Transaction failed: in save pass", err);
  // If an error occurred, abort the transaction
  if (session) await session.abortTransaction();
  res.json('failed')
}
finally{
      await client.close();
  }
 }else{
  console.log(e,c,req.user.codehash,req.body.code,'line 362')
  res.json('incorrect code')
 }
}

    
    
     module.exports = { 
                        editEmail : editEmail,
                        verify:verify,
                        recoverPassword:recoverPassword,
                        saveNewPass:saveNewPass
                       };