



let melding_tag:HTMLDivElement | null = null;

let body = document.getElementsByTagName("body")[0]


let melding_tag_time = 0

const melding_decay = 3000

const fade_out_timer = 1000



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

async function get_melding_tag_structure() {
    let melding_tag_real = document.getElementsByClassName("melding")[0]
    melding_tag = (melding_tag_real.cloneNode(true) as HTMLDivElement)
    melding_tag_real.remove()
    let if_logged = await refresh_access_token()
    
    if(if_logged){
        document.getElementById("login_register")?.classList.add("invis")
        let span_naam:HTMLSpanElement  = document.getElementById("profiel_name") as HTMLSpanElement
        let div_naam:HTMLDivElement= document.getElementById("profiel") as HTMLDivElement
        let dict_uis = await (await request("/username", "", "GET",accesstoken)).json()
        let username = dict_uis["username"]
        if (username) {
            console.log(username);
            div_naam.classList.remove("invis")
            span_naam.innerText = username

        }
            
        
        
    }
}

let accesstoken:string = ""


document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);

function melding(bericht:string) {

    if (melding_tag !== null) {
       
        body.appendChild(melding_tag)
       
        melding_tag_time = new Date().getTime()
      
        melding_tag.classList.remove("fade_out")
        
        melding_tag.classList.add("melding")
        
        setTimeout(start_fadeout, 1000, melding_tag )
   
        setTimeout(del_old_tag, melding_decay, melding_tag);
   
        let text_div = melding_tag?.getElementsByClassName("melding_text")[0]?.children[1]
        
        if (text_div != undefined) {
          
            text_div.textContent = bericht
        }
    
    }
}


function delete_melding(tag:HTMLButtonElement) {

    let parent = tag.parentElement?.parentElement

    parent?.remove()
}


function del_old_tag(tag:HTMLDivElement) {
    
    if (melding_tag_time + melding_decay < new Date().getTime()) {   
        if (tag !== null) {      
          
            tag.classList.value = ""
            tag.remove()
        }
    }
}


async function start_fadeout(tag:HTMLDivElement) {

    if (melding_tag_time + fade_out_timer < new Date().getTime()) {
        tag.classList.add("fade_out")
    }
  }


function if_logged(text:string) {if_logged2(text)}

async function if_logged2(text:string) {
    let if_logged = false
    if_logged = await refresh_access_token()

    console.log(if_logged);
    
    if (if_logged) {
        window.location.href = "lproject.html"
    }
    else{
        melding(text)
    }
}

function logout() {
    console.log("some");
    
    yoma()
    
}

async function yoma() {
    console.log("wad");
    
    
    let some = await request("/logout", "", "GET", accesstoken)
    console.log("wad2");
    accesstoken = ""
    
    window.location.reload();
}



  async function request(url:string, data:string, mode:string, token:string):Promise<Response> {
    
    let response:Response | null = null
    if ("GET" == mode) {
        response = await fetch(url, {
            method: mode, 
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json', 
            },
            credentials: 'include' 
        });
    }
    else{
        response = await fetch(url, {
            method: mode, 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(data), 
            credentials: 'include' 
        });
    }
    return response
}