document.addEventListener('DOMContentLoaded', function () {
    const controlPanelTabBtns = document.querySelectorAll('.tab-header .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-panel');

    controlPanelTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            controlPanelTabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const targetPanel = document.getElementById(this.dataset.tab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            } else {
                console.error("Target panel not found:", this.dataset.tab);
            }
        });
    });

    const profileSectionHeaders = document.querySelectorAll('.profile-section-header');
    profileSectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const targetList = document.getElementById(targetId);
            const toggleIcon = this.querySelector('.toggle-icon');

            if (targetList) {
                // Show/hide list
                targetList.classList.toggle('active-list');

                // change icon
                if (targetList.classList.contains('active-list')) {
                    toggleIcon.textContent = '-';
                } else {
                    toggleIcon.textContent = '+';
                }
            }
        });
    });

    document.querySelectorAll('.modal-profile-category .toggle-icon').forEach(icon => {
        if (icon.closest('.modal-profile-category')
            .querySelector('.modal-profile-list').classList.contains('active-list')) {
            icon.textContent = '-';
        } else {
            icon.textContent = '+';
        }
    });

    const formationSelect = document.getElementById("formation-select");

    const defaultFormation = "4-2-3-1";
    changeFormation(null, defaultFormation);
    currentFormation = defaultFormation;

    formationSelect.value = defaultFormation;

    const playersTabBtn = document.getElementById('playersTabBtn');
    const rolesTabBtn = document.getElementById('rolesTabBtn');
    const controlPanelPlayersTabBtn = document.querySelector('.control-panel .tab-btn[data-tab="players"]');

    if (playersTabBtn) {
        playersTabBtn.addEventListener('click', showPlayersTab);
    }
    if (rolesTabBtn) {
        rolesTabBtn.addEventListener('click', showRolesTab);
    }
    if (controlPanelPlayersTabBtn) {
        controlPanelPlayersTabBtn.addEventListener('click', () => {
            if (modal.style.display === "block" && rolesTabBtn.classList.contains('active')) {
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
                    console.warn("Team data is not found or empty.");
                }
            });
        }
    });
});

// Global variables
let selectedFieldSlot = null;
let searchInputListener = null;
let isSubstituteSlotSelected = false;
let currentFormation = "4-2-3-1";
const modal = document.getElementById('playerModal');
const closeModalButton = document.querySelector('.close-btn');
const playerListSection = document.getElementById('playerListSection');
const playerRolesSection = document.getElementById("playerRolesSection");
const goalkeepersSection = document.querySelector(".modal-player-list.goalkeepers");
const defendersSection = document.querySelector(".modal-player-list.defenders");
const midfieldersSection = document.querySelector(".modal-player-list.midfielders");
const forwardsSection = document.querySelector(".modal-player-list.forwards");
const playerSearchInput = document.getElementById('playerSearchInput');
const playerSearchResults = document.getElementById('playerSearchResults');
const profileGoalkeepersSection = document.querySelector(".modal-profile-list.profile-goalkeepers");
const profileCenterBacksSection = document.querySelector(".modal-profile-list.profile-center-backs");
const profileFullBacksSection = document.querySelector(".modal-profile-list.profile-full-backs");
const profileMidfieldersSection = document.querySelector(".modal-profile-list.profile-midfielders");
const profileWingersSection = document.querySelector(".modal-profile-list.profile-wingers");
const profileForwardsSection = document.querySelector(".modal-profile-list.profile-forwards");

function openModal() {
    modal.style.display = "flex";
    playerRolesSection.style.display = "none";
    playerListSection.style.display = "block";

    goalkeepersSection.parentElement.style.display = "block";
    defendersSection.parentElement.style.display = "block";
    midfieldersSection.parentElement.style.display = "block";
    forwardsSection.parentElement.style.display = "block";

    playerSearchInput.value = '';
    playerSearchResults.style.display = 'none';

    document.getElementById('playersTabBtn').classList.add('active');
    document.getElementById('rolesTabBtn').classList.remove('active');

    setupPlayerSearch();
}

function closeModal() {
    modal.style.display = "none";
    selectedFieldSlot = null;

    playerListSection.style.display = "none";
    playerRolesSection.style.display = "none";

    if (searchInputListener) {
        playerSearchInput.removeEventListener('input', searchInputListener);
        searchInputListener = null;
    }
}

function showPlayersTab() {
    playerListSection.style.display = 'block';
    playerRolesSection.style.display = 'none';
    document.getElementById('playersTabBtn').classList.add('active');
    document.getElementById('rolesTabBtn').classList.remove('active');

    document.querySelectorAll('#playerListSection .modal-player-category').forEach(section => {
        section.style.display = 'block';
    });
}

function showRolesTab() {
    playerListSection.style.display = 'none';
    playerRolesSection.style.display = 'grid';
    document.getElementById('playersTabBtn').classList.remove('active');
    document.getElementById('rolesTabBtn').classList.add('active');

    clearProfileLists();

    if (isSubstituteSlotSelected) {
        fetchAllPlayerProfiles();
        showAllProfilePositionSections();
    } else if (selectedFieldSlot) {
        const formationClass = Array.from(selectedFieldSlot.classList).find(cls => cls.startsWith('formation-'));
        const positionCode = mapFormationToPositionCode(formationClass);

        hideAllProfilePositionSections();

        fetchPlayerProfilesByPosition(positionCode)
            .then(() => {
                showProfilePositionSection(positionCode);
            });
    } else {
        clearProfileLists();
        hideAllProfilePositionSections();
    }
}

function hideAllProfilePositionSections() {
    document.querySelectorAll('#playerRolesSection .modal-profile-category').forEach(section => {
        section.style.display = "none";
    });

    document.querySelectorAll('.modal-profile-list').forEach(list => {
        list.classList.remove('active-list');
    });
    document.querySelectorAll('.profile-section-header .toggle-icon').forEach(icon => {
        icon.textContent = '+';
    });
}

function showAllProfilePositionSections() {
    document.querySelectorAll('#playerRolesSection .modal-profile-category').forEach(section => {
        section.style.display = "block";
    });
    // TODO: check this section
    const list = section.querySelector('.modal-profile-list');
    if (list) {
        list.classList.add('active-list');
    }

    const toggleIcon = section.querySelector('.toggle-icon');
    if (toggleIcon) {
        toggleIcon.textContent = '-';
    }
}

function showProfilePositionSection(positionCode) {
    let sectionToShow;
    const posCode = positionCode.toUpperCase();

    if (posCode === "GK") {
        sectionToShow = profileGoalkeepersSection.closest('.modal-profile-category');
    } else if (posCode === "CB") {
        sectionToShow = profileCenterBacksSection.closest('.modal-profile-category');
    } else if (posCode === "FB") {
        sectionToShow = profileFullBacksSection.closest('.modal-profile-category');
    } else if (posCode === "DM" || posCode === "CM" || posCode === "AM") {
        sectionToShow = profileMidfieldersSection.closest('.modal-profile-category');
    } else if (posCode === "FW") {
        sectionToShow = profileWingersSection.closest('.modal-profile-category');
    } else if (posCode === "ST") {
        sectionToShow = profileForwardsSection.closest('.modal-profile-category');
    }

    if (sectionToShow) {
        sectionToShow.style.display = "block";
        const list = sectionToShow.querySelector('.modal-profile-list');
        if (list) {
            list.classList.add('active-list');
        }
        const toggleIcon = sectionToShow.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = '-';
        }
    }
}

closeModalButton.addEventListener('click', closeModal);

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

function handleFieldPlayerClick(event) {
    selectedFieldSlot = event.target.closest('.field-slot');
    isSubstituteSlotSelected = false;
    openModal();
    showPlayersTab();
}

function handleSubstitutePlayerClick(event) {
    selectedFieldSlot = event.target.closest('.sub-slot');
    isSubstituteSlotSelected = true;
    openModal();
    showPlayersTab();
}

function setupFieldClickListeners() {
    // Event listener for field players
    const fieldPlayerButtons = document.querySelectorAll('.field-slot .field-slot-btn');
    fieldPlayerButtons.forEach(button => {
        button.removeEventListener('click', handleFieldPlayerClick);
        button.addEventListener('click', handleFieldPlayerClick);
    });

    // Event listener for sub players
    const substituteButtons = document.querySelectorAll('.sub-slot .sub-slot-btn');
    substituteButtons.forEach(button => {
        button.removeEventListener('click', handleSubstitutePlayerClick);
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
        "formation-3mr": "CM",
        "formation-4ll": "FW",
        "formation-4ml": "CM",
        "formation-4mr": "CM",
        "formation-4rr": "FW"
    };
    return map[formationClass] || "UNKNOWN";
}

async function fetchPlayerProfilesByPosition(positionCode) {
    try {
        const response = await fetch(`http://localhost:8080/api/player-profiles/search/${positionCode}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const profiles = await response.json();
        renderPlayerProfiles(profiles);
    } catch (error) {
        console.error("Error (roles):", error);
    }
}

async function fetchAllPlayerProfiles() {
    try {
        const response = await fetch(`http://localhost:8080/api/player-profiles`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const profiles = await response.json();
        renderPlayerProfiles(profiles);
    } catch (error) {
        console.error("Error (roles):", error);
    }
}

function renderPlayerProfiles(profiles) {
    clearProfileLists();

    profiles.forEach(profile => {
        let section;
        // TODO: check this
        const profilePosCode = profile.positionCode.toUpperCase();

        if (profilePosCode === "GK") {
            section = profileGoalkeepersSection;
        } else if (profilePosCode === "CB") {
            section = profileCenterBacksSection;
        } else if (profilePosCode === "FB") {
            section = profileFullBacksSection;
        } else if (profilePosCode === "DM" || profilePosCode === "CM" || profilePosCode === "AM") {
            section = profileMidfieldersSection;
        } else if (profilePosCode === "FW") {
            section = profileWingersSection;
        } else if (profilePosCode === "ST") {
            section = profileForwardsSection;
        }

        if (section) {
            const div = document.createElement("div");
            div.className = "modal-player-item";
            div.innerHTML = `
                <button class="modal-player-item-btn profile-btn">
                    <div class="modal-player-item-icon">
                        <img src="assets/images/player-icon.png" alt="Profile Icon" width="50" height="50">
                    </div>
                    <div class="modal-player-item-name">
                        <span>${profile.name}</span>
                    </div>
                </button>
            `;
            div.querySelector(".modal-player-item-btn").addEventListener("click", () => {
                selectProfile(profile);
            });
            section.appendChild(div);
        } else {
            console.warn(`Section is not found for profile: ${profile.name} (Position Code: ${profile.positionCode})`);
        }
    });
}

async function loadLeagues() {
    try {
        const response = await fetch("http://localhost:8080/api/leagues");
        if (!response.ok) {
            const errorText = await response.text();
            console.error("HTTP error when fetching leagues:", response.status, errorText);
            return [];
        }
        const leagues = await response.json();
        const leagueSelect = document.getElementById("league-select");
        leagues.forEach(league => {
            const option = document.createElement("option");
            option.value = league.id;
            option.textContent = league.name;
            leagueSelect.appendChild(option);
        });
        return leagues;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

async function loadTeams(leagueId) {
    try {
        const response = await fetch(`http://localhost:8080/api/teams/search/${leagueId}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("HTTP error when fetching teams:", response.status, errorText);
            return [];
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
        return teams;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

async function fetchPlayers(teamId) {
    try {
        const response = await fetch(`http://localhost:8080/api/players/search/${teamId}`);
        if (!response.ok) throw new Error("Didn't fetch players");
        const players = await response.json();
        renderPlayers(players);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

function clearPlayerLists() {
    goalkeepersSection.innerHTML = "";
    defendersSection.innerHTML = "";
    midfieldersSection.innerHTML = "";
    forwardsSection.innerHTML = "";
}

function clearProfileLists() {
    profileGoalkeepersSection.innerHTML = "";
    profileCenterBacksSection.innerHTML = "";
    profileFullBacksSection.innerHTML = "";
    profileMidfieldersSection.innerHTML = "";
    profileWingersSection.innerHTML = "";
    profileForwardsSection.innerHTML = "";
}

function selectPlayer(player) {
    if (selectedFieldSlot) {
        const content = `
            <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-player-content-wrapper' : 'sub-player-content-wrapper'}">
                <button class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-btn' : 'sub-slot-btn'}">
                    <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-placeholder' : 'sub-slot-placeholder'}">
                        <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-icon' : 'sub-slot-icon'}">
                            <img src="${player.photoUrl}" alt="${player.name}" width="50" height="50" loading="lazy">
                        </div>
                        <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-name' : 'sub-slot-name'}">
                            <span>${player.name}</span>
                        </div>
                    </div>
                </button>
            </div>
        `;
        updateFieldSlot(content);
        closeModal();
    }
}

function selectProfile(profile) {
    if (selectedFieldSlot) {
        const content = `
            <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-profile-content-wrapper' : 'sub-profile-content-wrapper'}">
                <button class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-btn' : 'sub-slot-btn'}">
                    <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-placeholder' : 'sub-slot-placeholder'}">
                        <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-icon' : 'sub-slot-icon'}">
                            <img src="assets/images/player-icon.png" alt="Profile Icon" width="50" height="50">
                        </div>
                        <div class="${selectedFieldSlot.classList.contains('field-slot') ? 'field-slot-name' : 'sub-slot-name'}">
                            <span>${profile.name}</span>
                        </div>
                    </div>
                </button>
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
            container.className = "modal-player-item";
            container.innerHTML = `
                <button class="modal-player-item-btn player-item-btn">
                    <div class="modal-player-item-icon">
                        <img src="${player.photoUrl}" alt="${player.name}" width="50" height="50" loading="lazy">
                    </div>
                    <div class="modal-player-item-name">
                        <span>${player.name}</span>
                    </div>
                </button>
            `;
            container.querySelector(".modal-player-item-btn").addEventListener("click", () => {
                selectPlayer(player);
            });
            section.appendChild(container);
        }
    });
}

function updateFieldSlot(content) {
    if (selectedFieldSlot) {
        selectedFieldSlot.innerHTML = content;
        const newButton = selectedFieldSlot.querySelector('.field-slot-btn, .sub-slot-btn');
        if (newButton) {
            newButton.removeEventListener('click', handleFieldPlayerClick);
            newButton.removeEventListener('click', handleSubstitutePlayerClick);

            if (selectedFieldSlot.classList.contains('field-slot')) {
                newButton.addEventListener('click', handleFieldPlayerClick);
            } else if (selectedFieldSlot.classList.contains('sub-slot')) {
                newButton.addEventListener('click', handleSubstitutePlayerClick);
            }
        }
    }
}

async function fetchSearchResults(searchTerm) {
    try {
        const response = await fetch(`http://localhost:8080/api/players/search?query=${searchTerm}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error when fetching search result:", error);
        return null;
    }
}

function displaySearchResults(results) {
    playerSearchResults.innerHTML = '';
    playerSearchResults.style.display = 'none';

    if (results && results.length > 0) {
        playerSearchResults.style.display = 'block';
        results.forEach(player => {
            const resultItem = createSearchResultItem(player);
            playerSearchResults.appendChild(resultItem);
        });
    } else {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.classList.add('no-results');
        noResultsDiv.textContent = 'Did not find player.';
        playerSearchResults.appendChild(noResultsDiv);
        playerSearchResults.style.display = 'block';
    }
}

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
    if (searchInputListener) {
        playerSearchInput.removeEventListener('input', searchInputListener);
    }

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
    const fromClasses = fromFormation ? formations[fromFormation] : [];
    const toClasses = formations[toFormation];

    if (!toClasses) {
        console.error("Not find formation:", toFormation);
        return;
    }

    if (fromClasses.length > 0) {
        fromClasses.forEach((fromClass, index) => {
            const playerDiv = document.querySelector(`.field-slot.${fromClass}`);
            if (playerDiv) {
                playerDiv.classList.remove(fromClass);
                playerDiv.classList.add(toClasses[index]);
            }
        });
    } else {
        toClasses.forEach((toClass, index) => {
            const playerDiv = document.querySelectorAll('.field-slot')[index];
            if (playerDiv) {
                playerDiv.classList.add(toClass);
            }
        });
    }
    setupFieldClickListeners();
}

document.getElementById("league-select").addEventListener("change", function () {
    const leagueId = this.value;
    if (leagueId) {
        loadTeams(leagueId);
    } else {
        document.getElementById("team-select").innerHTML = '';
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