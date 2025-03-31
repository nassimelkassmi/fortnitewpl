

function login() {
    login2()
    
}



async function login2() {
    console.log("bob");
    
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const email    = document.getElementById("email")
    // let response = await request("/register",{"user":username,"pwd":password}, "POST")
    // console.log(status);
    
    if (!username || !password) {
        melding("Vul in gebruikersnaam en passwoord")
        return 1
    }

    if (password.length < 1 ) {
        melding("Password moet minstens 7 characters hebben ")
        return 1
    }

    if (!email) {
        login_user(username, password)
    }
    else{
        register_user(username, password, email.value)
    }
    // let token = (access_token.accesstoken)
    // console.log(access_token.accesstoken);
    // console.log(typeof(access_token.accesstoken));
    
    // let response =  await request("/username",
    // {"user":username,"pwd":password}, "GET", token)
    // console.log(new_username);
}


async function register_user(username, password, email) {
    let response = await request("/register",{"user":username,"pwd":password, "email":email}, "POST")
    if (!response) {
        melding("Server is momenteel niet berijkbaar")
        return 0
    }
    if (response.status == 409) {
        melding("Gebruikersnaam al gebruikt")
        return 0
    }
    window.location.href = "login.html"
}


async function login_user(username, password) {
    let response = await request("/login",{"user":username,"pwd":password}, "POST")
    if (!response) {

        melding("Server is momenteel niet berijkbaar")
        return 1
    }
    if (response.status == 401) {
        melding("Gebruikersnaam of passwoord is incorrect")
        return 1
    }
    console.log("change page");
    
    window.location.href = "landingpage.html"

}



async function request(url, data, mode, token) {
    let response = undefined
    if ("GET" == mode) {
        response = await fetch(url, {
            method: mode, // HTTP method
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json', 
            },
            credentials: 'include' 
        });
    }
    else{
        response = await fetch(url, {
            method: mode, // HTTP method
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(data), 
            credentials: 'include' 
        });
    }
    return response
}


