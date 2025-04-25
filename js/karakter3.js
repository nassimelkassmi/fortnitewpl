

async function request(url, data, mode, token) {
    console.log("url:", url, " data: ", data, " mode: ", mode);
    
    let response = null
    
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


async function req_data(url, data, mode, key) {
    return (await ((await request(url, data, mode,"")).json()))[key]
}





const karakterImg = document.getElementById('karakter-img');
const karakterNaam = document.getElementById('karakter-naam');
const karakterBeschrijving = document.getElementById('karakter-beschrijving');
const karakterRarity = document.getElementById('karakter-rarity');
const karakterSet = document.getElementById('karakter-set');
const karakterRelease = document.getElementById('karakter-release');

const favoriteBtn = document.querySelector('.favorite-btn');
const setProfileBtn = document.querySelector('.set-profile img');

const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');
const favoriteStar = document.querySelector('.favorite-star');
const blacklistBtn = document.querySelector('.blacklist-btn');

const blacklistReason = document.getElementById('blacklist-reason');

const blacklistInput = document.getElementById('blacklist-input');
const submitBlacklist = document.getElementById('submit-blacklist');
const userProfileImg = document.getElementById('user-profile-img');



const karakterID =  await req_data("/get_selected", "", "GET","id")
    
console.log(karakterID);


if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}

// tries to set attribute
function set_attribute(object,att, value) {
    if (att in object && value ) {
        object[att] = value
    }
}





// haal de info van de api en zet het op de pagina
async function fetchKarakter() {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
        const data = await response.json();

        if (!data.data) {
            console.warn('Karakter niet gevonden.');
            return;
        }
        const karakter = data.data;
        //  **Vul de pagina met karaktergegevens**
        set_attribute(karakterImg          ,"src"      , karakter.images.icon)
        set_attribute(karakterNaam         ,"innerText", karakter.name)
        set_attribute(karakterBeschrijving ,"innerText", karakter.description)
        set_attribute(karakterRarity       ,"innerText", karakter.rarity.displayValue)
        set_attribute(karakterSet          ,"innerText", karakter.set?.value)
        set_attribute(karakterRelease      ,"innerText", karakter.introduction?.text)
        //  **Voeg de juiste kleur toe voor zeldzaamheid**
        karakterRarity.classList.add(getRarityClass(karakter.rarity.value));
}

//  **Bepaal de CSS-klasse op basis van zeldzaamheid**
function getRarityClass(rarity) {
    switch (rarity.toLowerCase()) {
        case 'common': return 'rarity-common';
        case 'uncommon': return 'rarity-uncommon';
        case 'rare': return 'rarity-rare';
        case 'epic': return 'rarity-epic';
        case 'legendary': return 'rarity-legendary';
        default: return 'rarity-other';
    }
}



let favorites = await req_data("/getfavoriet", "", "GET", "id")
console.log(favorites);


// Check of dit karakter al favoriet is
if (favorites.includes(karakterID)) {

    favoriteStar.style.display = 'block';
    favoriteBtn.textContent = '💔'; // Verander hart icoon om te verwijderen uit favorieten
}

// Add/Remove favorite
favoriteBtn.addEventListener('click', async  () => {
    const if_char_fav = favorites.includes(karakterID) //if current character is favoriet

    favoriteStar.style.display =  if_char_fav ? 'none'    : 'block';
    favoriteBtn.textContent    =  if_char_fav ? '❤️'     :  '💔';

    showPopup( if_char_fav ? 'Verwijderd uit favorieten!' : 'Toegevoegd aan favorieten!')

    if (if_char_fav) {
        favorites = favorites.filter(id => id !== karakterID);
    }else{
        favorites.push(karakterID);
    }

    await request("/setfavoriet",{"id":favorites}, "POST", "")
});

await request("/set_profiel",{id: karakterID}, "POST", "")
// de momenteele profiel karakter pakken en zetten als profiel foto
let isUserCharacter = await req_data("/get_profiel", "", "GET","id")
console.log("isUserchar", isUserCharacter);

//document.querySelector('.set-profile img');  //zet the icon, om te laten zien dat dit karakter is gebruikt als profiel of niet
setProfileBtn.src  = isUserCharacter  ? './assets/delete.png' : './assets/add-user.png';
//document.getElementById('user-profile-img'); profiel foto zetten
userProfileImg.src = isUserCharacter ? karakterImg.src : "./assets/question-mark.svg";

console.log("userProfileImg", userProfileImg.src);


//de profiel van de gebruiker updaten wanner en nieuw profiel is gekozen door op de knop te drukken
setProfileBtn.addEventListener('click', async () => {
    await request("/set_profiel",{id: isUserCharacter ? karakterID : ''}, "POST", "")

    isUserCharacter = !isUserCharacter;
    
    if (isUserCharacter) {
        userProfileImg.src = karakterImg.src
        setProfileBtn.src = './assets/delete.png'
    }

    showPopup(isUserCharacter ? 'Je hebt dit karakter als gebruiker gekozen!' : 'Niet langer je gebruiker!');
});

// ❌ **Blacklist functie**
blacklistBtn.addEventListener('click', () => {
    blacklistReason.classList.add('show');
});

// 🚀 **Bevestig blacklist (Toevoegen aan zwarte lijst)**
submitBlacklist.addEventListener('click', async () => {
    const reason = blacklistInput.value.trim();
    if (!reason) {
        showPopup("Voer een reden in!");
        return;
    }

    let blacklist = JSON.parse(await req_data("/get_blacklist", "", "GET","id"));
    blacklist.push({
        id: karakterID,
        name: karakterNaam.innerText,
        image: karakterImg.src,
        reason: reason
    });

    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
    await req_data("/set_blacklist", {"id":blacklist}, "POST","id")
    showPopup("Karakter toegevoegd aan de zwarte lijst!");
    
    setTimeout(() => {
        window.location.href = 'blacklist.html'; // 🚀 Automatische redirect
    }, 1500);
});

// ℹ️ **Info-knop popup**
infoBtn.addEventListener('click', () => {
    showPopup('Hier kun je personages bekijken, favorieten instellen en een gebruiker kiezen.');
});

// ✅ **Meldingen tonen**
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}

// ✅ **Laad karaktergegevens**
fetchKarakter();

// ✅ **Verwijder personage van de zwarte lijst en keer terug naar `karakter.html`**
async function removeFromBlacklist(id) {
    let blacklist = JSON.parse(localStorage.getItem('blacklistCharacters')) || [];

    

    blacklist = blacklist.filter(outfit => outfit.id !== id);
    await req_data("/set_blacklist", {"id":blacklist}, "POST","id")
    showPopup("Karakter uit de zwarte lijst verwijderd!");

    setTimeout( async () => {
        await req_data("/set_selected", {"id":blacklist}, "POST","id")
        localStorage.setItem('selectedCharacter', id); // Zet het verwijderde personage weer als geselecteerd
        window.location.href = 'karakter.html'; // 🚀 Automatische redirect naar karakterpagina
    }, 1500);
}

// ✅ **Event Listener toevoegen aan verwijderknoppen op blacklist.html**
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-blacklist')) {
        const id = e.target.dataset.id;
        removeFromBlacklist(id);
    }
});
