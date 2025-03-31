var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//de melding tag variable houdt en kopie van de html div met melding class
//dit zorgt ervoor dat we gewoon het zelfde html element kunnen gebruiken om op het scherm te zetten
var melding_tag = null;
var body = document.getElementsByTagName("body")[0];
//dit houdt bij de levenstijd van de melding, dit wordt geupdate naar het momenteel tijdstip elke keer
//wanner en nieuwe melding wordt gecreerd, zo dat wanner je nieuwe meldingen creert, het niet te vroeg wordt verwijderd 
var melding_tag_time = 0;
//hoelang gewacht wordt voor de melding wordt verwijderd in miliseconden
var melding_decay = 3000;
//hoelang wordt gewacht om de fade_out classe bijtevoegen om de melding weg te laten vegen
var fade_out_timer = 1000;
//haalt de melding structuur van de html
function refresh_access_token() {
    return __awaiter(this, void 0, void 0, function () {
        var response, body_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request("/refresh", "", "GET", "")];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    body_1 = _a.sent();
                    accesstoken = body_1["accesstoken"];
                    _a.label = 3;
                case 3:
                    if (!accesstoken) {
                        return [2 /*return*/, false];
                    }
                    else {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function get_melding_tag_structure() {
    return __awaiter(this, void 0, void 0, function () {
        var melding_tag_real, if_logged, span_naam, div_naam, dict_uis, username;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    melding_tag_real = document.getElementsByClassName("melding")[0];
                    melding_tag = melding_tag_real.cloneNode(true);
                    melding_tag_real.remove();
                    return [4 /*yield*/, refresh_access_token()];
                case 1:
                    if_logged = _b.sent();
                    if (!if_logged) return [3 /*break*/, 4];
                    (_a = document.getElementById("login_register")) === null || _a === void 0 ? void 0 : _a.classList.add("invis");
                    span_naam = document.getElementById("profiel_name");
                    div_naam = document.getElementById("profiel");
                    return [4 /*yield*/, request("/username", "", "GET", accesstoken)];
                case 2: return [4 /*yield*/, (_b.sent()).json()];
                case 3:
                    dict_uis = _b.sent();
                    username = dict_uis["username"];
                    if (username) {
                        console.log(username);
                        div_naam.classList.remove("invis");
                        span_naam.innerText = username;
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
var accesstoken = "";
//gaat de get_melding_tag_structure() functie bellen wanner de website is geladen
document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);
//creert melding wanner de gebruiken op en knop drukt, neemt het bericht van de melding als parameter
function melding(bericht) {
    var _a;
    //checkt of we de melding tag structuur hebben opgeslaagt
    if (melding_tag !== null) {
        //zet de melding tag in de html pagina
        body.appendChild(melding_tag);
        //zet het tijdstip van de creatie van de melding
        melding_tag_time = new Date().getTime();
        //stopt de fade_out animatie door het te verwijderen
        melding_tag.classList.remove("fade_out");
        //start de melding animatie, door het bijtevoegen aan de classen lijst
        melding_tag.classList.add("melding");
        //start en timer wanner de fade_out animatie moet bijgevoegd worden
        setTimeout(start_fadeout, 1000, melding_tag);
        //start en timer wanner de melding moet verwijderd worden
        setTimeout(del_old_tag, melding_decay, melding_tag);
        //haalt de div die het bericht van de melding bijhoudt
        var text_div = (_a = melding_tag === null || melding_tag === void 0 ? void 0 : melding_tag.getElementsByClassName("melding_text")[0]) === null || _a === void 0 ? void 0 : _a.children[1];
        //checkt of de text div bestaat
        if (text_div != undefined) {
            //zet het bericht van de melding
            text_div.textContent = bericht;
        }
    }
}
//verwijderd de melding wanner er op het x icon wordt gedrukt
function delete_melding(tag) {
    var _a;
    //since het verwijder knop, twee niveus lager zit in de html, moeten we twee keer kijken naar wie de ouder element is
    var parent = (_a = tag.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
    //verwijderd element
    parent === null || parent === void 0 ? void 0 : parent.remove();
}
//verwijderd melding wanner het te oud is
function del_old_tag(tag) {
    //checkt of het tijdstip van de creatie van de melding plus de tijd die het mag bestaan lager is
    //dan het momenteele tijdstip
    if (melding_tag_time + melding_decay < new Date().getTime()) {
        if (tag !== null) {
            //reset de class lijst
            tag.classList.value = "";
            //verwijdert de melding
            tag.remove();
        }
    }
}
//start de fade_out animatie
function start_fadeout(tag) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            //checkt of het tijd is om de fade_out animatie te starten
            if (melding_tag_time + fade_out_timer < new Date().getTime()) {
                tag.classList.add("fade_out");
            }
            return [2 /*return*/];
        });
    });
}
function if_logged(text) { if_logged2(text); }
function if_logged2(text) {
    return __awaiter(this, void 0, void 0, function () {
        var if_logged;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if_logged = false;
                    return [4 /*yield*/, refresh_access_token()];
                case 1:
                    if_logged = _a.sent();
                    console.log(if_logged);
                    if (if_logged) {
                        window.location.href = "lproject.html";
                    }
                    else {
                        melding(text);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function logout() {
    console.log("some");
    yoma();
}
function yoma() {
    return __awaiter(this, void 0, void 0, function () {
        var some;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("wad");
                    return [4 /*yield*/, request("/logout", "", "GET", accesstoken)];
                case 1:
                    some = _a.sent();
                    console.log("wad2");
                    accesstoken = "";
                    window.location.reload();
                    return [2 /*return*/];
            }
        });
    });
}
function request(url, data, mode, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    response = null;
                    if (!("GET" == mode)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch(url, {
                            method: mode, // HTTP method
                            headers: {
                                'Authorization': "Bearer ".concat(token),
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, fetch(url, {
                        method: mode, // HTTP method
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                        credentials: 'include'
                    })];
                case 3:
                    response = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, response];
            }
        });
    });
}
