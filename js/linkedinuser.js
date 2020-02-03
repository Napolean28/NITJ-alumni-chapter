const url = new URL(window.location.href);
const code = url.search.split('=');
console.log
if(code[0]!=="" && !(url.search.includes('google'))){


    document.querySelector('.container').style.opacity = '0.1';
    document.querySelector('.loaderContainer').style.display = 'inline-flex';
// console.log(code);

const xhr = new XMLHttpRequest();    
const cId = '81c6q3q3tm74fi';
const cSecret = '0TcJxZpbV5pT8oyc';
const authcode = code[1];
const rUri = 'http%3A%2F%2Flocalhost%3A3000%2F';
const parameters = `grant_type=authorization_code&code=${authcode}&redirect_uri=${rUri}&client_id=${cId}&client_secret=${cSecret}`;

xhr.open('GET', `https://cors-anywhere.herokuapp.com/https://www.linkedin.com/oauth/v2/accessToken?${parameters}`, true);
xhr.send();

xhr.onreadystatechange = async () => {
    if(xhr.readyState === 4 ){
        if(xhr.status === 200){
            let atoken = JSON.parse(xhr.response);
            // console.log(atoken);
            atoken = atoken.access_token;
            const profile = await getBasicProfile(atoken);
            const emailId = await getEmailId(atoken);
            sendLinkedinDetails(profile,emailId);
            // console.log(profile, emailId);
        }else{
            console.log('ERROR: Access token cannot be obtained.');
            console.log(xhr.responseType, xhr.response);
        }
    }
}

const getBasicProfile = (atoken) =>{
    return new Promise((resolve, reject) => {
        const xhrProfile = new XMLHttpRequest();
        xhrProfile.open('GET', `https://cors-anywhere.herokuapp.com/https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`, true);
        xhrProfile.setRequestHeader('Authorization', `Bearer ${atoken}`);
        xhrProfile.send();
        xhrProfile.onreadystatechange = () => {
            if(xhrProfile.readyState === 4 ){
                if(xhrProfile.status === 200){
                    const profile = JSON.parse(xhrProfile.response);
                    // console.log(profile);
                    const firstName = profile.firstName.localized.en_US;
                    const lastName = profile.lastName.localized.en_US;
                    const picture = profile.profilePicture['displayImage~'].elements[1].identifiers[0].identifier;
                    // console.log(firstName,lastName, picture);
                    resolve({firstName,lastName, picture});
                }else{
                    console.log('Error');
                    resolve('Error in getting basic profile');
                    console.log(xhrProfile.responseType, xhrProfile.response);
                }
            }
        }
    });
}

const getEmailId = (atoken) =>{
    return new Promise ((resolve, reject)=>{
        const xhrEmail = new XMLHttpRequest();
        xhrEmail.open('GET', 'https://cors-anywhere.herokuapp.com/https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', true);
        xhrEmail.setRequestHeader('Authorization', `Bearer ${atoken}`);
        xhrEmail.send();

        xhrEmail.onreadystatechange = () => {
            if(xhrEmail.readyState === 4 ){
                if(xhrEmail.status === 200){
                    const email = JSON.parse(xhrEmail.response);
                    // console.log(email);
                    const emailId = email.elements[0]['handle~'].emailAddress;
                    // console.log(emailId);
                    resolve(emailId);
                }else{
                    console.log('Error');
                    resolve('Error in getting mail id');
                    console.log(xhrEmail.responseType, xhrEmail.response);
                }
            }
        }
    });
}

//SEND DETAILS TO THE FORM
const sendLinkedinDetails = (profile, emailId) =>{
    document.querySelector('.container').style.opacity = '1';
    document.querySelector('.loaderContainer').style.display = 'none';
    document.getElementsByName("FirstName")[0].value = profile.firstName;
    document.getElementsByName("LastName")[0].value = profile.lastName;
    document.getElementsByName("emailId")[0].value = emailId;
    document.getElementsByName("verifiedusing")[0].value = 'linkedin';
    const password = `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}`;
    document.getElementsByName("password")[0].value = password;
    document.getElementsByName("confirmPassword")[0].value = password;
    document.querySelector("#userProfile").submit();

}

}