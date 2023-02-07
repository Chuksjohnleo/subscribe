"use strict";
const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const joined = document.getElementById("joined");
const password = document.getElementById("password");
const username = document.getElementById('username');
const passwordf = document.getElementById("passwordf");
const passworde = document.getElementById("passworde");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const photoSpan = document.getElementById("photoSpan");
const photo = document.getElementById("photo");
const dark = document.querySelector(".dark");
const confirmer = document.getElementById('confirm');
const guide = document.getElementById('guide');
const cancel = document.getElementById("cancel");
const save = document.getElementById("save");
const edit = document.getElementById("edit");
const body = document.getElementById('body');
const emailChange = document.getElementById('emailChange');
const emailEnabler = document.getElementById('emailEnabler');
const cancelEnabler = document.getElementById('cancelEnabler');
const picsFile = document.getElementById('picsFile');
const uploadBtn = document.getElementById('uploadBtn');
const uploadsContainer = document.getElementById('uploadsContainer');
const profilePicture = document.getElementById('profilePicture');
const filename = document.getElementById("filename");

function choosePics(){
    uploadsContainer.style.display = 'flex';
}
 profilePicture.src = `/profile/upload-profile-pics/${sessionStorage.getItem('token')}`;
 picsFile.onchange = ()=>{
  profilePicture.src = `/profile/upload-profile-pics/${sessionStorage.getItem('token')}`;
  profilePicture.style.display = 'block';
  photoSpan.style.display = 'none';
  photo.style.background = 'aqua';
  filename.innerHTML = picsFile.value.replace(/.*[\/\\]/, '');
  profilePicture.src = URL.createObjectURL(picsFile.files[0]);
 }
function upload(){
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = 'uploading....';
  uploadBtn.style = 'background: aquamarine';
  let formData = new FormData();
  formData.append("pics",picsFile.files[0]);
  fetch("/upload-profile-pics", {
    method: "post",
    headers:{authorization:sessionStorage.getItem('token')},
    body: formData,
  })
    .then((res) => {
      return res.json();
    }).then(res=>{
      if(res.msg === 'successful'){
          uploadsContainer.style.display = 'none';
          sessionStorage.setItem("token",res.token);
          profilePicture.src = `/profile/upload-profile-pics/${sessionStorage.getItem('token')}`;
          profilePicture.style.display = 'block';
          photoSpan.style.display = 'none';
          photo.style.background = 'aqua';
          location.reload();
      }
    })
    .catch((err) => {
      console.log(err);
    });

}

cancelEnabler.style.display = 'none';
emailChange.style.display = 'none';

password.addEventListener('input',()=>{
  guide.innerHTML = '';
});
function back() {
  history.back();
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
      fetch(`${location.href}`, {
        method: "post",
        headers: { authorization: sessionStorage.getItem("token") },
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          console.log(res)
          if(res.error) return location.href = '/login';
          if(res.profilePicture){
             photoSpan.style.display = 'none';
             photo.style.background = 'aqua';
            }
          else profilePicture.style.display = 'none';
          lname.value = res.lastName;
          fname.value = res.firstName;
          email.value = res.email;
          joined.value = res.joined;
          username.value = res.username;
          passwordf.value = "•••••••";
          photoSpan.innerHTML =
            res.firstName[0].toUpperCase() + res.firstName[0].toUpperCase();
        })
        .catch((err) => {
          result.innerHTML = "There was error fetching your datails";
        });
    })
    .catch((err) => {
      window.location.href = "/login";
    });
}
window.onload=()=>checkUser();

function enable() {
  let inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    if(input === joined || input === passwordf || input === email ){
      input.disabled = true;
      return;
    };
    input.disabled = false;
    return;
  });
  cancel.style.display = "block";
  save.style.display = "block";
  edit.style.display = "none";
}
let e;
function enableLoginChange(login) {
  login.disabled = false;
 
}
emailEnabler.addEventListener('click',()=>{
  e = JSON.stringify(email.value);
  cancelEnabler.style.display = 'inline-block';
  emailChange.style.display = 'inline-block';
  enableLoginChange(email);
});
cancelEnabler.addEventListener('click',()=>{
  email.disabled = true;
  cancelEnabler.style.display = 'none';
  emailChange.style.display = 'none';
  email.value = JSON.parse(e);
})
emailChange.addEventListener('click',()=>{
  if(email.value === JSON.parse(e) || email.value.includes(' ') || !email.value.includes('.com') )return alert('Invalid or existing Email');
  confirmer.innerHTML = 
  `
  <p>
  <strong
    >Are sure you want to update your email to
    <span style="color:blue;word-wrap:break-word;max-width:95%;" id="detail">${email.value}</span>?</strong
  >
</p>
<div>
  <label class="bold block" for="password"
    >Put your password to continue</label
  >
   <input type="password" class="bold data" id="password-e" />
   <div><span class="bold" onclick="showpass()">Show password<span></div>
  <div id="guide" class="bold"></div>
</div>
<div id="result-e"></div>
<div><span id="spinner-e" class="spinner"></span></div>
<p class="c-btns">
  <button onclick="location.reload()" class="btn">cancel</button
  ><button id="update-e" class="btn" onclick="emailEdit()">Update</button>
</p>
  `
  reconfirm();
});

passChange.addEventListener('click',()=>{
 
});

function showpass(){
    let pass = document.getElementById("password-e");
    pass.type === 'password'?pass.type = 'text'
    :pass.type = 'password';
}
//I have to do this to avoid any error
function showpass2(){
  password.type === 'password'?password.type = 'text'
  :password.type = 'password';
}

async function emailEdit(){
let update = document.getElementById('update-e');
let spinner = document.getElementById("spinner-e");
let passworde = document.getElementById("password-e");
let result = document.getElementById('result-e');
if(!passworde.value.includes(' ') && passworde.value.length > 1){
spinner.classList.add("spin");
update.style = 'background:aqua;';
update.disabled = true;
  await fetch("/details", {
    method: "post",
    headers: { "Content-Type": "application/json" , authorization: sessionStorage.getItem("token") },
    body: JSON.stringify({
      newEmail:email.value,
      email:JSON.parse(e),
      password: passworde.value,
      modified: new Date()
    })
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      sessionStorage.clear();
      spinner.classList.remove("spin");
      confirmer.innerHTML = `<strong style="word-wrap:break-word;max-width:95%;color:blue;">Visit your email <span style="color:blue;">${email.value}</span> to confirm your email</strong><a class="block btn" href="/login">Back to login</a>`
   })
    .catch((err) => {
      update.disabled = false;
      update.style = 'background:white;';
      spinner.classList.remove("spin");
      result.innerHTML = "An error occurred, please try again.";
    });
  }else{
    result.innerHTML = "Please put your password";
  }
}



function reconfirm() {
  dark.style.display = "block";
}

function pEdit() {
  if(!email.value.includes('.com')){
    guide.innerHTML = 'invalid email address, maybe your email doesnt have ".com" extention';
    return;
  }
  if(password.value !== '' && password.value !== null && password.value !== '' && !password.value.includes(' ')){
    spinner.classList.add('spin');
  fetch("/reset", {
    method: "post",
    headers: { "Content-Type": "application/json" ,authorization: sessionStorage.getItem("token") },
    body:JSON.stringify({
      fname:fname.value,
      lname: lname.value,
      email: email.value,
      password: password.value,
      modified: new Date()
    })
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
      if(res === "incorrect password"){
        guide.innerHTML = '<strong class="block">Incorrect password</strong>';
        return;
    }
    if(res.token){
       sessionStorage.setItem('token',res.token)
       confirmer.innerHTML = '<strong class="block">Your details was saved successfully</strong><button style="text-align:center;" onclick="location.reload()" class="block btn">Ok</button>'
     } //confirm.innerHTML = '<strong class="block">Reset information have been sent to your email</strong><a href="/login" class="block link">Back to Login</a>'
    }).catch(result.innerHTML = 'There was error updating your profile')
}else{
  guide.innerHTML = 'Please fill your password';
}
}
//•••••••→←
