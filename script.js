document.addEventListener('DOMContentLoaded', function () {
    // Kontrol paneli sekme ge?i?i (tek bir yerde tan?mland?)
    const controlPanelTabBtns = document.querySelectorAll('.tab-header .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-panel');

    controlPanelTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            controlPanelTabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const targetPane = document.getElementById(this.dataset.tab);
            if (targetPane) {
                targetPane.classList.add('active');
            } else {
                console.error("Hedef panel bulunamad?:", this.dataset.tab);
            }
        });
    });

    // Formasyon se?im elementini al
    const formationSelect = document.getElementById("formation-select");

    // Sayfa y?klendi?inde formasyonu 4-2-3-1'e ayarla (e?er farkl? bir ba?lang?? formasyonu yoksa)
    const defaultFormation = "4-2-3-1";
    changeFormation(currentFormation, defaultFormation);
    currentFormation = defaultFormation;

    // Formasyon se?im dropdown'?n? 4-2-3-1 olarak ayarla
    formationSelect.value = defaultFormation;

    // Modal sekme olay dinleyicileri
    const playersTabBtn = document.getElementById('playersTabBtn');
    const rolesTabBtn = document.getElementById('rolesTabBtn');
    const substitutesTabBtn = document.querySelector('.control-panel .tab-header .tab-btn[data-tab="substitutes"]'); // Yedekler sekme butonu

    if (playersTabBtn) {
        playersTabBtn.addEventListener('click', showPlayersTab);
    }
    if (rolesTabBtn) {
        rolesTabBtn.addEventListener('click', showRolesTab);
    }
    if (substitutesTabBtn) {
        substitutesTabBtn.addEventListener('click', () => {
            // Yedekler sekmesine ge?ildi?inde (kontrol panelinde)
            if (modal.style.display === "block" && document.getElementById('rolesTabBtn').classList.contains('active')) {
                fetchAllPlayerProfiles();
            }
        });
    }

    setupFieldClickListeners();
    loadLeagues().then(leagues => {
        const firstLeague = leagues[0];
        if (firstLeague) {
            document.getElementById("league-select").value = firstLeague.id;
            loadTeams(firstLeague.id).then(teams => {
                if (teams && Array.isArray(teams) && teams.length > 0) {
                    const firstTeam = teams[0];
                    if (firstTeam) {
                        document.getElementById("team-select").value = firstTeam.id;
                        fetchPlayers(firstTeam.id);
                    }
                } else {
                    console.warn("Tak?m verisi al?namad? veya bo?.");
                }
            });
        }
    });
});

// GLOBAL DE???KEN
let selectedFieldSlot = null;
let searchInputListener = null;
let isSubstituteSlotSelected = false;
let currentFormation = "4-2-3-1";
const modal = document.getElementById('playerModal');
const closeModalButton = document.querySelector('.close-btn');
const playerRolesSection = document.getElementById("playerRolesSection");
const goalkeepersSection = document.querySelector(".position-list.goalkeepers");
const defendersSection = document.querySelector(".position-list.defenders");
const midfieldersSection = document.querySelector(".position-list.midfielders");
const forwardsSection = document.querySelector(".position-list.forwards");
const playerSearchInput = document.getElementById('playerSearchInput');
const playerSearchResults = document.getElementById('playerSearchResults');

function openModal() {
    modal.style.display = "block";
    playerRolesSection.style.display = "none";
    goalkeepersSection.style.display = "grid";
    defendersSection.style.display = "grid";
    midfieldersSection.style.display = "grid";
    forwardsSection.style.display = "grid";

    playerSearchInput.value = '';
    playerSearchResults.style.display = 'none';

    setupPlayerSearch();
}

function closeModal() {
    modal.style.display = "none";
    selectedFieldSlot = null;
    playerRolesSection.style.display = "none";
    goalkeepersSection.style.display = "none";
    defendersSection.style.display = "none";
    midfieldersSection.style.display = "none";
    forwardsSection.style.display = "none";

    playerSearchInput.removeEventListener('input', searchInputListener);
    searchInputListener = null;
}

function showPlayersTab() {
    document.getElementById('playerListSection').style.display = 'block';
    document.getElementById('playerRolesSection').style.display = 'none';
    document.getElementById('playersTabBtn').classList.add('active');
    document.getElementById('rolesTabBtn').classList.remove('active');

    // T?m oyuncu pozisyon listelerini g?r?n?r yap
    goalkeepersSection.style.display = 'grid';
    defendersSection.style.display = 'grid';
    midfieldersSection.style.display = 'grid';
    forwardsSection.style.display = 'grid';
}

function showRolesTab() {
    document.getElementById('playerListSection').style.display = 'none';
    document.getElementById('playerRolesSection').style.display = 'grid';
    document.getElementById('playersTabBtn').classList.remove('active');
    document.getElementById('rolesTabBtn').classList.add('active');

    if (isSubstituteSlotSelected) {
        fetchAllPlayerProfiles(); // Yedek slotundan geliyorsak t?m profilleri getir
    } else if (selectedFieldSlot) {
        const formationClass = Array.from(selectedFieldSlot.classList).find(cls => cls.startsWith('formation-'));
        const positionCode = mapFormationToPositionCode(formationClass);
        fetchPlayerProfilesByPosition(positionCode); // Saha slotundan geliyorsak pozisyona g?re filtrele
    } else {
        playerRolesSection.innerHTML = ""; // ?lk a??l??ta veya bilinmeyen durumda temizle
    }
}

// Modal kapatma olay dinleyicileri (tek bir yerde tan?mland?)
closeModalButton.addEventListener('click', closeModal);
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

function handleFieldPlayerClick(event) {
    selectedFieldSlot = event.target.closest('.player-div');
    isSubstituteSlotSelected = false; // Saha slotu se?ildi
    openModal();
    showPlayersTab();
}

function handleSubstitutePlayerClick(event) {
    selectedFieldSlot = event.target.closest('.sub-player-div');
    isSubstituteSlotSelected = true; // Yedek slotu se?ildi
    openModal();
    showPlayersTab();
}

function setupFieldClickListeners() {
    // Saha oyuncular? i?in olay dinleyicileri
    const fieldPlayerButtons = document.querySelectorAll('.field-section .player-div .player-select-btn');
    fieldPlayerButtons.forEach(button => {
        button.removeEventListener('click', handleFieldPlayerClick); // ?nceki dinleyicileri kald?r
        button.addEventListener('click', handleFieldPlayerClick);
    });

    // Yedek oyuncular i?in olay dinleyicileri
    const substituteButtons = document.querySelectorAll('.substitutes-section .sub-player-div .player-select-btn');
    substituteButtons.forEach(button => {
        button.removeEventListener('click', handleSubstitutePlayerClick); // ?nceki dinleyicileri kald?r
        button.addEventListener('click', handleSubstitutePlayerClick);
    });
}

function mapFormationToPositionCode(formationClass) {
    const map = {
        "formation-gk": "GK",
        "formation-1f": "ST",
        "formation-3aml": "FW",
        "formation-3amm": "AM",
        "formation-3amr": "FW",
        "formation-2dml": "DM",
        "formation-2dmr": "DM",
        "formation-4dll": "FB",
        "formation-4dml": "CB",
        "formation-4dmr": "CB",
        "formation-4drr": "FB",
        "formation-3fl": "FW",
        "formation-3fm": "FW",
        "formation-3fr": "FW",
        "formation-3ml": "CM",
        "formation-3mm": "CM",
        "formation-3mr": "CM"
    };
    return map[formationClass] || "CM";
}

async function fetchPlayerProfilesByPosition(positionCode) {
    try {
        const response = await fetch(`http://localhost:8080/api/player-profiles/search/${positionCode}`);
        if (!response.ok) {
            throw new Error("Roller y?klenemedi!");
        }
        const profiles = await response.json();
        renderPlayerProfiles(profiles);
    } catch (error) {
        console.error("Hata (roller):", error.message);
    }
}

async function fetchAllPlayerProfiles() {
    console.log("fetchAllPlayerProfiles fonksiyonu ?a?r?ld?.");
    try {
        const response = await fetch(`http://localhost:8080/api/player-profiles`); // T?m profilleri getiren endpoint
        if (!response.ok) {
            throw new Error(`T?m roller y?klenemedi! HTTP Hatas?: ${response.status}`);
        }
        const profiles = await response.json();
        console.log("Gelen profiller:", profiles);
        renderPlayerProfiles(profiles);
    } catch (error) {
        console.error("Hata (t?m roller):", error.message);
    }
}

function renderPlayerProfiles(profiles) {
    console.log("renderPlayerProfiles fonksiyonuna gelen profiller:", profiles);
    playerRolesSection.innerHTML = "";
    playerRolesSection.style.display = "grid";

    profiles.forEach(profile => {
        const div = document.createElement("div");
        div.className = "player-container";
        div.innerHTML = `
            <button class="player-select-btn profile-btn">
                <div class="placeholder-player">
                    <div class="player-icon">
                        <img src="assets/images/player-icon.png" alt="Profile Icon" width="50" height="50">
                    </div>
                    <div class="player-name">
                        <span>${profile.name}</span>
                    </div>
                </div>
            </button>
        `;
        div.querySelector(".profile-btn").addEventListener("click", () => {
            selectProfile(profile);
        });
        playerRolesSection.appendChild(div);
    });
}

async function loadLeagues() {
    try {
        const response = await fetch("http://localhost:8080/api/leagues");
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ligler al?n?rken HTTP hatas?:", response.status, errorText);
            return []; // Hata durumunda bo? bir dizi d?nd?r veya hatay? yeniden f?rlat
        }
        const leagues = await response.json();
        const leagueSelect = document.getElementById("league-select");
        //leagueSelect.innerHTML = '<option value="">Ligi se?iniz</option>';
        leagues.forEach(league => {
            const option = document.createElement("option");
            option.value = league.id;
            option.textContent = league.name;
            leagueSelect.appendChild(option);
        });
        return leagues; // Ba?ar?l? durumda ligleri d?nd?r
    } catch (error) {
        console.error("Ligler al?n?rken a? hatas?:", error);
        return []; // A? hatas? durumunda bo? bir dizi d?nd?r veya hatay? yeniden f?rlat
    }
}

async function loadTeams(leagueId) {
    try {
        const response = await fetch(`http://localhost:8080/api/teams/search/${leagueId}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Tak?mlar al?n?rken HTTP hatas?:", response.status, errorText);
            return []; // Hata durumunda bo? bir dizi d?nd?r
        }
        const teams = await response.json();
        const teamSelect = document.getElementById("team-select");
        teamSelect.innerHTML = '';
        teams.forEach(team => {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
        return teams; // Ba?ar?l? durumda tak?mlar? d?nd?r
    } catch (error) {
        console.error("Tak?mlar al?n?rken a? hatas?:", error);
        return []; // A? hatas? durumunda bo? bir dizi d?nd?r
    }
}

async function fetchPlayers(teamId) {
    try {
        const response = await fetch(`http://localhost:8080/api/players/search/${teamId}`);
        if (!response.ok) throw new Error("Oyuncular al?namad?");
        const players = await response.json();
        console.log("Oyuncular:", players);
        renderPlayers(players);
    } catch (error) {
        console.error("Hata:", error.message);
    }
}

function clearPlayerLists() {
    goalkeepersSection.innerHTML = "";
    defendersSection.innerHTML = "";
    midfieldersSection.innerHTML = "";
    forwardsSection.innerHTML = "";
}

function selectPlayer(player) {
    if (selectedFieldSlot) {
        const content = `
            <div class="placeholder-player">
                <div class="player-icon">
                    <img src="${player.photoUrl}" alt="${player.name}" width="50" height="50" loading="lazy">
                </div>
                <div class="player-name">
                    <span>${player.name}</span>
                </div>
            </div>
        `;
        updateFieldSlot(content);
        closeModal();
    }
}

function selectProfile(profile) {
    if (selectedFieldSlot) {
        const content = `
            <div class="placeholder-player">
                <div class="player-icon">
                    <img src="assets/images/player-icon.png" alt="Profile Icon" width="50" height="50">
                </div>
                <div class="player-name">
                    <span>${profile.name}</span>
                </div>
            </div>
        `;
        updateFieldSlot(content);
        closeModal();
    }
}

function renderPlayers(players) {
    clearPlayerLists();
    players.forEach(player => {
        let section;
        const pos = player.position.toUpperCase();
        if (pos.includes("GK")) section = goalkeepersSection;
        else if (pos.includes("CB") || pos.includes("LB") || pos.includes("RB") || pos.startsWith("D")) section = defendersSection;
        else if (pos.includes("CM") || pos.includes("AM") || pos.includes("DM") || pos.startsWith("M")) section = midfieldersSection;
        else if (pos.includes("ST") || pos.includes("CF") || pos.startsWith("F") || pos.includes("W")) section = forwardsSection;

        if (section) {
            const container = document.createElement("div");
            container.className = "player-container";
            container.innerHTML = `
                <button class="player-select-btn player-item-btn">
                    <div class="placeholder-player">
                        <div class="player-icon">
                            <img src="${player.photoUrl}" alt="${player.name}" width="50" height="50" loading="lazy">
                        </div>
                        <div class="player-name">
                            <span>${player.name}</span>
                        </div>
                    </div>
                </button>
            `;
            container.querySelector(".player-item-btn").addEventListener("click", () => {
                selectPlayer(player);
            });
            section.appendChild(container);
        }
    });
}

function updateFieldSlot(content) {
    if (selectedFieldSlot) {
        selectedFieldSlot.innerHTML = content;
        selectedFieldSlot.onclick = function () {
            selectedFieldSlot = this;
            openModal();
            showPlayersTab(); // Varsay?lan olarak oyuncular sekmesini a?
        };
    }
}

// Arama terimini al ve backend'e istek g?nder
async function fetchSearchResults(searchTerm) {
    try {
        const response = await fetch(`http://localhost:8080/api/players/search?query=${searchTerm}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Arama s?ras?nda hata:", error);
        return null; // Hata durumunda null veya bo? bir dizi d?nd?r?lebilir
    }
}

// Arama sonu?lar?n? ekranda g?ster
function displaySearchResults(results) {
    playerSearchResults.innerHTML = '';
    playerSearchResults.style.display = 'none';

    if (results && results.length > 0) {
        playerSearchResults.style.display = 'block';
        results.forEach(player => {
            const resultItem = createSearchResultItem(player);
            playerSearchResults.appendChild(resultItem);
        });
    }
}

// Bir arama sonucu ??esi olu?tur
function createSearchResultItem(player) {
    const resultItem = document.createElement('div');
    resultItem.classList.add('search-result-item');

    const iconDiv = document.createElement('div');
    iconDiv.classList.add('search-result-item-icon');
    const img = document.createElement('img');
    img.src = player.photoUrl;
    img.alt = player.name;
    img.loading = 'lazy';
    iconDiv.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('search-result-item-info');
    const nameSpan = document.createElement('span');
    nameSpan.classList.add('player-name');
    nameSpan.textContent = player.name;
    const positionSpan = document.createElement('span');
    positionSpan.classList.add('player-position');
    positionSpan.textContent = `(${player.position})`;
    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(positionSpan);

    resultItem.appendChild(iconDiv);
    resultItem.appendChild(infoDiv);

    resultItem.addEventListener('click', () => {
        selectPlayer(player);
        playerSearchResults.style.display = 'none';
        playerSearchInput.value = '';
    });

    return resultItem;
}

function setupPlayerSearch() {
    searchInputListener = function () {
        const searchTerm = this.value.toLowerCase().trim();
        playerSearchResults.innerHTML = '';
        playerSearchResults.style.display = 'none';

        if (searchTerm.length >= 2) {
            fetchSearchResults(searchTerm)
                .then(results => {
                    if (results) {
                        displaySearchResults(results);
                    }
                });
        }
    };
    playerSearchInput.addEventListener('input', searchInputListener);
}

document.getElementById("rolesTabBtn").addEventListener("click", () => {
    goalkeepersSection.style.display = "none";
    defendersSection.style.display = "none";
    midfieldersSection.style.display = "none";
    forwardsSection.style.display = "none";
    playerRolesSection.style.display = "grid";
});

document.getElementById("formation-select").addEventListener("change", function () {
    const newFormation = this.value;
    changeFormation(currentFormation, newFormation);
    currentFormation = newFormation;
});

const formations = {
    "4-2-3-1": [
        "formation-1f", "formation-3aml", "formation-3amm", "formation-3amr",
        "formation-2dml", "formation-2dmr", "formation-4dll", "formation-4dml",
        "formation-4dmr", "formation-4drr", "formation-gk"
    ],
    "4-3-3": [
        "formation-3fl", "formation-3fm", "formation-3fr", "formation-3ml",
        "formation-3mm", "formation-3mr", "formation-4dll", "formation-4dml",
        "formation-4dmr", "formation-4drr", "formation-gk"
    ],
    "4-4-2": [
        "formation-2fl", "formation-2fr", "formation-4ll", "formation-4ml",
        "formation-4mr", "formation-4rr", "formation-4dll", "formation-4dml",
        "formation-4dmr", "formation-4drr", "formation-gk"
    ]
};

function changeFormation(fromFormation, toFormation) {
    const fromClasses = formations[fromFormation];
    const toClasses = formations[toFormation];

    if (!fromClasses || !toClasses || fromClasses.length !== toClasses.length) {
        console.error("Formasyon d?n???m? hatal?.");
        return;
    }

    fromClasses.forEach((fromClass, index) => {
        const playerDiv = document.querySelector(`.player-div.${fromClass}`);
        if (playerDiv) {
            playerDiv.classList.remove(fromClass);
            playerDiv.classList.add(toClasses[index]);
        }
    });
    setupFieldClickListeners(); // Formasyon de?i?ince olay dinleyicilerini yeniden ayarla
}

document.getElementById("league-select").addEventListener("change", function () {
    const leagueId = this.value;
    if (leagueId) {
        loadTeams(leagueId);
    } else {
        document.getElementById("team-select").innerHTML = '<option value="">Tak?m? se?iniz</option>';
        clearPlayerLists();
    }
});

document.getElementById("team-select").addEventListener("change", function () {
    const teamId = this.value;
    if (teamId) {
        fetchPlayers(teamId);
    } else {
        clearPlayerLists();
    }
});