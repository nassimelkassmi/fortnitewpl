"use strict";
const charactersGrid = document.getElementById('characters-grid');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter-rarity');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');
let allOutfits = [];
let accesstoken = '';
// ✅ DOM geladen
document.addEventListener('DOMContentLoaded', () => {
    set_name();
    set_avatar();
});
async function fetchOutfits() {
    try {
        const response = await fetch('https://fortnite-api.com/v2/cosmetics/br');
        const data = await response.json();
        if (!data.data)
            return;
        const outfits = data.data.filter(outfit => outfit.type.value === 'outfit');
        allOutfits = outfits;
        displayCharacters(outfits);
    }
    catch (error) {
        console.error('Fout bij het ophalen van outfits:', error);
    }
}
function displayCharacters(outfits) {
    charactersGrid.innerHTML = '';
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    outfits.forEach(outfit => {
        if (!outfit.images?.icon)
            return;
        let rarityClass = outfit.rarity.value.toLowerCase();
        const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (!validRarities.includes(rarityClass)) {
            rarityClass = 'other';
        }
        const outfitCard = document.createElement('div');
        outfitCard.className = `character-card rarity-${rarityClass}`;
        const isFavorite = favorites.includes(outfit.id);
        const starVisibility = isFavorite ? 'block' : 'none';
        outfitCard.innerHTML = `
            <span class="favorite-star" style="display: ${starVisibility};">⭐</span>
            <p class="rarity-label">${outfit.rarity.displayValue || 'Overige'}</p>
            <img src="${outfit.images.icon}" alt="${outfit.name}">
            <h3>${outfit.name}</h3>
        `;
        outfitCard.addEventListener('click', () => {
            localStorage.setItem('selectedCharacter', outfit.id);
            window.location.href = isFavorite ? 'favokarak.html' : 'karakter.html';
        });
        charactersGrid.appendChild(outfitCard);
    });
}
function filterCharacters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedRarity = filterSelect.value;
    const filtered = allOutfits.filter(outfit => {
        const matchesSearch = outfit.name.toLowerCase().includes(searchText);
        let rarityClass = outfit.rarity.value.toLowerCase();
        const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (!validRarities.includes(rarityClass)) {
            rarityClass = 'other';
        }
        const matchesRarity = selectedRarity ? rarityClass === selectedRarity : true;
        return matchesSearch && matchesRarity;
    });
    displayCharacters(filtered);
}
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}
infoBtn.addEventListener('click', () => {
    showPopup('Klik op een personage voor meer opties! Alleen bij favorieten kan je items en notities toevoegen!');
});
searchInput.addEventListener('input', filterCharacters);
filterSelect.addEventListener('change', filterCharacters);
async function set_name() {
    const if_logged = await refresh_access_token();
    if (if_logged) {
        const span_naam = document.getElementById("username_display");
        const dict_uis = await (await request("/username", "", "GET", accesstoken)).json();
        const username = dict_uis["username"];
        if (username) {
            span_naam.innerText = username;
        }
    }
}
async function refresh_access_token() {
    const response = await request("/refresh", "", "GET", "");
    if (response.ok) {
        const body = await response.json();
        accesstoken = body["accesstoken"];
    }
    return !!accesstoken;
}
async function request(url, data, method, token) {
    let response;
    if (method === "GET") {
        response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    }
    else {
        response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
    }
    return response;
}
// ✅ Profielfoto instellen vanuit localStorage
function set_avatar() {
    const userProfileImg = document.getElementById('user-profile-img');
    const userImage = localStorage.getItem('userCharacterImg');
    if (userProfileImg) {
        userProfileImg.src = userImage ?? './assets/question-mark.svg';
    }
}
function toggleMenu() {
    const menu = document.querySelector(".nav-menu");
    menu.classList.toggle("show");
}
fetchOutfits();
