"use strict";

const confirmBtn = document.getElementById("confirmBtn");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const body = document.getElementById('body');
const users = document.getElementById('users');
const getusersbtn = document.getElementById('getusersbtn')
const welcome = document.getElementById('welcome');
const profilepics = document.getElementById('profilepics');
const linksContainer = document.getElementById('links-container');
const menuBtn = document.getElementById('menu-btn');

const bg = document.querySelectorAll('.bg');
const slider = document.getElementById('slider');
const colorName = document.getElementById('color-name');

function chooseBg(color){
for(let i=0;i<bg.length;i++){
  bg[i].style.transition = '1.5s';
  bg[i].style.background = color;
}
if(color === 'aqua') {
  slider.style.background = 'white';
  slider.classList.add('slide');
  colorName.innerText = 'Aqua';
}
else {
  slider.style.background = 'aqua';
  slider.classList.remove('slide');
  colorName.innerText = 'White';
}
}
slider.addEventListener('click',()=>{
  if(localStorage.getItem('bg-color') === 'white') localStorage.setItem('bg-color','aqua');
  else localStorage.setItem('bg-color','white');
  chooseBg(localStorage.getItem('bg-color'));
});

window.onload=()=>{
  if(localStorage.getItem('bg-color')){
    chooseBg(localStorage.getItem('bg-color'));
  }else{
    chooseBg('aqua')
  }
 
}

root.onclick=()=>{
  if(linksContainer.className.includes('flex')){
    linksContainer.classList.add('links-none');
    return linksContainer.classList.remove('flex');
  }
}

menuBtn.addEventListener('click',()=>{
 if(!linksContainer.className.includes('flex')){
  linksContainer.classList.remove('links-none')
  return linksContainer.classList.add('flex');
}
 else {
  linksContainer.classList.add('links-none');
  return linksContainer.classList.remove('flex');
}
});

async function checkUser() {
  await fetch(`${location.href}/user-session`, {
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
      welcome.textContent = res.user;
      profilepics.src = `/profile/get-profile-pics/${res.profilePicture}`
      body.style.display = 'block';
      document.getElementById("profileLink").href = res.user + "/profile";
      document.getElementById("chats").href = res.user + "/chats";
    })
    .catch((err) => {
      window.location.href = "/login";
    });
}
checkUser();


async function confirmData() {
  spinner.classList.add("spin");
  confirmBtn.classList.add("opaque");
  result.innerHTML = "";
  confirmBtn.disabled = true;
  await fetch("/confirm-data", {
    method: "post",
    headers: { authorization: sessionStorage.getItem("token") },
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      spinner.classList.remove("spin");
      if (res.message) {
        confirmBtn.style.display = "none";
        result.style.display = "block";
        result.innerHTML = res.message;
        return;
      }
      confirmBtn.classList.remove("opaque");
      confirmBtn.disabled = false;
      result.style.display = "block";
      res.errorMessage
        ? (result.innerHTML = res.errorMessage)
        : res.error
        ? (result.innerHTML = res.error)
        : (result.innerHTML = "An error occurred, please try again" );
    })
    .catch((err) => {
      spinner.classList.remove("spin");
      result.innerHTML = "An error occurred, please try again.";
    });
}
confirmBtn.addEventListener("click", confirmData);

async function getUsers(){
  getusersbtn.disabled = true;
  spinner.classList.add("spin");
  await fetch("/home/fetch-other-users", {
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
if(res.length > 0){

    res.forEach(resp => {
      
    let div = document.createElement('div');
    div.classList.add('user')
    div.innerHTML = 
        `
           <div class="user-p">
            <div class="pics-container"><img class="profilepics" alt="profilepics" src="/profile/get-profile-pics/${resp.profilePicture}" height="200px" width="200px"/></div>
            <span class="user-detail" style="text-align:center;" id=${resp.email}>${resp.username}</span>
            <div class="add-btn-wrapper" id='btnContainer'>
              <button class="add-btn adder" value=${resp._id}>Add</button>
            </div>
           </div>
        `
        users.appendChild(div);
      });

      let friends = users.querySelectorAll('.adder');
        for(let f=0; f<friends.length;f++){
          let friend = friends[f];
        friend.addEventListener('click',()=>{
         friend.textContent = 'Adding ...';
         friend.disabled = true;
          fetch('/home/addfriends',{
            method: "post",
            headers: { 
                       'Content-Type' : 'application/json',
                       authorization: sessionStorage.getItem("token")
                     },
            body: JSON.stringify({
              friend: friend.value
            })
          }).then(res=>{
            return res.json()
          }).then(res=>{
           
            if(res === 'Added'){
              friend.textContent = 'Added';
              return;
            }
            friend.textContent = 'failed to add';
          }).catch((e)=>{
            friend.textContent = 'failed to add'
          })
        })
        }
      }else{
        users.innerHTML = `<div class="user-p">
        <div class="add-btn-wrapper" style='font-weight:900;' id='btnContainer'>
           No users to show
        </div>
       </div>`
      }
    })
    .catch(err=>{
      spinner.classList.remove("spin");
      result.innerHTML = 'failed';
    })
}
