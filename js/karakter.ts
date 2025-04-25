
export {}


type favorite = {
    "id":string,
    "itemid_1":string,
    "itemid_2":string,
    "notes":string[]
    "wins":number,
    "losses":number
}

function showPopup(message:string) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}

type FortniteCosmetic = {
    id: string;
    name: string;
    description: string;
    type: {
      value: string;
      displayValue: string;
      backendValue: string;
    };
    rarity: {
      value: string;
      displayValue: string;
      backendValue: string;
    };
    series?: {
      value: string;
      colors: string[];
      backendValue: string;
    };
    set?: {
      value: string;
      text: string;
      backendValue: string;
    };
    introduction: {
      chapter: string;
      season: string;
      text: string;
      backendValue: number;
    };
    images: {
      smallIcon: string;
      icon: string;
    };
    metaTags: string[];
    added: string;
  };

function getRarityClass(rarity:string) {
    switch (rarity.toLowerCase()) {
        case 'common': return 'rarity-common';
        case 'uncommon': return 'rarity-uncommon';
        case 'rare': return 'rarity-rare';
        case 'epic': return 'rarity-epic';
        case 'legendary': return 'rarity-legendary';
        default: return 'rarity-other';
    }
}



async function get_char_info(char_id:String):Promise<FortniteCosmetic> {
    
    const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${char_id}`);
    const data = (await response.json())["data"];
    return data
}


async function request(url:string, data:any, mode:string) {
    
    let response:Response | null = null
    
    if ("GET" == mode) {
        response = await fetch(url, {
            method: mode, // HTTP method
            headers: {
                'Content-Type': 'application/json'
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


async function request_json(url:string, data:any, mode:string, key:string) {
    return (await ((await request(url, data, mode)).json()))[key]
}



function select_by_id_and_Tag<Tag extends keyof HTMLElementTagNameMap>(tagname:Tag, id:string): HTMLElementTagNameMap[Tag] {
    const elements:HTMLCollectionOf<HTMLElementTagNameMap[Tag]> =  document.getElementsByTagName(tagname)

    let result:HTMLElementTagNameMap[Tag] | null = null; 

    for (let i = 0; i < elements.length; i++) {
        if (elements.item(i)?.id == id ) {
            result = elements.item(i)
        }
    }

    if (!result) {
        console.log("tagname is ", tagname, " id is ", id);
        throw new Error("this did not work");
    }else{
        return result
    }
}

document.getElementsByTagName("img")

//karakter info tags
const karakterImg           = select_by_id_and_Tag("img",  'karakter-img')
const karakterNaam          = select_by_id_and_Tag("h1",   'karakter-naam')
const karakterBeschrijving  = select_by_id_and_Tag("p",    'karakter-beschrijving')
const karakterRarity        = select_by_id_and_Tag("span",    'karakter-rarity') 
const karakterSet           = select_by_id_and_Tag("span",    'karakter-set') 
const karakterRelease       = select_by_id_and_Tag("span",    'karakter-release') 
   
const favoriteBtn           = select_by_id_and_Tag("button",'favorite-btn') 

const setProfileBtn         = select_by_id_and_Tag("button",   'set_profile_button') 
const setProfielBtn_img     = select_by_id_and_Tag("img", "set_profile_img")


//const infoBtn               = select_by_id_and_Tag("button",   'info-btn');
const popupMessage          = select_by_id_and_Tag("div",   'popup-message');
const favoriteStar          = select_by_id_and_Tag("span",   'favorite-star');
const blacklistBtn          = select_by_id_and_Tag("button",   'blacklist-btn');
const blacklistReason       = select_by_id_and_Tag("div",   'blacklist-reason');
const blacklistInput        = select_by_id_and_Tag("input",   'blacklist-input');
const submitBlacklist       = select_by_id_and_Tag("button",   'submit-blacklist');
const userProfileImg        = select_by_id_and_Tag("img",   'user-profile-img');



//localStorage.setItem('selectedCharacter', "Backpack_AbstractMirror");
const karakterID = localStorage.getItem('selectedCharacter') as string;


let favorites:favorite[] = await request_json("/get_favoriet", "", "GET", "id")

if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}


console.log(karakterID);



async function fill_character_page(char_id:string) {
    let char:FortniteCosmetic = await get_char_info(char_id)
    console.log(char);
    
    karakterImg.src = char.images.icon 
    karakterNaam.innerText = char.name
    karakterBeschrijving.innerText = char.description
    karakterRarity.innerText = char.rarity.displayValue
    karakterSet.innerText = char.set?.value ? char.set.value : "" 
    karakterRelease.innerText = char.introduction?.text
    karakterRarity.classList.add(getRarityClass(char.rarity.value));

    const if_char_fav = favorites.some((favorite) => favorite.id === karakterID)
    console.log(if_char_fav);
    
    favoriteStar.style.display =  if_char_fav ?   'block' : 'none';
    favoriteBtn.textContent    =  if_char_fav ?     '💔' :'❤️'   ;

}



fill_character_page(karakterID)


async function set_profiel_img() {
    let profiel_char_id = await request_json("/get_profiel", "", "GET","id")

    console.log("profiel_char_id ",profiel_char_id);

    if (profiel_char_id) {
        let profiel_char = await get_char_info(profiel_char_id)
        userProfileImg.src = profiel_char.images.icon
    }

    if (profiel_char_id == karakterID) {
         setProfielBtn_img.src = './assets/delete.png' 
    }else{
        setProfielBtn_img.src =   "./assets/add-user.png"
    }
}

set_profiel_img()




let setProfileBtn_flag:boolean = true
setProfileBtn.addEventListener('click', async () => {
    if (!setProfileBtn_flag) {
        return 1
    }
    setProfileBtn_flag = false


    let profiel = await request_json("/get_profiel", "", "GET", "id")

    console.log("profiel is", profiel);


    if (karakterID == profiel) {
        userProfileImg.src = "./assets/question-mark.svg"
        setProfielBtn_img.src = "./assets/add-user.png"
        await request("/set_profiel", {"id":""}, "POST")
    }else{
        userProfileImg.src = karakterImg.src
        setProfielBtn_img.src = './assets/delete.png'

        await request("/set_profiel", {"id":karakterID}, "POST")
        let profiel = await request_json("/get_profiel", "", "GET", "id")
        console.log("nieuw profiel is ", profiel);
        
    }
    showPopup( (karakterID == profiel) ? 'Niet langer je profiel!' :'Je hebt dit karakter als profiel gekozen!' );
    setProfileBtn_flag = true
});



let favoriteBtn_flag:boolean = true
favoriteBtn.addEventListener('click', async  () => {
    if (!favoriteBtn_flag) {
        return 1}
    favoriteBtn_flag = false


    favorites = await request_json("/get_favoriet", "", "GET", "id")
    console.log(favorites);
    
    const if_char_fav = favorites.some((favorite) => favorite.id === karakterID) //if current character is a favoriet


    console.log("ifcharfav", if_char_fav);
    favoriteStar.style.display =  !if_char_fav ?   'block' : 'none';
    favoriteBtn.textContent    =  !if_char_fav ?     '💔' :'❤️'   ;

    showPopup( if_char_fav ? 'Verwijderd uit favorieten!' : 'Toegevoegd aan favorieten!')

    if (if_char_fav) {
        await request("/del_favoriet",{"id":karakterID}, "POST")
    }else{
        await request("/add_favoriet",{"id":karakterID}, "POST")
    }
    
    favoriteBtn_flag = true
});