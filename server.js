const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const url = require('url');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Email = require('./Controllers/email');
const Register = require('./Controllers/register');
const Login = require('./Controllers/login');
const Profile = require('./Controllers/profile');
const EmailChange = require('./Controllers/emailChange');
const Chats = require('./Controllers/chat');
const uri = process.env.DATABASE_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const public = {root:'src'};

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('suscribe');
    const collection = db.collection('login');
    const collection2 = db.collection('users');
    const collection3 = db.collection('chats');
    const counter = db.collection('counter');

    //Find the first document in the collection
    
    // const first = await collection.deleteMany({ }) 
    // const second = await collection2.deleteMany({ })
    // const third = await collection3.deleteMany({}) 
    // const fourth = await counter.deleteMany({ }) 

    const first = await collection.find().toArray();
    const second = await collection2.find().toArray(); //It must be converted to array of objects
    const third = await collection3.find().toArray();
    const fourth = await counter.find().toArray();
   // console.log(third)
     console.log(first,second,third,'counter here',fourth);
  } finally {
    // Close the database connection when finished or an error occurs
    await client.close();
  }
}
//run().catch(console.error);

app.post("/", (req, res) => {
  //let user = req.params.user;
  return res.sendFile("/index.html",public);
});

//Middlewares
function authenticate(req, res, next) {
  // get the token from the request header
  const token = req.header('Authorization');
  // check if the token is valid
  try {
    // if the token is valid, set the user object in the request
    req.user = jwt.verify(token, 'secretkey');
  } catch (error) {
    // if the token is invalid, return an error
    return res.status(401).send({ error: 'Invalid token' });
  }

  // call the next middleware function
  next();
}


  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
      // cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
// Set up multer to handle the audio file upload
const upload = multer({storage:storage})

//other routes
app.get('/:users/chats',(req,res)=>{
 // if(req.params.user === req.user.email ){
   return res.sendFile('/chat.html',public);
 // };
  //res.json('You have to login');
})

app.get('/',(req,res)=>{
   res.sendFile('/index.html',public);
  });

app.get("/register", (req, res) => {
    res.sendFile("/register.html", public);
  });

app.get("/login", (req, res) => {
    res.sendFile("/login.html", public);
});

app.get("/verify-your-email", (req, res) => {
  res.sendFile("/verify.html", public);
});

app.get("/:user",(req, res) => {
  res.sendFile('/home.html',public);
});

app.post("/log-in", (req, res) => {
  Login.login(req,res,req.body,jwt,MongoClient,uri)
  .catch(err=>{
    res.json('An error occurred please retry')
  });
});

app.post("/reset",authenticate, (req, res) => {
   Profile.editProfile(req,res,MongoClient,uri,jwt).catch(console.error);
});

app.post("/register", (req, res) => {
  if (req.body.email.includes('@') && req.body.email !== '' && !req.body.email.includes(' ') && req.body.email !== null &&  req.body.password !== '' &&  req.body.password !== null && req.body.fname !== '' && req.body.fname !== null && req.body.lname !== '' && req.body.lname !== null) {
    Register.register(res,req.body,jwt,MongoClient,uri)
    .catch(()=>{
      res.json('An error occurred please retry')
    });
  } else {
    res.json('You must fill all the fields correctly');
  }
});

app.post('/v/confirm-data',authenticate, (req,res)=>{
  //if(req.user.email === req.body.email){
    Email.sendEmail(req,res,jwt).catch(e=>{
      console.log(e,'In Email.sendEmail')
    });
  //}
});

app.post('/:user/user-session',authenticate, (req,res)=>{
  let user = req.params.user;
  if(user === req.user.username){
    res.json({
              message:'session is still on',
              email: req.user.email,
              user:req.user.username,
              profilePicture: req.user.profilePicture
            });
    return;
  }
  res.json({error: 'Invalid token'});
});

app.post('/user-session',authenticate, (req,res)=>{
  res.json('session on');
});

app.get("/home/fetch-other-users",authenticate,(req,res)=>{
      Email.getUsers(req,res,MongoClient,uri);
});

app.post('/home/addfriends',authenticate,(req,res)=>{
  Email.addFriends(req,res,MongoClient,uri).catch(e=>{
    console.log(e);
  })
});

app.get('/chats/getfriends',authenticate,(req,res)=>{
  Chats.fetchFriends(req,res,MongoClient,uri).catch(e=>{
    console.log(e);
  })
})

app.get('/:user/profile',(req,res)=>{
   res.sendFile("/profile.html", public);
});

app.post("/upload-profile-pics",authenticate,upload.single('pics'),(req,res)=>{
  function deleter(file){
    if(!fs.existsSync(`./uploads/${file}`))return;
    fs.unlinkSync(__dirname + `/uploads/${file}`);
  }
  Profile.profilePicture(req,res,MongoClient,uri,jwt,deleter);
});

app.get("/profile/upload-profile-pics/:token",(req,res)=>{
 
  // check if the token is valid
  try {
    const token = req.params.token;
    // if the token is valid, set the user object in the request
    req.user = jwt.verify(token, 'secretkey');
  
   if(!fs.existsSync(`./uploads/${req.user.profilePicture}`))return res.sendFile(`/logo.svg`,{root:'public'});
   if(req.user.profilePicture && fs.existsSync(`./uploads/${req.user.profilePicture}`) ) res.sendFile(`/${req.user.profilePicture}`,{root:'uploads'});
   else res.sendFile(`/logo.svg`,{root:'public'});
   console.log(fs.existsSync(`./uploads/${req.user.profilePicture}`))
  } catch (error) {
    // if the token is invalid, return an error
    return res.send({ error: 'Invalid token' });
  }
});

app.get("/profile/get-profile-pics/:user",(req,res)=>{
  try {
   const user = req.params.user;
   if(user !== 'undefined' && fs.existsSync(`./uploads/${user}`)) res.sendFile(`/${user}`,{root:'uploads'});
   else res.sendFile(`/logo.svg`,{root:'public'});
  } catch (error) {
    console.log('yes p error')
    return res.sendFile(`/logo.svg`,{root:'public'});
  }
})

app.post('/details',authenticate,(req,res)=>{
  if(req.user.email === req.body.email){
  EmailChange.editEmail(req,res,MongoClient,uri,jwt).catch(console.error);
  return;
}
  res.json('Unauthorised action');
});

app.post('/:user/profile',authenticate,(req,res)=>{
  let user = req.params.user;
  if(user === req.user.username){
    res.json(req.user);
    return;
  }
   res.json({error:'route doesnt exist'});
  
});

//chats
app.post('/:user/chats',authenticate,(req,res)=>{
  Chats.fetchMessages(req,res,MongoClient,uri).catch(e=>{
    console.log(e)
  })
});

app.get('/s/recover-pass',(req,res)=>{
  res.sendFile('/recoverpass.html',public)
});

app.post('/r/recover-pass/confirm-e',(req,res)=>{
  EmailChange.recoverPassword(req,res,jwt).catch(e=>{
    res.json({error:'<p class="bold">An error occured <button class="btn block" onclick="location.reload()">Please retry</button><p>'})
    console.log(e)
  });
});

app.post('/r/recover-pass/change-p',(req,res)=>{
  try{
      let token = req.header('Authorization')
      req.user = jwt.verify(token, 'secretkeyp');
      EmailChange.saveNewPass(req,res,MongoClient,uri,req.body.email).catch(e=>{
        res.json({error:'<p class="bold">An error occured <button class="btn block" onclick="location.reload()">Please retry</button><p>'})
        console.log(e)
      });
  }catch(e){
    console.log(e)
    res.json('error');
  }
});

app.get('/user/authe',(req,res)=>{
  const q = url.parse(req.url, true);
  const token = q.query.t;
  const vstring = q.query.v;
 try{
     req.user = jwt.verify(token, 'secretkeye')
     EmailChange.verify(q.query.e,q.query.n,res,req,vstring,MongoClient,uri).catch(err=>{
  console.log(err)
  });
}
catch(err){
  return res.send('<body style="background:aqua;"><h1>Expired or unauthorised link</h1></body>'); 
 }
});



//chuksjohnleo.github.io@gmail.com
//nwanonenyileonard@gmail.com


  
  
let connectedUsers = {};

io.on('connection', socket => {
    console.log('a user connected');
    // When a user logs in, assign them a unique ID and store it in the connectedUsers object
    socket.on('login', id => {
        connectedUsers[id.user] = socket;
        if (connectedUsers[id.friend]) {
          connectedUsers[id.friend].emit('isOnline',id );
      }
    });

    socket.on('Online too', data=>{
      if (connectedUsers[data.to]) {
        connectedUsers[data.to].emit('Online too', data);
      } 
    });

    // When a user initiates a private chat, send the message to only the two users involved
    socket.on('private message', async data => {
       try{ 
        let newMessage =  {
          sender: data.from,
          receiver:data.to,
          message:data.message,
          time:Date(),
          edited:false,
          replied:false,
          aReply:false,
          seen: false,
          editionCount:0,
          editions:[],
          deleted:false,
          pinned:false,
        }
        function status(){
          console.log('yea')
           if(connectedUsers[data.from]){
            console.log('yea2')
          connectedUsers[data.from].emit('status1', data);
         }
         if (connectedUsers[data.to]) {  
          console.log('yea3')
            connectedUsers[data.to].emit('private message', data);
          if(connectedUsers[data.from]){
            connectedUsers[data.from].emit('status2', data);
           };
      }
    }
        await  Chats.chat(newMessage,MongoClient,uri,data,connectedUsers,status).catch(e=>{
        console.log(e);
        connectedUsers[data.from].emit('status1', data.message + ' not sent');
      });
        
       }catch (e){
            console.log(e)
           }
    });
    socket.on('typing user', data => {
      if (connectedUsers[data.to]) {
        connectedUsers[data.to].emit('typing user', data);
       }
    })
    socket.on('disconnect', () => {
      
        Object.keys(connectedUsers).forEach(key=>{
          if(connectedUsers[key] === socket){
            Chats.lastSeen(key,MongoClient,uri)
            io.emit('isOffline', key)
            delete connectedUsers[key]
            console.log('yes')
          }
        });
        // console.log(socket, ' user disconnected');
      });
});


server.listen(4001, () => {
  console.log("Server listening on port 4001");
});