// JavaScript to toggle between login and registration forms
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const toggleLoginForm = document.getElementById("toggle-register");
const toggleRegisterForm = document.getElementById("toggle-login");
const lmsg = document.getElementById("lmsg");
const lerror = document.getElementById("lerror");
const rmsg = document.getElementById("rmsg");
const rerror = document.getElementById("rerror");

//hide leror and lmsg and rmsg and rerror
lmsg.style.display = "none";
lerror.style.display = "none";
rmsg.style.display = "none";
rerror.style.display = "none";

console.log(toggleLoginForm, toggleRegisterForm);


toggleLoginForm.addEventListener("click", (e) => {
    console.log("clicked");
    e.preventDefault(); // Prevent the default link behavior
    loginForm.style.display = "block";
    registerForm.style.display = "none";
});

toggleRegisterForm.addEventListener("click", (e) => {
    console.log("clicked");
    e.preventDefault(); // Prevent the default link behavior
    loginForm.style.display = "none";
    registerForm.style.display = "block";
});

// Login AJAX request
document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("password").value;

    // Send login data to the server
    fetch("/dastavej/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((response) => {
            if(response.status == 200){
            lmsg.style.display = "block";
            lerror.style.display = "none";
            window.location.replace(`/dastavej`);
            return
            }
            else if(response.status == 402){
                lerror.style.display = "block";
                lerror.innerHTML = "Password is incorrect";
                lmsg.style.display = "none";
            }
            else{
                lerror.style.display = "block";
                lerror.innerHTML = "User is not Registered";
                lmsg.style.display = "none";
            }
        })
        .catch((error) => {
            console.log(error);
        });
});

// Registration AJAX request
document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("register-password").value;
    const confirmpassword = document.getElementById("confirm-password").value;
    const profession = document.getElementById("profession").value;
    const upi = document.getElementById("upi").value;
    const Jila = document.getElementById("Jila").value;
    const Office = document.getElementById("Office").value;
    const mapLink = document.getElementById("mapLink").value;
    const address = document.getElementById("address").value;
    if(password!=confirmpassword){
        rerror.style.display = "block";
        rerror.innerHTML = "Password and conform Password must be same";
        rmsg.style.display = "none";
    }
    else{
        // Send registration data to the server
        fetch("/dastavej/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, phone, email, password, profession, upi, mapLink, address,Jila, Office}),
        })
            .then((response) => {
                if(response.status == 200){
                    rmsg.style.display = "block";
                    rmsg.innerHTML = "Account Created";
                    rerror.style.display = "none";
                    window.location.replace(`/dastavej`);
                    return
                }else{ 
                    rerror.style.display = "block";
                    rerror.innerHTML = "Cannot create account";
                    rmsg.style.display = "none";
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

});
