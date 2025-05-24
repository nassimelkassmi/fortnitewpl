


function login(): void {
    login2();
}

async function login2(): Promise<void> {
    console.log("bob");

    const usernameInput = document.getElementById("username") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement | null;

    const username: string = usernameInput.value.trim();
    const password: string = passwordInput.value.trim();

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
    } else {
        await register_user(username, password, emailInput.value.trim());
    }
}

async function register_user(username: string, password: string, email: string): Promise<void> {
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

async function login_user(username: string, password: string): Promise<void> {
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

async function request(url: string, data: object, mode: string, token: string = ""): Promise<Response | undefined> {
    let response: Response;

    if (mode === "GET") {
        response = await fetch(url, {
            method: mode,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    } else {
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


declare function melding(message: string): void;
(window as any).login = login;
