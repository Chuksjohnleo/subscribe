const socket = io();
const form = document.getElementById('form-btn');
const input = document.getElementById('input');
const message = document.getElementById('message');
const body = document.getElementById('body');
const typer = document.getElementById('typer');
const friend = document.getElementById('friend');
const messages = document.getElementById('messages');
const changeBg = document.getElementById('change-bg');
const backBtn = document.getElementById('back-btn');
const backBtn1 = document.getElementById('back-btn1');
const nav =  document.querySelectorAll('nav')[0];
const friendslist = document.getElementById('friendslist');
const friendName = document.getElementById('friend-name');
const users = document.getElementById('users');
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const chatProper = document.getElementById('chat-proper');




body.style.display = 'none';
backBtn.style.display = 'none';
changeBg.style.display = 'none';


function changeBackground(){
  let received = messages.querySelectorAll('.received');
  body.classList.toggle('aqua');
  received.forEach(r=>{
    r.classList.toggle('background')
  });
}

const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const d = new Date()
tobottom.innerHTML = d.toDateString();

function login(from){
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

function removeFriendslist(){
  friendslist.classList.add('none-friends');
}

function addFriendslist(){
 location.reload();
 sessionStorage.removeItem('friend');
}

function provideNav(friend){
    backBtn.style.display = 'inline-block';
    changeBg.style.display = 'inline-block';
    friendName.innerHTML = friend;
    nav.classList.add('h-100');
    backBtn1.style.display = 'none';
   }

  


function chatFriend(friend){
  removeFriendslist();
  provideNav(friend);
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
          body.classList.add('white');
          chatProper.style.display = 'block';
          sessionStorage.setItem('friend',friend)
          sessionStorage.setItem('user',res.user.email)
          if(res.messages){
            if(res.messages.length > 0){
              res.messages.forEach(message => {
                let li = document.createElement('li');
                let mt = message.message.split(' ');
                mt.forEach((m,i)=>{
                  if(m.includes('.com')){
                    mt.splice(1,i,`<a href="https://${m}">${m}</a>`)
                    message.message = mt.join(' ')
                  }
                })
                li.innerHTML = message.message;
                li.id = 'm' + message._id.toString();
                if(message.sender === sessionStorage.getItem('user')){
                  li.classList.add('sent');
                  let span = document.createElement('span');
                  if(message.seen === true){
                 span.textContent = 'seen';
               }else{
                     span.textContent = 'sent';
                }
                span.classList.add('sent-status');
                li.appendChild(span);
              }else{
                li.classList.add('received')
              }
                messages.appendChild(li);
                tobottom.scrollIntoView();
                window.scrollTo(0, document.body.scrollHeight);
              });
            }
            login({user:res.user.email,friend:friend});

          }
        })
        .catch((err) => {
          result.innerHTML = "There was error fetching your datails";
        });
}


async function getfriends(){
   spinner.classList.add("spin");
  await fetch('/chats/getfriends', {
    method: "get",
    headers: { 
               'Content-Type' : 'application/json',
               authorization: sessionStorage.getItem("token")
             }
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      spinner.classList.remove("spin");
      res.forEach(resp => {
    let div = document.createElement('div');
    div.classList.add('user')
    div.innerHTML = 
        `
           <div class="user-p">
              <span class="user-detail" id=${resp}>${resp}</span>
            </div>
        `
        users.appendChild(div);
      });
      if(res.length > 0){
      let friends = users.querySelectorAll('.user-detail');
        for(let f=0; f<friends.length;f++){
          let friend = friends[f];
           friend.addEventListener('click',()=>{
         chatFriend(friend.textContent);
        })
        }
      }
    })
    .catch(err=>{
       spinner.classList.remove("spin");
      spinner.innerHTML = 'failed fetch friends, please retry 😭😭';
    })
}

window.onload =()=>{ 
  if(sessionStorage.getItem('friend')){
    chatFriend(sessionStorage.getItem('friend'));
    getfriends();
    return;
  }
  getfriends()
};

function typist(){
  if(message.value){
socket.emit('typing user', {
    from: sessionStorage.getItem('user'),
    to: sessionStorage.getItem('friend'),
    message: 'typing'
  });
  return;
  }
  socket.emit('typing user', {
    from: sessionStorage.getItem('user'),
    to: sessionStorage.getItem('friend'),
    message:  "Online"
  });
}

socket.on('typing user', (data) => {
  if(data.message === 'typing'){
    let message = `${data.from.substring(0,3)} is typing ...`;
    typer.innerHTML = message;
    return;
  }
  typer.innerHTML = data.message;
});



let a = 'Offline'
socket.on('isOnline', function(msg) {
  if(msg.friend === sessionStorage.getItem('user')){

    socket.emit('Online too', {
      from: sessionStorage.getItem('user'),
      to: sessionStorage.getItem('friend')
     });

    a = 'Online';
    typer.innerHTML = 'Online';
    let lists = messages.querySelectorAll('.sent');
    lists.forEach(list=>{
      let span = list.querySelectorAll('span')[0];
      if(span.textContent === 'sent'){
        span.textContent = 'seen';
      }
    })
  }
});


  socket.on('Online too',function(msg) {
    if(msg.to === sessionStorage.getItem('user')){
      typer.innerHTML = 'Online';
      a = 'Online'
    }
   });



socket.on('isOffline', function(msg) {
   if(msg === sessionStorage.getItem('friend')){
    typer.innerHTML = 'Offline';
    a='Offline'
   }
})

socket.on('private message', function(msg) {
    let received = messages.querySelectorAll('.received')[0];
    let item = document.createElement('li');
   if(msg.to === sessionStorage.getItem('user')){
    if(received){
    if(received.classList[1] !== undefined){
      item.classList.add(received.classList[1]);
    }
      item.classList.add(received.classList[0]);
  }else{
    item.classList.add('received');
  }
    }else{
      item.classList.add('sent')
    }
    item.id = msg.id;
    item.textContent = msg.message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    tobottom.scrollIntoView()
    typer.innerHTML = a;
  });


socket.on('status1', data => {
 let lists = messages.querySelectorAll('li');
 lists.forEach(list=>{
  let span = document.createElement('span')
    if(list.id === data.id){
      list.appendChild(span);
      span.textContent = 'sent';
      span.classList.add('sent-status') 
    }
 })
});

socket.on('status2', data => {
  let lists = messages.querySelectorAll('li');
  lists.forEach(list=>{
   let span = list.querySelector('span');
     if(list.id === data.id){
       span.textContent = 'seen';
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
 