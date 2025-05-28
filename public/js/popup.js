
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

      const actiesDiv = favoriteBtn.closest('.karakter-actions');
      let detailForm = actiesDiv.querySelector('form.fav-detail-form');

      if (data.favoriet) {
        favoriteBtn.textContent = '💔';
        if (favoriteStar) favoriteStar.style.display = '';
        showPopup('Toegevoegd aan favorieten!');

        if (!detailForm) {
          detailForm = document.createElement('form');
          detailForm.className = 'fav-detail-form';
          detailForm.action = `/personages/${id}/favorietdetail`;
          detailForm.method = 'get';
          detailForm.style.display = 'inline';

          const btn = document.createElement('button');
          btn.type = 'submit';
          btn.className = 'fav-detail-btn';
          btn.textContent = 'Opties';
          detailForm.appendChild(btn);

          actiesDiv.appendChild(detailForm);
        }

      } else {
        favoriteBtn.textContent = '❤️';
        if (favoriteStar) favoriteStar.style.display = 'none';
        showPopup('Verwijderd uit favorieten!');

        if (detailForm) detailForm.remove();
      }
    }
  });
}


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

  if (blacklistBtn && blacklistPopup && blacklistInput) {
    blacklistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      blacklistPopup.classList.add('show');
      blacklistInput.value = '';
      blacklistInput.focus();
    });
  }

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

  function showPopup(message) {
    if (!popupMessage) return;
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 2500);
  }

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

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('landingpage-body')) {
    const popup = document.getElementById('popup-message');

    function showPopup(msg) {
      if (!popup) return;
      popup.textContent = msg;
      popup.style.display = "block";
      popup.classList.add("show");
      setTimeout(() => {
        popup.style.display = "none";
        popup.classList.remove("show");
      }, 2000);
    }

    document.querySelectorAll('a[href="/lproject"], .game-text-container a[href="/lproject"], .game-image-container a[href="/lproject"]').forEach(link => {
      link.addEventListener('click', function(e) {
        if (!window.username) {
          e.preventDefault();
          showPopup("Je moet eerst inloggen om verder te gaan!");
        }
      });
    });

    document.querySelectorAll('.game').forEach(gameDiv => {
      const h2 = gameDiv.querySelector('h2');
      if (!h2) return;
      if (h2.textContent.trim() !== 'Fortnite') {
        gameDiv.addEventListener('click', function(e) {
          e.preventDefault();
          showPopup("Je hebt geen toegang tot dit project!");
        });
      }
    });
  }
});

