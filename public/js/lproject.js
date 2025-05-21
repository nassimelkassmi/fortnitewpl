let accesstoken = "";
document.addEventListener('DOMContentLoaded', set_name);
async function set_name() {
    const if_logged = await refresh_access_token();
    if (!if_logged)
        return;
    const span_naam = document.getElementById("username_display");
    const dict_uis = await (await request("/username", "", "GET", accesstoken)).json();
    const username = dict_uis["username"];
    if (username)
        span_naam.innerText = username;
}
async function refresh_access_token() {
    const response = await request("/refresh", "", "GET", "");
    if (response.ok) {
        const body = await response.json();
        accesstoken = body["accesstoken"];
    }
    return !!accesstoken;
}
async function request(url, data, mode, token) {
    if (mode === "GET") {
        return fetch(url, {
            method: mode,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
    }
    else {
        return fetch(url, {
            method: mode,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
    }
}
export {};
