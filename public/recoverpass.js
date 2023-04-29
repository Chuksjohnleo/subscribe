const form = document.getElementById("form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const submitBtn = document.getElementById("submitBtn");
const submitBtnE = document.getElementById("submitBtn-e");
const visibility = document.getElementById("visibility");
const visibilityText = document.getElementById("visibilityText");
const emailContainer = document.getElementById('email-container');
const passContainer = document.getElementById('pass-container');
const inputs = passContainer.querySelectorAll("input");
const resetCode = document.getElementById('code-reset');
const confirmPassword = document.getElementById('confirm-password')

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
  if(sessionStorage.getItem('stillon')) passReset();
}


visibility.addEventListener("click", () => {
  if (visibility.checked) {
    visibilityText.innerText = "Hide password";
    confirmPassword.type = 'text';
    return (password.type = "text");
  }
  visibilityText.innerText = "Show password";
  confirmPassword.type = 'password'
  return (password.type = "password");
});

function handleInputs(value1, value2) {
  result.innerHTML = "";
  if (value1 === "" || value1 === null || value2 === "" || value2 === null) {
    result.innerHTML = "please fill all the details";
    submitBtn.disabled = true;
    submitBtn.classList.remove("submit");
    return false;
  }
  submitBtn.disabled = false;
  submitBtn.classList.add("submit");
  return true;
}
inputs.forEach((input) => {
  input.addEventListener("input", () =>
    handleInputs(confirmPassword.value, password.value)
  );
});

function passReset(){
    emailContainer.innerHTML = '<p style="font-weight: 800;color: blue;background: white;">Password reset code sent successfully, go to your email and copy the code to reset your password</p>';
    passContainer.style.display = 'flex';
}



function submit() {
 result.innerHTML = "";
 const checkinput =  handleInputs(confirmPassword.value, password.value)
 if(!checkinput) return result.innerHTML = 'Fill all fields'
 if(password.value !== confirmPassword.value) return result.innerHTML = "Passwords doesn't match";

  submitBtn.disabled = true;
  spinner.classList.add("spin");
  fetch("/r/recover-pass/change-p", {
    method: "post",
    headers: { 
               "Content-Type": "application/json",
               authorization:sessionStorage.getItem('passtoken')
            },
    body: JSON.stringify({
      email: sessionStorage.getItem('stillon').toLowerCase(),
      password: password.value,
      code: resetCode.value
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      submitBtn.disabled = false;
      spinner.classList.remove("spin");
      if (res.msg) {
        form.innerHTML = res.msg;
        sessionStorage.clear();
        return;
      }
      result.innerHTML = res;
    })
    .catch((err) => {
      submitBtn.disabled = false;
      spinner.classList.remove("spin");
      result.innerHTML = "An error occured";
    });
}
//sessionStorage.clear()
function confirmUser() {
    result.innerHTML = "";
    submitBtnE.disabled = true;
    spinner.classList.add("spin");
    sessionStorage.clear()
  
    fetch("/r/recover-pass/confirm-e", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value.toLowerCase(),
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        submitBtnE.disabled = false;
        spinner.classList.remove("spin");
        if (res.message) {
         sessionStorage.setItem("stillon", email.value);
         sessionStorage.setItem("passtoken", res.token);
         emailContainer.innerHTML = res.message;
         passContainer.style.display = 'flex';
          return;
        }
        if (res.error) {
             emailContainer.innerHTML = res.error;
             return;
           }
       
      })
      .catch((err) => {
        submitBtnE.disabled = false;
        spinner.classList.remove("spin");
        result.innerHTML = "An error occured";
      });
  }
  