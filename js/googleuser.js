const gurl = new URL(window.location.href);

const getAccessToken = (code) =>{
    return new Promise ((resolve, reject)=>{

        const cId = '293949097764-jvc3modf387ppldre67vmhd4kcf7li2n.apps.googleusercontent.com';
        const cSecret = '7-7DSa0PYHiMg4QW1WWqxa_L';
        const rUri = 'http%3A%2F%2Flocalhost%3A3000%2F';
        const gtype = 'authorization_code';
        const parameters = `?code=${code}&client_id=${cId}&client_secret=${cSecret}&redirect_uri=${rUri}&grant_type=${gtype}`

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://cors-anywhere.herokuapp.com/https://www.googleapis.com/oauth2/v4/token${parameters}`);
        xhr.send();

        xhr.onreadystatechange = ()=>{
            console.log('Ready State: ', xhr.readyState);
            if(xhr.readyState === 4 ){
                if(xhr.status === 200){
                    const atokenResponse = JSON.parse(xhr.response);
                    console.log('Response: ', atokenResponse);

                    console.log('Access Token: ', atokenResponse.access_token);
                    resolve(atokenResponse.access_token);
                }else{
                    console.log('Error: ', xhr.response);
                    reject('access token not obtained')
                }
            }
        }
    });
}

const getProfile = (atoken) => {
    return new Promise((resolve, reject)=>{
        const xhrProfile = new XMLHttpRequest();
        xhrProfile.open('GET', 'https://cors-anywhere.herokuapp.com/https://www.googleapis.com/oauth2/v2/userinfo');
        xhrProfile.setRequestHeader('Authorization', `Bearer ${atoken}`);
        xhrProfile.send();

        xhrProfile.onreadystatechange = ()=>{
            console.log('Ready State: ', xhrProfile.readyState);
            if(xhrProfile.readyState === 4 ){
                if(xhrProfile.status === 200){
                    const profile = JSON.parse(xhrProfile.response);
                    console.log('Profile: ', profile);
                    resolve(profile);
                }else{
                    console.log('Profile Error: ', xhrProfile.response);
                    reject('Could not obtain Profile');
                }
            }
        }

    });
}

const sendGoogleDetails = (profile, emailId) =>{
    document.querySelector('.container').style.opacity = '1';
    document.querySelector('.loaderContainer').style.display = 'none';
    document.getElementsByName("FirstName")[0].value = profile.firstName;
    document.getElementsByName("LastName")[0].value = profile.lastName;
    document.getElementsByName("emailId")[0].value = emailId;
    document.getElementsByName("verifiedusing")[0].value = 'google';
    const password = `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}`;
    document.getElementsByName("password")[0].value = password;
    document.getElementsByName("confirmPassword")[0].value = password;
    document.querySelector("#userProfile").submit();

}

if(gurl.href.includes('googleapis')){
    const code = gurl.search.split('&')[0].split('=')[1];
    document.querySelector('.container').style.opacity = '0.1';
    document.querySelector('.loaderContainer').style.display = 'inline-flex';
    console.log('Code: ', code);
    const getUserDetails = async () => {
        const atoken = await getAccessToken(code);
        console.log('Atoken: ', atoken);
        const profile = await getProfile(atoken);
        const user = {'firstName': profile.given_name, 'lastName': profile.family_name};
        sendGoogleDetails(user,profile.email);
    }

    
    // document.querySelector('.container').style.opacity = "0.5";
    getUserDetails();
    
}

