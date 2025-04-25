






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


async function request(url:string, data:any, mode:string, token:string) {
    
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


async function req_data(url:string, data:string, mode:string, key:string) {
    return (await ((await request(url, data, mode,"")).json()))[key]
}



function getelementby_tag_id<Tag extends keyof HTMLElementTagNameMap>(tagname:Tag, id:string): HTMLElementTagNameMap[Tag] | null {
    const elements:HTMLCollectionOf<HTMLElementTagNameMap[Tag]> =  document.getElementsByTagName(tagname)

    let result:HTMLElementTagNameMap[Tag] | null = null; 

    for (let i = 0; i < elements.length; i++) {
        if (elements.item(i)?.id == id ) {
            result = elements.item(i)
        }
    }

    if (!result) {
        return null
    }else{
        return result
    }
}

document.getElementsByTagName("img")

const karakterImg           = getelementby_tag_id("img",  'karakter-img')
const karakterNaam          = getelementby_tag_id("h1",   'karakter-naam')
const karakterBeschrijving  = getelementby_tag_id("p",    'karakter-beschrijving')
const karakterRarity        = getelementby_tag_id("p",    'karakter-rarity') 
const karakterSet           = getelementby_tag_id("p",    'karakter-set') 
const karakterRelease       = getelementby_tag_id("p",    'karakter-release') 
   
const favoriteBtn           = getelementby_tag_id("button",'favorite-btn') 
const setProfileBtn         = getelementby_tag_id("img",   'set_profiel_img') 
const infoBtn               = getelementby_tag_id("button",   'info-btn');
const popupMessage          = getelementby_tag_id("div",   'popup-message');
const favoriteStar          = getelementby_tag_id("span",   'favorite-star');
const blacklistBtn          = getelementby_tag_id("button",   'blacklist-btn');
const blacklistReason       = getelementby_tag_id("div",   'blacklist-reason');
const blacklistInput        = getelementby_tag_id("input",   'blacklist-input');
const submitBlacklist       = getelementby_tag_id("button",   'submit-blacklist');
const userProfileImg        = getelementby_tag_id("img",   'user-profile-img');


const karakterID = localStorage.getItem('selectedCharacter');


if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}

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

//  **Haal karaktergegevens op van de API**
async function fetchKarakter() {
    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
        const data = await response.json();

        if (!data.data) {
            console.warn('Karakter niet gevonden.');
            return;
        }

        const karakter = data.data;

        //  **Vul de pagina met karaktergegevens**

        karakterImg!.src =  karakter.images.icon
        karakterNaam!.innerText = karakter.name;
        karakterBeschrijving!.innerText = karakter.description || 'Geen beschrijving beschikbaar.';
        karakterRarity!.innerText = karakter.rarity.displayValue || 'Onbekend';
        karakterSet!.innerText = karakter.set ? karakter.set.value : 'Geen set';
        karakterRelease!.innerText = karakter.introduction ? karakter.introduction.text : 'Onbekend';

        // 🎨 **Voeg de juiste kleur toe voor zeldzaamheid**
        karakterRarity!.classList.add(getRarityClass(karakter.rarity.value));

    } catch (error) {
        console.error('Fout bij het ophalen van het karakter:', error);
    }
}

// ⭐ **Favoriet functie**
let favorites = JSON.parse(localStorage.getItem('favorites') || "[]");




// Check of dit karakter al favoriet is
if (favorites.includes(karakterID)) {

    favoriteStar!.style.display = 'block';
    favoriteBtn!.textContent = '💔'; // Verander hart icoon om te verwijderen uit favorieten
}

// Add/Remove favorite
favoriteBtn!.addEventListener('click', () => {
    if (favorites.includes(karakterID)) {
        favorites = favorites.filter( (id:string) => id !== karakterID);
        favoriteStar!.style.display = 'none';
        favoriteBtn!.textContent = '❤️';
        showPopup('Verwijderd uit favorieten!');
    } else {
        favorites.push(karakterID);
        favoriteStar!.style.display = 'block';
        favoriteBtn!.textContent = '💔';
        showPopup('Toegevoegd aan favorieten!');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
});


// 👤 **Gebruik als profiel**
let isUserCharacter:boolean = (await req_data("/get_profiel", "", "GET", "id")) == karakterID
setProfileBtn!.src = isUserCharacter ? './assets/delete.png' : './assets/add-user.png';
userProfileImg!.src = isUserCharacter ? karakterImg!.src : "./assets/question-mark.svg";

setProfileBtn?.addEventListener('click', async () => {
    isUserCharacter = !isUserCharacter;


    await request("/set_profiel", {"id":karakterID}, "POST", "")

    setProfileBtn.src = isUserCharacter ? './assets/delete.png' : './assets/add-user.png';
    userProfileImg!.src = isUserCharacter ? karakterImg!.src : "./assets/question-mark.svg";
    showPopup(isUserCharacter ? 'Je hebt dit karakter als gebruiker gekozen!' : 'Niet langer je gebruiker!');
});



// ❌ **Blacklist functie**
blacklistBtn!.addEventListener('click', () => {
    blacklistReason!.classList.add('show');
});

// 🚀 **Bevestig blacklist (Toevoegen aan zwarte lijst)**
submitBlacklist!.addEventListener('click', async () => {
    const reason = blacklistInput!.value.trim();
    if (!reason) {
        showPopup("Voer een reden in!");
        return;
    }



    let blacklist = (await req_data("/get_blacklist", "", "GET", "id"))
    blacklist.push({
        id: karakterID,
        name: karakterNaam!.innerText,
        image: karakterImg!.src,
        reason: reason
    });

    let blacklist_character = {
        "id": karakterID,
        "name": karakterNaam!.innerText,
        "image": karakterImg!.src,
        "reason": reason
    }
    await request("/set_blacklist", blacklist_character, "POST", "")

    showPopup("Karakter toegevoegd aan de zwarte lijst!");
    
    setTimeout(() => {
        window.location.href = 'blacklist.html'; //  Automatische redirect
    }, 1500);
});

// ℹ️ **Info-knop popup**
infoBtn!.addEventListener('click', () => {
    showPopup('Hier kun je personages bekijken, favorieten instellen en een gebruiker kiezen.');
});

// ✅ **Meldingen tonen**
function showPopup(message) {
    popupMessage!.textContent = message;
    popupMessage!.classList.add('show');
    setTimeout(() => popupMessage!.classList.remove('show'), 3000);
}

// ✅ **Laad karaktergegevens**
fetchKarakter();

// ✅ **Verwijder personage van de zwarte lijst en keer terug naar `karakter.html`**
async function removeFromBlacklist(id) {
    //let blacklist = JSON.parse(localStorage!.getItem('blacklistCharacters') || "[]") ;
    let blacklist = (await req_data("/get_blacklist", "", "GET", "id"))
    blacklist = blacklist.filter(outfit => outfit.id !== id);
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));

    showPopup("Karakter uit de zwarte lijst verwijderd!");

    setTimeout(() => {
        localStorage.setItem('selectedCharacter', id); // Zet het verwijderde personage weer als geselecteerd
        window.location.href = 'karakter.html'; // 🚀 Automatische redirect naar karakterpagina
    }, 1500);
}

// ✅ **Event Listener toevoegen aan verwijderknoppen op blacklist.html**
document.addEventListener('click', (e: MouseEvent) => {
    if (e.target instanceof HTMLElement) { // Ensure it's an HTMLElement
        if (e.target.classList.contains('remove-blacklist')) {
            const id = e.target.dataset.id;
            if (id) {
                removeFromBlacklist(id);
            }
        }}
    
});