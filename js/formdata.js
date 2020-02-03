

function setFormdefaults(){
    const formConatiner = document.querySelector('.mainOption');
      formConatiner.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            valdiateForm();
        }
      });
}

function valdiateForm(){
    let a = document.querySelector('.mainOption p');
    if(a!== null){
        a.remove();
    }
    const mailOk = checkmail();
    const passwordOk = checkpassword();
    if(mailOk && passwordOk){
        document.querySelector('input[type="submit"]').click();
    }
}

function checkmail(){
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const mail = document.querySelector('input[type="email"]').value;
    if(re.test(String(mail).toLowerCase())){
        //CORRECT FORMAT
        return true;
    }else{
        document.querySelector('.mainOption').insertAdjacentHTML('beforeend', '<p>Invalid email. Please check email.</p>');
        return false;
    }
}

function checkpassword(){
    const pass1 = document.querySelector(".p1");
    const pass2 = document.querySelector(".p2");
    if (pass1.value !== pass2.value) {
        document.querySelector('.mainOption').insertAdjacentHTML('beforeend', '<p>Passowrds do not match.</p>');
        return false;
    } else {
        return true;
    }
}