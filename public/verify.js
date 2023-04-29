"use strict";

const confirmBtn = document.getElementById("confirmBtn");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
const body = document.getElementById('body');

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

async function confirmData() {
    spinner.classList.add("spin");
    confirmBtn.classList.add("opaque");
    result.innerHTML = "";
    confirmBtn.disabled = true;
    await fetch("/v/confirm-data", {
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
  