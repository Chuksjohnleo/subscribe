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
const visibility = document.getElementById('visibility');
const visibilityText = document.getElementById('visibilityText');

visibility.addEventListener('click',()=>{
  if(visibility.checked){
    visibilityText.innerText = 'Hide password';
    return password.type = 'text';
  }
  visibilityText.innerText = 'Show password'
  return password.type = 'password';
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

function submit() {
 if(username.value.includes(' ') || username.value.length < 2){
  result.innerHTML = 'You must have a username';
  return;
 }
 if(!email.value.includes('.') || email.value[0] === '.' || email.value[email.value.length-1] === '.'){
  result.innerHTML = 'You must have a proper email';
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
      window.location.href = `/${username.value}`;
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