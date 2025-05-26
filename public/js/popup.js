// /public/js/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const popupMessage = document.getElementById('popup-message');
  const favoriteBtn = document.querySelector('.favorite-btn');
  const favoriteStar = document.querySelector('.favorite-star');
  const setProfileBtn = document.querySelector('.set-profile');
  const userProfileImg = document.querySelector('.user-profile');
  const blacklistBtn = document.querySelector('.blacklist-btn');
  const blacklistPopup = document.getElementById('blacklist-reason');
  const blacklistInput = document.getElementById('blacklist-input');
  const submitBlacklist = document.getElementById('submit-blacklist');

  // FAVORIET (❤️/💔)
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = favoriteBtn.dataset.id;
      const res = await fetch(`/favorieten/${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.favoriet) {
          favoriteBtn.textContent = '💔';
          if (favoriteStar) favoriteStar.style.display = '';
          showPopup('Toegevoegd aan favorieten!');
        } else {
          favoriteBtn.textContent = '❤️';
          if (favoriteStar) favoriteStar.style.display = 'none';
          showPopup('Verwijderd uit favorieten!');
        }
      }
    });
  }

  // AVATAR instellen/wissen
  if (setProfileBtn) {
    setProfileBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = setProfileBtn.dataset.id;
      const img = setProfileBtn.dataset.img;
      const res = await fetch(`/avatar/${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const currentImg = setProfileBtn.querySelector('img');
        if (data.avatarSet) {
          if (currentImg) currentImg.src = '/assets/delete.png';
          if (userProfileImg) userProfileImg.src = img;
          showPopup('Je hebt dit karakter als gebruiker gekozen!');
        } else {
          if (currentImg) currentImg.src = '/assets/add-user.png';
          if (userProfileImg) userProfileImg.src = '/assets/question-mark.svg';
          showPopup('Niet langer je gebruiker!');
        }
      }
    });
  }

  // BLACKLIST popup tonen
  if (blacklistBtn && blacklistPopup && blacklistInput) {
    blacklistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      blacklistPopup.classList.add('show');
      blacklistInput.value = '';
      blacklistInput.focus();
    });
  }

  // BLACKLIST versturen
  if (submitBlacklist && blacklistPopup && blacklistBtn && blacklistInput) {
    submitBlacklist.addEventListener('click', async (e) => {
      e.preventDefault();
      const reason = blacklistInput.value.trim();
      if (!reason) {
        showPopup('Voer een reden in!');
        return;
      }
      const id = blacklistBtn.dataset.id;
      const name = blacklistBtn.dataset.name;
      const image = blacklistBtn.dataset.img;
      const res = await fetch(`/blacklist/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, name, image })
      });
      if (res.ok) {
        window.location.href = '/blacklist';
      } else {
        showPopup('Fout bij toevoegen aan blacklist.');
      }
    });
  }

  // Helper voor feedback popup
  function showPopup(message) {
    if (!popupMessage) return;
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 2500);
  }

  // Sluit blacklist-popup als je buiten popup klikt
  window.addEventListener('mousedown', function(e){
    if (
      blacklistPopup &&
      blacklistPopup.classList.contains('show') &&
      !blacklistPopup.contains(e.target) &&
      e.target !== blacklistBtn
    ) {
      blacklistPopup.classList.remove('show');
    }
  });
});
