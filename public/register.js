const form = document.getElementById('form');
const inputs = form.querySelectorAll('input');
const email = document.getElementById("email");
const password = document.getElementById("password");
const result = document.getElementById('result');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');
const fname = document.getElementById('fname');
const lname = document.getElementById('lname');
const username = document.getElementById('username');
const radios = document.querySelectorAll('.input-radio');
const visibility = document.getElementById('visibility');
const visibilityText = document.getElementById('visibilityText');

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



visibility.addEventListener('click',()=>{
  if(visibility.checked){
    visibilityText.innerText = 'Hide password';
    return password.type = 'text';
  }
  visibilityText.innerText = 'Show password'
  return password.type = 'password';
});

let gender = '';
radios.forEach(r=>{
 
    r.addEventListener('click',()=>{
      if(r.checked){
        gender = r.value;
        
      }
    })
  
})

function handleInputs(value1,value2,value3,value4){
 
      result.innerHTML = '';
      if(value1 === '' || value1.includes(' ') || value1 === null || value2 === '' || value2 === null || value3 === '' || value3 === null || value4 === '' || value4 === null){
       result.innerHTML = 'please fill all the details properly';
       submitBtn.disabled = true;
       submitBtn.classList.remove('submit');
       return false;
      }
     submitBtn.disabled = false;
     submitBtn.classList.add('submit');
     return true;
}

inputs.forEach(input=>{
  input.addEventListener('input',()=>handleInputs(email.value,password.value,fname.value,lname.value))
});

function submit(){
  //if(!navigator.onLine)return result.innerHTML = 'offline'
 if(username.value.includes(' ') || username.value.length < 2){
  result.innerHTML = 'You must have a username';
  return;
 }
 if(!email.value.includes('.') || !email.value.includes('@') || email.value[0] === '.' || email.value[email.value.length-1] === '.'){
  result.innerHTML = 'You must have a proper email';
  return;
 }
 if(gender.length<3){
  result.innerHTML = 'Please select your gender';
  return;
 }
 let ready = handleInputs(email.value,password.value,fname.value,lname.value);
 if(ready){
  result.innerHTML = '';
  submitBtn.disabled = true;
  spinner.classList.add('spin');
 
  fetch("/register", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fname:fname.value,
      lname: lname.value,
      email: email.value.toLowerCase(),
      password: password.value,
      username: username.value,
      gender:gender,
      joined: new Date()
    })
  })
    .then((res) => {
      return res.json();
    })
    .then(res=>{
      submitBtn.disabled = false;
      spinner.classList.remove('spin');
      if(res.token){
      sessionStorage.setItem('token',res.token);
      window.location.href =`/verify-your-email`
      //window.location.href = `/${username.value}`;
      return;
      }
    result.innerHTML = res;
    })
    .catch((err) => {
      spinner.classList.remove('spin');
      result.innerHTML = 'An error occured';
    });
  }
}