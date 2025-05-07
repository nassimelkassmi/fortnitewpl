
let accesstoken:string = ""





document.addEventListener('DOMContentLoaded', set_name, false);


async function set_name() {
    let if_logged = await refresh_access_token()
    
    if(if_logged){
        let span_naam:HTMLSpanElement  = document.getElementById("username_display") as HTMLSpanElement
        let dict_uis = await (await request("/username", "", "GET",accesstoken)).json()
        let username = dict_uis["username"]
        if (username) {
            span_naam.innerText = username

        }
            
        
        
    }
}





async function refresh_access_token() {
    let response =  await request("/refresh", "", "GET", "")
    if (response.ok) {
        let body = await response.json()
        accesstoken = body["accesstoken"]
    }
    
    
    if (!accesstoken) {
        return false
    }else{
        return true
    }
}



async function request(url:string, data:string, mode:string, token:string):Promise<Response> {
    
    let response:Response | null = null
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