console.log("✅ get_username geladen");

var accesstoken: string = "";

// Wacht tot de DOM geladen is
document.addEventListener('DOMContentLoaded', () => {
  set_name();
  set_avatar();
});

// Haal en toon gebruikersnaam
async function set_name(): Promise<void> {
  const if_logged = await refresh_access_token();
  if (!if_logged) return;

  const span_naam = document.getElementById("username_display") as HTMLSpanElement | null;
  if (!span_naam) return;

  const response = await request("/username", {}, "GET", accesstoken);
  if (!response) return;

  const dict_uis = await response.json();
  const username = dict_uis["username"];

  if (username) {
    span_naam.innerText = username;
  }
}

// Haal access token op via refresh endpoint
async function refresh_access_token(): Promise<boolean> {
  const response = await request("/refresh", {}, "GET", "");
  if (!response?.ok) return false;

  const body = await response.json();
  accesstoken = body["accesstoken"];
  return !!accesstoken;
}

// Algemeen request helper
async function request(
  url: string,
  data: object,
  method: "GET" | "POST",
  token: string = ""
): Promise<Response | undefined> {
  try {
    if (method === "GET") {
      return await fetch(url, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    } else {
      return await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }
  } catch (error) {
    console.error("Fout bij request:", error);
    return undefined;
  }
}

// ✅ Profielfoto instellen vanuit localStorage
function set_avatar(): void {
  const userProfileImg = document.getElementById('user-profile-img') as HTMLImageElement | null;
  const userImage = localStorage.getItem('userCharacterImg');

  if (userProfileImg) {
    userProfileImg.src = userImage ?? './assets/question-mark.svg';
  }
}
