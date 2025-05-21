function login() {
    login2();
}
async function login2() {
    console.log("bob");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const emailInput = document.getElementById("email");
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
        melding("Vul in gebruikersnaam en passwoord");
        return;
    }
    if (password.length < 7) {
        melding("Password moet minstens 7 characters hebben");
        return;
    }
    if (!emailInput) {
        await login_user(username, password);
    }
    else {
        await register_user(username, password, emailInput.value.trim());
    }
}
async function register_user(username, password, email) {
    const response = await request("/register", { user: username, pwd: password, email: email }, "POST");
    if (!response) {
        melding("Server is momenteel niet bereikbaar");
        return;
    }
    if (response.status === 409) {
        melding("Gebruikersnaam al gebruikt");
        return;
    }
    window.location.href = "login.html";
}
async function login_user(username, password) {
    const response = await request("/login", { user: username, pwd: password }, "POST");
    if (!response) {
        melding("Server is momenteel niet bereikbaar");
        return;
    }
    if (response.status === 401) {
        melding("Gebruikersnaam of passwoord is incorrect");
        return;
    }
    console.log("change page");
    window.location.href = "landingpage.html";
}
async function request(url, data, mode, token = "") {
    let response;
    if (mode === "GET") {
        response = await fetch(url, {
            method: mode,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    }
    else {
        response = await fetch(url, {
            method: mode,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
    }
    return response;
}
window.login = login;
export {};
