const form = document.getElementById("form");
const inputs = form.querySelectorAll("input");
const email = document.getElementById("email");
const password = document.getElementById("password");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const submitBtn = document.getElementById("submitBtn");
const visibility = document.getElementById("visibility");
const visibilityText = document.getElementById("visibilityText");
sessionStorage.clear();

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




visibility.addEventListener("click", () => {
  if (visibility.checked) {
    visibilityText.innerText = "Hide password";
    return (password.type = "text");
  }
  visibilityText.innerText = "Show password";
  return (password.type = "password");
});

function handleInputs(value1, value2) {
  result.innerHTML = "";
  if (value1 === "" || value1 === null || value2 === "" || value2 === null) {
    result.innerHTML = "please fill all the details";
    submitBtn.disabled = true;
    submitBtn.classList.remove("submit");
    return;
  }
  submitBtn.disabled = false;
  submitBtn.classList.add("submit");
}
inputs.forEach((input) => {
  input.addEventListener("input", () =>
    handleInputs(email.value, password.value)
  );
});

function submit() {
  result.innerHTML = "";
  submitBtn.disabled = true;
  spinner.classList.add("spin");
  
  fetch("/log-in", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value.toLowerCase(),
      password: password.value,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      submitBtn.disabled = false;
      spinner.classList.remove("spin");
      if (res.token) {
        sessionStorage.setItem("token", res.token);
       if(res.isVerified === true) window.location.href =`/${res.username}`;
       else  window.location.href =`/verify-your-email`;
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
