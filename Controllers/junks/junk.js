/*async function run() {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db('suscribe');
      const collection = db.collection('login');
      const collection2 = db.collection('users');
      db.createCollection("posts", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: [ "title", "body" ],
            properties: {
              title: {
                bsonType: "string",
                description: "Title of post - Required."
              },
              body: {
                bsonType: "string",
                description: "Body of post - Required."
              },
              category: {
                bsonType: "string",
                description: "Category of post - Optional."
              },
              likes: {
                bsonType: "int",
                description: "Post like count. Must be an integer - Optional."
              },
              tags: {
                bsonType: ["string"],
                description: "Must be an array of strings - Optional."
              },
              date: {
                bsonType: "date",
                description: "Must be a date - Optional."
              }
            }
          }
        }
      })*/
      /*
      async function placeOrder(client, cart, payment) {
    const transactionOptions = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    };
  
    const session = client.startSession();
    try {
      session.startTransaction(transactionOptions);
  
      const ordersCollection = client.db('testdb').collection('orders');
      const orderResult = await ordersCollection.insertOne(
        {
          customer: payment.customer,
          items: cart,
          total: payment.total,
        },
        { session }
      );
  
      const inventoryCollection = client.db('testdb').collection('inventory');
      for (let i=0; i<cart.length; i++) {
        const item = cart[i];
  
        // Cancel the transaction when you have insufficient inventory
        const checkInventory = await inventoryCollection.findOne(
          {
            sku: item.sku,
            qty: { $gte: item.qty }
          },
          { session }
        )
        if (checkInventory === null) {
          throw new Error('Insufficient quantity or SKU not found.');
        }
  
        await inventoryCollection.updateOne(
          { sku: item.sku },
          { $inc: { 'qty': -item.qty }},
          { session }
        );
      }
  
      const customerCollection = client.db('testdb').collection('customers');
      await customerCollection.updateOne(
        { _id: payment.customer },
        { $push:  { orders: orderResult.insertedId }},
        { session }
      );
      await session.commitTransaction();
      console.log('Transaction successfully committed.');
  
    } catch (error) {
      if (error instanceof MongoError && error.hasErrorLabel('UnknownTransactionCommitResult')) {
        // add your logic to retry or handle the error
      }
      else if (error instanceof MongoError && error.hasErrorLabel('TransientTransactionError')) {
        // add your logic to retry or handle the error
      } else {
        console.log('An error occured in the transaction, performing a data rollback:' + error);
      }
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }
       */

  const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://<username>:<password>@cluster.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect(async err => {
  try {
    const userCollection = client.db("database_name").collection("users");
    const loginCollection = client.db("database_name").collection("login");
    const userData = { name: "John Doe", email: "johndoe@example.com" };
    const loginData = { email: "johndoe@example.com", password: "password123" };

    // Start the transaction
    const session = client.startSession();
    session.startTransaction();

    // Insert the data
    await userCollection.insertOne(userData, { session });
    await loginCollection.insertOne(loginData, { session });

    // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed");
  } catch (err) {
    console.log("Transaction failed:", err);
    // If an error occurred, abort the transaction
    if (session) await session.abortTransaction();
  } finally {
    client.close();
  }
});


      // fetch(`${location.href}`, {
      //   method: "post",
      //   headers: { authorization: sessionStorage.getItem("token") },
      // })
      //   .then((res) => {
      //     return res.json();
      //   })
      //   .then((res) => {
      //     if(res.error){
      //       location.href = '/login';
      //       return;
      //     }
      //     if(res.user.email === 'nwanonenyileonard@gmail.com'){
      //         friend.value = 'chuksjohnleo.github.io@gmail.com';
      //         friend.innerHTML = 'chuksjohnleo.github.io@gmail.com';
      //     }else if(res.user.email === 'chuksjohnleo.github.io@gmail.com'){
      //         friend.value = 'nwanonenyileonard@gmail.com';
      //         friend.innerHTML = 'nwanonenyileonard@gmail.com';
      //         }
      //     sessionStorage.setItem('friend',friend.value)
      //     sessionStorage.setItem('user',res.user.email)
      //     if(res.messages){
      //       console.log(res.messages)
      //       if(res.messages.length > 0){
      //         res.messages.forEach(message => {
      //           let li = document.createElement('li');
      //           if(message.sender === sessionStorage.getItem('user')){
      //               console.log(sessionStorage.getItem('user'),'sender',message.sender)
      //             li.classList.add('sent');
      //            }else{
      //             li.classList.add('received')
      //           }
      //           let mt = message.message.split(' ');
      //           mt.forEach((m,i)=>{
      //             if(m.includes('.com')){
      //               mt.splice(1,i,`<a href=${m}>${m}</a>`)
      //               message.message = mt.join(' ')
      //             }
      //           })
      //           li.innerHTML = message.message;
      //           messages.appendChild(li);
      //           window.scrollTo(0, document.body.scrollHeight);
      //         });
      //       }
      //       login(res.user.email);
      //     }
      //   })
      //   .catch((err) => {console.log(err)
      //     result.innerHTML = "There was error fetching your datails";
      //   });

      const socket = io();
const form = document.getElementById('form-btn');
const input = document.getElementById('input');
const message = document.getElementById('message');
const body = document.getElementById('body');
const result = document.getElementById('result');
const from = '';//document.getElementById('from');
const typer = document.getElementById('typer');
const friend = document.getElementById('friend');
const messages = document.getElementById('messages');

 

function changeBackground(){
  let received = messages.querySelectorAll('.received');
  body.classList.toggle('aqua');
  received.forEach(r=>{
    r.classList.toggle('background')
  });
}

const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const d = new Date()
console.log(d.getDate(),d.getTime(),weekDays[d.getUTCDay()],d.getFullYear())
tobottom.innerHTML = d.toDateString();
function login(from){
  console.log(from)
  sessionStorage.setItem('user',from);
   socket.emit('login', from);
}

async function checkUser() {
  await fetch("/user-session", {
    method: "post",
    headers: { authorization: sessionStorage.getItem("token") },
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.error === "Invalid token") {
        result.innerHTML = "Session expired";
        window.location.href = "/login";
        return;
      }
      body.style.display = 'block';
    })
    .catch((err) => {
      window.location.href = "/login";
    });
}
checkUser();

function chatFriend(friend){
  messages.innerHTML = '';
  fetch(`${location.href}`, {
        method: "post",
        headers: { 
          'Content-Type': 'application/json',
          authorization: sessionStorage.getItem("token") 
        },
        body:JSON.stringify({friend: friend})
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if(res.error){
            location.href = '/login';
            return;
          }
          console.log(res)
          // if(res.user.email === 'nwanonenyileonard@gmail.com'){
          //     friend.value = 'chuksjohnleo.github.io@gmail.com';
          //     friend.innerHTML = 'chuksjohnleo.github.io@gmail.com';
          // }else if(res.user.email === 'chuksjohnleo.github.io@gmail.com'){
          //     friend.value = 'nwanonenyileonard@gmail.com';
          //     friend.innerHTML = 'nwanonenyileonard@gmail.com';
          //     }
          sessionStorage.setItem('friend',friend)
          sessionStorage.setItem('user',res.user.email)
          if(res.messages){
            console.log(res.messages)
            if(res.messages.length > 0){
              res.messages.forEach(message => {
                let li = document.createElement('li');
                if(message.sender === sessionStorage.getItem('user')){
                    console.log(sessionStorage.getItem('user'),'sender',message.sender)
                  li.classList.add('sent');
                 }else{
                  li.classList.add('received')
                }
                let mt = message.message.split(' ');
                mt.forEach((m,i)=>{
                  if(m.includes('.com')){
                    mt.splice(1,i,`<a href=${m}>${m}</a>`)
                    message.message = mt.join(' ')
                  }
                })
                li.innerHTML = message.message;
                li.id = 'm' + message._id.toString();
                messages.appendChild(li);
                window.scrollTo(0, document.body.scrollHeight);
              });
            }
            login(res.user.email);
          }
        })
        .catch((err) => {console.log(err)
          result.innerHTML = "There was error fetching your datails";
        });
}


//mine starts
// function login(from){
//   console.log(f.value)
//   sessionStorage.setItem('user',from);
//    socket.emit('login', from);
// }
/*
function allMessages(){

// Send a private message to another user
socket.emit('private message', {
    from: sessionStorage.getItem('user'),
    to: t.value,
    message: m.value
});
console.log(sessionStorage.getItem('user'),t.value)
}*/

let co = 0;
function typist(){
  co++
// Send a private message to another user
socket.emit('typing user', {
    from: sessionStorage.getItem('user'),
    to: sessionStorage.getItem('friend'),
    message:  sessionStorage.getItem('user')  + ' is typing ' + co
});
console.log(sessionStorage.getItem('user'))
}


//mine ends


// Listen for private messages
// socket.on('private message', data => {
//     let message = `Private message from ${data.from}: ${data.message}`;
//     console.log(message,typer.innerHTML);
//     typer.innerHTML = message;
// });

socket.on('private message', function(msg) {
    let received = messages.querySelectorAll('.received');
    let item = document.createElement('li');
   if(msg.to === sessionStorage.getItem('user')){
    if(received[0].classList[1] !== undefined){
      item.classList.add(received[0].classList[1]);
    }
      item.classList.add(received[0].classList[0]);
    }else{
      item.classList.add('sent')
    }
    item.id = msg.id;
    item.textContent = msg.message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });


socket.on('typing user', data => {
  let message = `Private message from ${data.from}: ${data.message}`;
    typer.innerHTML = message;
    console.log(`${data.message}...`);
});

socket.on('status', data => {
 let lists = messages.querySelectorAll('li');
 console.log(data)
 lists.forEach(list=>{
  let span = document.createElement('span')
    if(list.id === data.id){
      console.log(data.id)
      list.appendChild(span);
      span.textContent = 'sent';
      span.classList.add('sent-status') 
    }
 })
});


form.addEventListener('click', function(e) {
    e.preventDefault();
    let date = new Date()
    if (message.value) {
      socket.emit('private message', {
       from: sessionStorage.getItem('user'),
       to: sessionStorage.getItem('friend'),
       message: message.value,
       id: 'n' + date.getTime()
      });
      message.value = '';
      message.focus()
    }

  });
  /*
Homework
Here are some ideas to improve the application:

Broadcast a message to connected users when someone connects or disconnects.
Add support for nicknames.
Don’t send the same message to the user that sent it. Instead, append the message directly as soon as he/she presses enter.
Add “{user} is typing” functionality.
Show who’s online.
Add private messaging.
Share your improvements!
  */


//chris starts
const chrisemojis = "😀😃😄😁🚩🇳🇬🇲🇾🇺🇲🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🇿🇦🇮🇳🇬🇧🇪🇺🇫🇮👇"; 
 
let emojiArr = [] 
 
const splitter = str => { 
  const segmenter = new Intl.Segmenter("en", {granularity: 'grapheme'}); 
  const segitr = segmenter.segment(str); 
  emojiArr = Array.from(segitr, ({segment}) => segment); 
} 
 
splitter(chrisemojis) 
 
console.log(emojiArr,'all stops stops') 
 
emojiArr.map(emoji => { 
console.log(emoji) 
 
});
//chris ends
