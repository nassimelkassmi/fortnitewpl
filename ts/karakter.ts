// 🔰 Types
type BlacklistCharacter = {
    id: string;
    name: string;
    image: string;
    reason: string;
};

type KarakterData = {
    id: string;
    name: string;
    description?: string;
    rarity: {
        value: string;
        displayValue?: string;
    };
    set?: { value: string };
    introduction?: { text: string };
    images: { icon: string };
};

// 📦 DOM-elementen
const karakterImg = document.getElementById('karakter-img') as HTMLImageElement;
const karakterNaam = document.getElementById('karakter-naam') as HTMLElement;
const karakterBeschrijving = document.getElementById('karakter-beschrijving') as HTMLElement;
const karakterRarity = document.getElementById('karakter-rarity') as HTMLElement;
const karakterSet = document.getElementById('karakter-set') as HTMLElement;
const karakterRelease = document.getElementById('karakter-release') as HTMLElement;

const favoriteBtn = document.querySelector('.favorite-btn') as HTMLButtonElement;
const setProfileBtn = document.querySelector('.set-profile img') as HTMLImageElement;
const infoBtn = document.querySelector('.info-btn') as HTMLButtonElement;
const popupMessage = document.getElementById('popup-message') as HTMLElement;
const favoriteStar = document.querySelector('.favorite-star') as HTMLElement;
const blacklistBtn = document.querySelector('.blacklist-btn') as HTMLButtonElement;
const blacklistReason = document.getElementById('blacklist-reason') as HTMLElement;
const blacklistInput = document.getElementById('blacklist-input') as HTMLInputElement;
const submitBlacklist = document.getElementById('submit-blacklist') as HTMLButtonElement;
const userProfileImg = document.getElementById('user-profile-img') as HTMLImageElement;

const karakterID = localStorage.getItem('selectedCharacter');

if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}

// ✅ API-call voor karakterdata
async function fetchKarakter(): Promise<void> {
    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
        const data: { data: KarakterData } = await response.json();

        if (!data.data) {
            console.warn('Karakter niet gevonden.');
            return;
        }

        const karakter = data.data;

        karakterImg.src = karakter.images.icon;
        karakterNaam.innerText = karakter.name;
        karakterBeschrijving.innerText = karakter.description || 'Geen beschrijving beschikbaar.';
        karakterRarity.innerText = karakter.rarity.displayValue || 'Onbekend';
        karakterSet.innerText = karakter.set ? karakter.set.value : 'Geen set';
        karakterRelease.innerText = karakter.introduction ? karakter.introduction.text : 'Onbekend';
        karakterRarity.classList.add(getRarityClass(karakter.rarity.value));
    } catch (error) {
        console.error('Fout bij het ophalen van het karakter:', error);
    }
}

// ✅ CSS-class bepalen op basis van rarity
function getRarityClass(rarity: string): string {
    switch (rarity.toLowerCase()) {
        case 'common': return 'rarity-common';
        case 'uncommon': return 'rarity-uncommon';
        case 'rare': return 'rarity-rare';
        case 'epic': return 'rarity-epic';
        case 'legendary': return 'rarity-legendary';
        default: return 'rarity-other';
    }
}

// ✅ Favorietenlogica
let favorites: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');

if (favorites.includes(karakterID)) {
    favoriteStar.style.display = 'block';
    favoriteBtn.textContent = '💔';
}

favoriteBtn.addEventListener('click', () => {
    if (favorites.includes(karakterID)) {
        favorites = favorites.filter(id => id !== karakterID);
        favoriteStar.style.display = 'none';
        favoriteBtn.textContent = '❤️';
        showPopup('Verwijderd uit favorieten!');
    } else {
        favorites.push(karakterID);
        favoriteStar.style.display = 'block';
        favoriteBtn.textContent = '💔';
        showPopup('Toegevoegd aan favorieten!');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
});

// ✅ Gebruiker instellen als profiel
let isUserCharacter = localStorage.getItem('userCharacter') === karakterID;
setProfileBtn.src = isUserCharacter ? './assets/delete.png' : './assets/add-user.png';
userProfileImg.src = isUserCharacter ? karakterImg.src : "./assets/question-mark.svg";

setProfileBtn.addEventListener('click', () => {
    isUserCharacter = !isUserCharacter;
    localStorage.setItem('userCharacter', isUserCharacter ? karakterID : '');
    setProfileBtn.src = isUserCharacter ? './assets/delete.png' : './assets/add-user.png';
    userProfileImg.src = isUserCharacter ? karakterImg.src : "./assets/question-mark.svg";
    showPopup(isUserCharacter ? 'Je hebt dit karakter als gebruiker gekozen!' : 'Niet langer je gebruiker!');
});

// ✅ Blacklist tonen
blacklistBtn.addEventListener('click', () => {
    blacklistReason.classList.add('show');
});

// ✅ Toevoegen aan blacklist
submitBlacklist.addEventListener('click', () => {
    const reason = blacklistInput.value.trim();
    if (!reason) {
        showPopup("Voer een reden in!");
        return;
    }

    let blacklist: BlacklistCharacter[] = JSON.parse(localStorage.getItem('blacklistCharacters') || '[]');
    blacklist.push({
        id: karakterID,
        name: karakterNaam.innerText,
        image: karakterImg.src,
        reason: reason
    });

    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
    showPopup("Karakter toegevoegd aan de zwarte lijst!");

    setTimeout(() => {
        window.location.href = 'blacklist.html';
    }, 1500);
});

// ✅ Info-popup
infoBtn.addEventListener('click', () => {
    showPopup('Hier kun je personages bekijken, favorieten instellen en een gebruiker kiezen.');
});

// ✅ Popup helper
function showPopup(message: string): void {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}

// ✅ Karakter ophalen bij laden
fetchKarakter();

// ✅ Blacklist-verwijdering
function removeFromBlacklist(id: string): void {
    let blacklist: BlacklistCharacter[] = JSON.parse(localStorage.getItem('blacklistCharacters') || '[]');
    blacklist = blacklist.filter(outfit => outfit.id !== id);
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
    showPopup("Karakter uit de zwarte lijst verwijderd!");

    setTimeout(() => {
        localStorage.setItem('selectedCharacter', id);
        window.location.href = 'karakter.html';
    }, 1500);
}

// ✅ Event voor verwijderen via andere pagina
document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-blacklist')) {
        const id = target.getAttribute('data-id');
        if (id) removeFromBlacklist(id);
    }
});
