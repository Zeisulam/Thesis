var pass = document.getElementById('pass');
var eye = document.getElementById('eye');
var eye2 = document.getElementById('eye2'); // Check if eye2 exists

// Add event listener only if #eye exists
if (eye) {
    eye.addEventListener('click', togglePass);
}

// Add event listener only if #eye2 exists
if (eye2) {
    var confirmPass = document.getElementById('confirm_pass');
    eye2.addEventListener('click', togglePass1);
}

function togglePass() {
    eye.classList.toggle('active');
    pass.type = (pass.type === 'password') ? 'text' : 'password';
}

function togglePass1() {
    eye2.classList.toggle('active');
    confirmPass.type = (confirmPass.type === 'password') ? 'text' : 'password';
}
document.getElementById("eye").addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      this.classList.replace("fa-eye-slash", "fa-eye"); // Change icon
    } else {
      passwordField.type = "password";
      this.classList.replace("fa-eye", "fa-eye-slash"); // Change back
    }
  });