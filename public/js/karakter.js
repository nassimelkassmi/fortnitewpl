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

const karakterID = localStorage.getItem('selectedCharacter');

if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}

// ✅ **Haal karaktergegevens op van de API**
async function fetchKarakter() {
    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
        const data = await response.json();

        if (!data.data) {
            console.warn('Karakter niet gevonden.');
            return;
        }

        const karakter = data.data;

        // 🖼️ **Vul de pagina met karaktergegevens**
        karakterImg.src = karakter.images.icon;
        karakterNaam.innerText = karakter.name;
        karakterBeschrijving.innerText = karakter.description || 'Geen beschrijving beschikbaar.';
        karakterRarity.innerText = karakter.rarity.displayValue || 'Onbekend';
        karakterSet.innerText = karakter.set ? karakter.set.value : 'Geen set';
        karakterRelease.innerText = karakter.introduction ? karakter.introduction.text : 'Onbekend';

        // 🎨 **Voeg de juiste kleur toe voor zeldzaamheid**
        karakterRarity.classList.add(getRarityClass(karakter.rarity.value));

    } catch (error) {
        console.error('Fout bij het ophalen van het karakter:', error);
    }
}

// 📌 **Bepaal de CSS-klasse op basis van zeldzaamheid**
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

// ⭐ **Favoriet functie**
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Check of dit karakter al favoriet is
if (favorites.includes(karakterID)) {
    favoriteStar.style.display = 'block';
    favoriteBtn.textContent = '💔'; // Verander hart icoon om te verwijderen uit favorieten
}

// Add/Remove favorite
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

// 👤 **Gebruik als profiel**
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

// ❌ **Blacklist functie**
blacklistBtn.addEventListener('click', () => {
    blacklistReason.classList.add('show');
});

// 🚀 **Bevestig blacklist (Toevoegen aan zwarte lijst)**
submitBlacklist.addEventListener('click', () => {
    const reason = blacklistInput.value.trim();
    if (!reason) {
        showPopup("Voer een reden in!");
        return;
    }

    let blacklist = JSON.parse(localStorage.getItem('blacklistCharacters')) || [];
    blacklist.push({
        id: karakterID,
        name: karakterNaam.innerText,
        image: karakterImg.src,
        reason: reason
    });

    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));

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
function removeFromBlacklist(id) {
    let blacklist = JSON.parse(localStorage.getItem('blacklistCharacters')) || [];
    blacklist = blacklist.filter(outfit => outfit.id !== id);
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));

    showPopup("Karakter uit de zwarte lijst verwijderd!");

    setTimeout(() => {
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
