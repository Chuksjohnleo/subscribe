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
        window.location.href =`/${res.username}`;
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
