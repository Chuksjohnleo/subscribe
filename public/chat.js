const socket = io();
const form = document.getElementById("form-btn");
const input = document.getElementById("input");
const message = document.getElementById("message");
const body = document.getElementById("body");
const typer = document.getElementById("typer");
const friend = document.getElementById("friend");
const messages = document.getElementById("messages");
const changeBg = document.getElementById("change-bg");
const backBtn = document.getElementById("back-btn");
const backBtn1 = document.getElementById("back-btn1");
const nav = document.querySelectorAll("nav")[0];
const friendslist = document.getElementById("friendslist");
const friendName = document.getElementById("friend-name");
const users = document.getElementById("users");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const chatProper = document.getElementById("chat-proper");
const emojibtn = document.getElementById('emojibtn')
const emojiContainer = document.getElementById("emojis");

document.querySelector('[contenteditable]').addEventListener('paste', function(e) {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text);
});


body.style.display = "none";
backBtn.style.display = "none";
changeBg.style.display = "none";

function changeBackground() {
  let received = messages.querySelectorAll(".received");
  body.classList.toggle("aqua");
  received.forEach((r) => {
    r.classList.toggle("background");
  });
}

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const startDate = new Date();

function login(from) {
  socket.emit("login", from);
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
      body.style.display = "block";
    })
    .catch((err) => {
      window.location.href = "/login";
    });
}
checkUser();

function removeFriendslist() {
  friendslist.classList.add("none-friends");
}

function addFriendslist() {
  location.reload();
  sessionStorage.removeItem("friend");
}

function provideNav(friend) {
  backBtn.style.display = "inline-block";
  changeBg.style.display = "inline-block";
  friendName.innerHTML = friend;
  nav.classList.add("h-100");
  backBtn1.style.display = "none";
}

function chatFriend(friend) {
  typer.innerHTML = 'Loading Chat messages....';
  removeFriendslist();
  provideNav(friend);
  messages.innerHTML = "";
  fetch(`${location.href}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: sessionStorage.getItem("token"),
    },
    body: JSON.stringify({ friend: friend }),
  })
    .then((res) => {
     
      return res.json();
    })
    .then((res) => {
    
      if (res.error) {
        location.href = "/login";
        return;
      }
      body.classList.add("white");
      chatProper.style.display = "block";
      sessionStorage.setItem("friend", friend);
      sessionStorage.setItem("user", res.user.email);
      const unsent = {};
      unsent[friend] = [];
    
       if(!sessionStorage.getItem(`unsent${friend}`)){
         sessionStorage.setItem(`unsent${friend}`,JSON.stringify(unsent));
     }
 
      if (res.messages) {
        typer.innerHTML = '';
        if (res.messages.length > 0) {
          
          res.messages.forEach((message,i) => {
            let  daylist = document.createElement("p");
            daylist.style = 'font-weight: 800;'
            if(i==0){
              //the initial date should be the day a chat was started
            let d = new Date(res.messages[0].time);
            let sp = document.createElement('span');
            daylist.classList.add('daylist');
            sp.innerHTML = `${d.toDateString()}`;
            daylist.appendChild(sp);
            messages.appendChild(daylist);
           
            }  
           
            //initial date code ends

            let li = document.createElement("p");
            let nspan = document.createElement("span");
            nspan.classList.add('nspan');
            //.style="text-align:left;display:inline-block; word-wrap: break-word;max-width: 24.5vw;"
            li.appendChild(nspan);
            nspan.textContent = message.message;
            //jk
            const date =  new Date(message.time);
           if(i>=1){
            let d = new Date(res.messages[i-1].time);
            if(date.getDate() !== d.getDate()){
              let sp = document.createElement('span');
              daylist.classList.add('daylist');
              sp.innerHTML = `${date.toDateString()}`;
              daylist.appendChild(sp);
              messages.appendChild(daylist);
             
            }
           }

           //use 12hour clock 
            let daytime = [
                            12,1,2,3,4,5,
                            6,7,8,9,10,
                            11,12,1,2,3,4,
                            5,6,7,8,9,10,
                            11,12
                          ]
            let time = date.getHours();
            let hour = daytime[time];
            let ampm = '';
            if(time >= 12){
                ampm = 'pm'
            }else{
              ampm = 'am'
            }
            // span.textContent = `${hour}:${date.getMinutes()} ${ampm}`;
            //jk
            li.id = "m" + message._id.toString();
            let span = document.createElement("span");
            let n;
            let a = date.getMinutes().toString();
          if(a.length>1)n=''
          else n=0
            if (message.sender === sessionStorage.getItem("user")) {
              li.classList.add("sent");
              span.classList.add("sent-status");
              if (message.seen === true) {
                span.textContent = `${hour}:${n}${date.getMinutes()} ${ampm} √√`;
              } else {

                span.textContent = `${hour}:${n}${date.getMinutes()} ${ampm} √`;
              }
            } else {
              span.classList.add("sent-status-r");
              span.textContent = `${hour}:${n}${date.getMinutes()} ${ampm}`;
              li.classList.add("received");
            }
            li.appendChild(span);
            li.classList.add('message-p')
            messages.appendChild(li);
            tobottom.scrollIntoView();
            window.scrollTo(0, document.body.scrollHeight);
          });
             //update the date if its a new day
             let lastchat = new Date(res.messages[res.messages.length-1].time)
             if(lastchat.getDay() !== startDate.getDay()){
              let  daylist = document.createElement("p");
              daylist.style = 'font-weight: 800;'
              let d = new Date();
              let sp = document.createElement('span');
              daylist.classList.add('daylist');
              sp.innerHTML = `${d.toDateString()}`;
              daylist.appendChild(sp);
              messages.appendChild(daylist);
             }
          }else{
          let  daylist = document.createElement("p");
          daylist.style = 'font-weight: 800;'
          let d = new Date();
          let sp = document.createElement('span');
          daylist.classList.add('daylist');
          sp.innerHTML = `${d.toDateString()}`;
          daylist.appendChild(sp);
          messages.appendChild(daylist);
        }
        
    //     let parsed = JSON.parse(sessionStorage.getItem(`unsent${sessionStorage.getItem("friend")}`));
    //     parsed[sessionStorage.getItem("friend")].forEach((e,i)=>{
    //    sendUnsent(e);
    // });
   
        login({ user: res.user.email, friend: friend });
      }
    })
    .catch((err) => {
      result.innerHTML = "There was error fetching your datails";
      
    });
}

async function getfriends() {
  spinner.classList.add("spin");
  await fetch("/chats/getfriends", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      authorization: sessionStorage.getItem("token"),
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      spinner.classList.remove("spin");
      res.forEach((resp) => {
        let div = document.createElement("div");
        div.classList.add("user");
        div.innerHTML = `
           <div class="user-p">
              <span class="user-detail" id=${resp}>${resp}</span>
            </div>
        `;
        users.appendChild(div);
      });
      if (res.length > 0) {
        let friends = users.querySelectorAll(".user-detail");
        for (let f = 0; f < friends.length; f++) {
          let friend = friends[f];
          friend.addEventListener("click", () => {
            chatFriend(friend.textContent);
          });
        }
      }
    })
    .catch((err) => {
      spinner.classList.remove("spin");
      spinner.innerHTML = "failed fetch friends, please retry 😭😭";
    });
}

window.onload = () => {
  if (sessionStorage.getItem("friend")) {
    message.textContent = sessionStorage.getItem(`draft${sessionStorage.getItem("friend")}`)
    chatFriend(sessionStorage.getItem("friend"));
    getfriends();
    return;
  }
  getfriends();
};

function typist() {
  sessionStorage.setItem(`draft${sessionStorage.getItem("friend")}`,message.textContent);
  emojiContainer.style.display = 'none';
  if (message.textContent.length > 0) {
    socket.emit("typing user", {
      from: sessionStorage.getItem("user"),
      to: sessionStorage.getItem("friend"),
      message: "typing",
      info: message.textContent
    });
    return;
  }
  socket.emit("typing user", {
    from: sessionStorage.getItem("user"),
    to: sessionStorage.getItem("friend"),
    message: "Online",
  });
}

const small_screen = window.matchMedia('(max-width:500px)');
const touch_screen = window.matchMedia('(hover:none)');
window.onfocus=()=>{
  if(small_screen.matches && touch_screen.matches){
    location.reload();
  }
  return;
}

socket.on("typing user", (data) => {
  
  if (data.message === "typing") {
    let message = `Your friend is typing... ${data.info}`;
    typer.innerHTML = message;
    return;
  }
  typer.innerHTML = data.message;
});

let a = "Offline";
socket.on("isOnline", function (msg) {
  //friend who just came online
  if (msg.friend === sessionStorage.getItem("user")) {
    socket.emit("Online too", {
      from: sessionStorage.getItem("user"),
      to: sessionStorage.getItem("friend"),
    });

    a = "Online";
    typer.innerHTML = "Online";
    let lists = messages.querySelectorAll(".sent");
    lists.forEach((list) => {
      let span = list.querySelectorAll("span")[1];
      if (!span.textContent.includes("√√")){
        span.textContent += "√";
      }
    });
  }
});

socket.on("Online too", function (msg) {
  //first person to come online
  if (msg.to === sessionStorage.getItem("user")) {
    a = "Online";
    typer.innerHTML = a;
    let lists = messages.querySelectorAll(".sent");
    lists.forEach((list) => {
      let span = list.querySelectorAll("span")[1];
      if (!span.textContent.includes("√√")) {
        span.textContent += "√";
      }
    });

  }
});

socket.on("isOffline", function (msg) {
  if (msg === sessionStorage.getItem("friend")) {
    typer.innerHTML = "Offline";
    a = "Offline";
  }
});
  
function newMessage(msg){
  let li = document.createElement("p");
  let nspan = document.createElement("span");
  nspan.classList.add('nspan');
  //="text-align:left;display:inline-block; word-wrap: break-word;max-width: 24.5vw;"
  li.appendChild(nspan);
  nspan.textContent = msg.message;

  //set time
   
    const date =  new Date(msg.time);
   
    let daytime = [
                    12,1,2,3,4,5,
                    6,7,8,9,10,
                    11,12,1,2,3,4,
                    5,6,7,8,9,10,
                    11,12
                  ]
    let span = document.createElement("span");
    let time = date.getHours();
    let hour = daytime[time];
    let ampm = '';
    if(time >= 12){
        ampm = 'pm'
    }else{
      ampm = 'am'
    }
    let n;
    let at = date.getMinutes().toString();
    if(at.length>1)n=''
    else n=0
    span.textContent = `${hour}:${n}${date.getMinutes()} ${ampm}`;
    span.classList.add("sent-status");
  
  li.id = msg.id;
  li.appendChild(nspan);
  li.appendChild(span);
  li.classList.add("sent")
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
  tobottom.scrollIntoView();
  typer.innerHTML = a;
}

function sendUnsent(message){
  newMessage(message);
  socket.emit("private message", {
    from: sessionStorage.getItem("user"),
    to: sessionStorage.getItem("friend"),
    message: message.message,
    time:message.time,
    id: message.id,
  });
}


socket.on("private message", function (msg) {
  let received = messages.querySelectorAll(".received")[0];
  let li = document.createElement("p");
  let nspan = document.createElement("span");
  nspan.classList.add('nspan');
  li.appendChild(nspan);
  nspan.textContent = msg.message;

  //set time
   
    const date =  new Date(msg.time);
   
    let daytime = [
                    12,1,2,3,4,5,
                    6,7,8,9,10,
                    11,12,1,2,3,4,
                    5,6,7,8,9,10,
                    11,12
                  ]
    let span = document.createElement("span");
    let time = date.getHours();
    let hour = daytime[time];
    let ampm = '';
    if(time >= 12){
        ampm = 'pm'
    }else{
      ampm = 'am'
    }
    let n;
    let at = date.getMinutes().toString();
    if(at.length>1)n=''
    else n=0
    span.textContent = `${hour}:${n}${date.getMinutes()} ${ampm}`;
    span.classList.add("sent-status");
    span.classList.add("sent-status-r");
  
  if (msg.to === sessionStorage.getItem("user")) {
    if (received) {
      if (received.classList[1] !== undefined) {
        li.classList.add(received.classList[1]);
      }
      li.classList.add(received.classList[0]);
    } else {
      li.classList.add("received");
    }
   
  li.id = msg.id;
  li.appendChild(nspan);
  li.appendChild(span);
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
  tobottom.scrollIntoView();
  typer.innerHTML = a;
} else {
  let parsed = JSON.parse(sessionStorage.getItem(`unsent${sessionStorage.getItem("friend")}`));
  parsed[sessionStorage.getItem("friend")].forEach((e,i)=>{
    if(e.id === msg.id){
      if(i>0){
      parsed[sessionStorage.getItem("friend")].splice(i,1);
      }else{
        parsed[sessionStorage.getItem("friend")].splice(0)
      }
    }
  });
  
  sessionStorage.setItem(`unsent${sessionStorage.getItem("friend")}`,JSON.stringify(parsed));
}
});


socket.on("status1", (data) => {
 
  let lists = messages.querySelectorAll("p");
  lists.forEach((list) => {
    // let span = document.createElement("span");
    let span = list.querySelectorAll("span")[1];
    if (list.id === data.id) {
   
      span.textContent += " √";
      
    }
  });
});

socket.on("status2", (data) => {
  let lists = messages.querySelectorAll("p");
  lists.forEach((list) => {
    let span = list.querySelector(".sent-status");
    if (list.id === data.id) {
      span.textContent += "√";
    }
  });
});

function convertToLink(message){
  let mt = message.textContent.split(" ");
  mt.forEach((m, i) => {
    let link = m.split('.');
   
    if (m.includes(".") && m.length > 4) {
      if(m[m.length-1] === '.' || m[m.length-1] === '?' || m[m.length-1] === ',' || m[m.length-1] === ':' || m[m.length-1] === ';'){ 
        if(link.length > 2 && !link.includes('')){
          mt[i] = `<a style="text-decoration:underline;color:white;" href="https://${m.slice(0,m.length-1)}">${m.slice(0,m.length-1)}</a><span>${m[m.length-1]}</span>`;
         }
         return;
      }
      //if it doesn't contain <2 dots and doesn't start with a dot.
      if(!link.includes('')) mt[i] = `<a style="text-decoration: underline;color:white;" href="https://${m}">${m}</a>`;
    }
  });

  message.textContent = mt.join(" ");
}


form.addEventListener("click", function () {
  //check whether the date is still the same for midnight chats
  let currentDate = new Date();
  let  daylist = document.createElement("p");
  daylist.style = 'font-weight: 800;'
  if(currentDate.getDay() !== startDate.getDay()){
  let sp = document.createElement('span');
  daylist.classList.add('daylist');
  sp.innerHTML = `${currentDate.toDateString()}`;
  daylist.appendChild(sp);
  messages.appendChild(daylist);
 
  }  
  //check date ends
  sessionStorage.removeItem(`draft${sessionStorage.getItem("friend")}`)
  let date = new Date();
  if (message.textContent.length > 0 && message.textContent.length < 10000) {
    let parsed = JSON.parse(sessionStorage.getItem(`unsent${sessionStorage.getItem("friend")}`));
  
    let theMessage = {
      from: sessionStorage.getItem("user"),
      to: sessionStorage.getItem("friend"),
      message: message.textContent,
      time:Date(),
      id: "n" + date.getTime(),
    };
    
    //  let newmessages =
      parsed[sessionStorage.getItem("friend")][parsed[sessionStorage.getItem("friend")].length]=theMessage;

    sessionStorage.setItem(`unsent${sessionStorage.getItem("friend")}`,JSON.stringify(parsed))
    newMessage(theMessage);
    socket.emit("private message", {
      from: sessionStorage.getItem("user"),
      to: sessionStorage.getItem("friend"),
      message: message.textContent,
      time:Date(),
      id: "n" + date.getTime(),
    });
    message.textContent = "";
    message.focus();
  }
});



const emojis = 
`😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 🥲 😋 
😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 🤥 😌 😔 
😪 🤤 😴 😷 🥴 🥶 🥵 🤧 🤮 🤢 🤕 😕 😟 🤯 🙁 ☹ 😮 😯 😰 😥 😢 
😭 🥱 😫 😱 😡 🤬 😠 💔 💖 ❤ 💯 🙏 🤝 👍 👉 👈 👆 🙋 🙆‍♂️ 🙆‍♀️ 🐵 
🐒 🦍 🦊 🐺 🐮 🐯 😻 😹 😸 😺 🙉 🙈 🙊 🐻 🦔 🦫 🐿 🐇 🦣 🐐 🐑 🐫 
🐪 🦙 🪱 🌺 🌳 🌲 🪴 🦠 🍏 🍍 🍑 🍗 🍖 🧀 🧇 🥞 🥜 🥒 🥬 🥠 🥟 🥮 
🎂 🍯 🍷 🍾 🥂 🍻 🍺 🌍 🌐 🧭 🏰 🚍 🚖 🚎 🚐 🚒 🚑 🛵 🛺 🛩 ✈ ⛵ 
🛶 ☄ 🔥 🏀 ⚽️ 🥈 🥇 🥉 🎗 🎁 🖼 📢 🎶 🎤 🎧 🎺 📞 🖥 💻 🔦 📚 📓 📒 
📃 📔 📕 📜 📄 📰 📗 📘 💡 🕯 🔎 📹 📸 📷 📭 📬 📧 📨 📐 📏 ✂️ 🗝 🔐 
🔓 🔒 ⚰ 🔭 📡 🧬 🔞 🏧 🚮 ✝️ ❌ ❎ 1️⃣ #️⃣ *️⃣ 0️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 
8️⃣ 9️⃣ 🔟 🆚️ 🆙️ 🆘️ 🆗️ 🆖️ 🟥 🔵 🔻 🔘 🏁 🚩 👇 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🏴󠁧󠁢󠁳󠁣󠁴󠁿 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🏴󠁧󠁢󠁳󠁣󠁴󠁿 🇿🇦 🇮🇳 🇫🇮 k n j`

const openEmojis = ()=>{
  message.focus();
  if(emojiContainer.style.display === 'none'){
    emojiContainer.style.display = 'block';
    return;
  }
  emojiContainer.style.display = 'none';
}


const emojiArray = emojis.split(' ');

function setCursor(field,pos) {
  var range = document.createRange();
  var selected = window.getSelection();
  range.setStart(field.childNodes[0], pos);
  range.collapse(true);
  selected.removeAllRanges();
  selected.addRange(range);
  field.focus();
}


 emojiArray.forEach(emoji=>{
  let button = document.createElement("button");
  button.value = emoji;
  button.textContent = emoji;
  button.classList.add('emoji');
  emojiContainer.appendChild(button);
  button.addEventListener('click',()=>{
    let st = window.getSelection();
    let wp = st.focusOffset;
    if(wp<1){
   let m =  button.textContent+message.textContent;
   message.textContent = m;
      return;
    }
    let m2 = ''+message.textContent[wp-1]+''+button.textContent+'';
    let m3 = message.textContent.split('');
     m3[wp-1] = m2;
    //message.textContent+=button.textContent;
    message.textContent = m3.join('');
    setCursor(message,m2.length+(wp-1));
  });
});



message.onclick=()=>{
  if(emojiContainer.style.display === 'block'){
    emojiContainer.style.display = 'none';
  }
  return;
}


emojibtn.addEventListener('click',openEmojis)