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

    // Modal sekme olay dinleyicileri
    const playersTabBtn = document.getElementById('playersTabBtn');
    const rolesTabBtn = document.getElementById('rolesTabBtn');

    if (playersTabBtn) {
        playersTabBtn.addEventListener('click', showPlayersTab);
    }
    if (rolesTabBtn) {
        rolesTabBtn.addEventListener('click', showRolesTab);
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
const modal = document.getElementById('playerModal');
const closeModalButton = document.querySelector('.close-btn');
const playerRolesSection = document.getElementById("playerRolesSection");
const goalkeepersSection = document.querySelector(".position-list.goalkeepers");
const defendersSection = document.querySelector(".position-list.defenders");
const midfieldersSection = document.querySelector(".position-list.midfielders");
const forwardsSection = document.querySelector(".position-list.forwards");

function openModal() {
    modal.style.display = "block";
    playerRolesSection.style.display = "none";
    goalkeepersSection.style.display = "grid";
    defendersSection.style.display = "grid";
    midfieldersSection.style.display = "grid";
    forwardsSection.style.display = "grid";
}

function closeModal() {
    modal.style.display = "none";
    selectedFieldSlot = null;
    playerRolesSection.style.display = "none";
    goalkeepersSection.style.display = "none";
    defendersSection.style.display = "none";
    midfieldersSection.style.display = "none";
    forwardsSection.style.display = "none";
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
    document.getElementById('playerRolesSection').style.display = 'flex';
    document.getElementById('playersTabBtn').classList.remove('active');
    document.getElementById('rolesTabBtn').classList.add('active');

    // Profilleri ?ek ve render et
    if (selectedFieldSlot) {
        const formationClass = Array.from(selectedFieldSlot.classList).find(cls => cls.startsWith('formation-'));
        const positionCode = mapFormationToPositionCode(formationClass);
        fetchPlayerProfilesByPosition(positionCode);
    }
}

// Olay dinleyicilerini DOM y?klendi?inde ba?la
document.addEventListener('DOMContentLoaded', () => {
    const playersTabBtn = document.getElementById('playersTabBtn');
    const rolesTabBtn = document.getElementById('rolesTabBtn');

    if (playersTabBtn) {
        playersTabBtn.addEventListener('click', showPlayersTab);
    }
    if (rolesTabBtn) {
        rolesTabBtn.addEventListener('click', showRolesTab);
    }
});

// Modal kapatma olay dinleyicileri (tek bir yerde tan?mland?)
closeModalButton.addEventListener('click', closeModal);
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

/*
function setupFieldClickListeners() {
    document.querySelectorAll('.player-select-btn').forEach(button => {
        button.onclick = function () {
            selectedFieldSlot = this.closest('.player-div');
            const formationClass = Array.from(selectedFieldSlot.classList).find(cls => cls.startsWith('formation-'));
            const positionCode = mapFormationToPositionCode(formationClass);
            fetchPlayerProfilesByPosition(positionCode);
            openModal();
        };
    });
}*/

function setupFieldClickListeners() {
    document.querySelectorAll('.player-select-btn').forEach(button => {
        button.onclick = function () {
            selectedFieldSlot = this.closest('.player-div');
            openModal();
            // Modal a??ld???nda varsay?lan olarak Oyuncular sekmesini g?ster
            showPlayersTab();
        };
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

function renderPlayerProfiles(profiles) {
    playerRolesSection.innerHTML = "";
    playerRolesSection.style.display = "flex";

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

document.getElementById("rolesTabBtn").addEventListener("click", () => {
    goalkeepersSection.style.display = "none";
    defendersSection.style.display = "none";
    midfieldersSection.style.display = "none";
    forwardsSection.style.display = "none";
    playerRolesSection.style.display = "flex";
});

document.getElementById("formation-select").addEventListener("change", function () {
    const newFormation = this.value;
    changeFormation(currentFormation, newFormation);
    currentFormation = newFormation;
});

let currentFormation = "4-2-3-1";
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