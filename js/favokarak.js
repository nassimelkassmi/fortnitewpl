const karakterImg = document.getElementById('karakter-img');
const karakterNaam = document.getElementById('karakter-naam');
const karakterBeschrijving = document.getElementById('karakter-beschrijving');
const wins = document.getElementById('wins');
const losses = document.getElementById('losses');
const addWin = document.getElementById('add-win');
const addLoss = document.getElementById('add-loss');
const notes = document.getElementById('notes');
const saveNotes = document.getElementById('save-notes');
const item1 = document.getElementById('item1');
const item2 = document.getElementById('item2');
const saveItems = document.getElementById('save-items');
const removeFavorite = document.querySelector('.remove-favorite');

const karakterID = localStorage.getItem('selectedCharacter');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}

// Load Character Data
async function fetchKarakter() {
    const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
    const data = await response.json();
    if (!data.data) return;

    const karakter = data.data;
    karakterImg.src = karakter.images.icon;
    karakterNaam.innerText = karakter.name;
    karakterBeschrijving.innerText = karakter.description || 'Geen beschrijving beschikbaar.';
}

// Load Wins, Losses, and Notes
wins.innerText = localStorage.getItem(`wins-${karakterID}`) || 0;
losses.innerText = localStorage.getItem(`losses-${karakterID}`) || 0;
notes.value = localStorage.getItem(`notes-${karakterID}`) || '';
item1.value = localStorage.getItem(`item1-${karakterID}`) || '';
item2.value = localStorage.getItem(`item2-${karakterID}`) || '';

// Save Data
addWin.addEventListener('click', () => {
    let winCount = parseInt(wins.innerText) + 1;
    wins.innerText = winCount;
    localStorage.setItem(`wins-${karakterID}`, winCount);
});

addLoss.addEventListener('click', () => {
    let lossCount = parseInt(losses.innerText) + 1;
    losses.innerText = lossCount;
    localStorage.setItem(`losses-${karakterID}`, lossCount);
});

saveNotes.addEventListener('click', () => localStorage.setItem(`notes-${karakterID}`, notes.value));
saveItems.addEventListener('click', () => {
    localStorage.setItem(`item1-${karakterID}`, item1.value);
    localStorage.setItem(`item2-${karakterID}`, item2.value);
});

removeFavorite.addEventListener('click', () => {
    favorites = favorites.filter(id => id !== karakterID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    window.location.href = 'personages.html';
});

fetchKarakter();
