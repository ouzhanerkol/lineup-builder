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

    const playersTabBtn = document.getElementById('playersTabBtn');
    const rolesTabBtn = document.getElementById('rolesTabBtn');
    const controlPanelPlayersTabBtn = document.querySelector('.control-panel .tab-btn[data-tab="players"]');
    const closeModalButton = document.querySelector('.close-btn');

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
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

    populateFormationSelect();

    setupDragAndDropListeners();

    if (formationSelect) {
        formationSelect.value = Object.keys(FORMATION_SLOTS)[0] || '4-2-3-1';
        applyFormation(formationSelect.value);
        formationSelect.addEventListener('change', (event) => {
            applyFormation(event.target.value);
        });
    } else {
        applyFormation('4-2-3-1');
    }

    updateMiddleSlotLayouts();

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
let selectedSlotForModal = null;
let searchInputListener = null;
let isSubstituteSlotSelected = false;
let currentFormation = "4-2-3-1";
const modal = document.getElementById('playerModal');
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
const formationSelect = document.getElementById('formation-select');
const allPositionSlots = document.querySelectorAll('.position-slot');
let draggedElement = null;

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
    selectedSlotForModal = null;

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
    } else if (selectedSlotForModal) {
        const slotId = selectedSlotForModal.id;
        let positionCode = "UNKNOWN";

        if (slotId === 'position-gk') positionCode = 'GK';
        else if (slotId === 'position-1-1' || slotId === 'position-1-5') positionCode = 'FB';
        else if (slotId === 'position-2-1' || slotId === 'position-2-5') positionCode = 'FB';
        else if (slotId === 'position-3-1' || slotId === 'position-3-5') positionCode = 'FW';
        else if (slotId === 'position-4-1' || slotId === 'position-4-5') positionCode = 'FW';
        else if (slotId === 'position-5-1' || slotId === 'position-5-5') positionCode = 'FW';
        else if (slotId.startsWith('position-1-')) positionCode = 'CB';
        else if (slotId.startsWith('position-2-')) positionCode = 'DM';
        else if (slotId.startsWith('position-3-')) positionCode = 'CM';
        else if (slotId.startsWith('position-4-')) positionCode = 'AM';
        else if (slotId.startsWith('position-5-')) positionCode = 'ST';


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
        const list = section.querySelector('.modal-profile-list');
        if (list) {
            list.classList.add('active-list');
        }
        const toggleIcon = section.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = '-';
        }
    });
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
    }  else {
        console.warn(`No profile section defined for position code: ${positionCode}`);
    }
}

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

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

function selectProfile(profile) {
    console.log("selectProfile called :", selectedSlotForModal ? selectedSlotForModal.id : 'Yok');
    if (selectedSlotForModal) {
        updateSlotContent(selectedSlotForModal, profile.id, profile.name, "assets/images/player-icon.png", 'profile');
        closeModal();
    }
}

function renderPlayerProfiles(profiles) {
    clearProfileLists();

    profiles.forEach(profile => {
        let section;
        // TODO: check this
        const profilePosCode = profile.positionCode ? profile.positionCode.toUpperCase() : "UNKNOWN";

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
    console.log("selectPlayer called :", selectedSlotForModal ? selectedSlotForModal.id : 'Yok');
    if (selectedSlotForModal) {
        updateSlotContent(selectedSlotForModal, player.id, player.name, player.photoUrl, 'player');
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
    currentFormation = this.value;
});

const ZONE_SLOT_MAP = {
    'goalkeeper-zone': ['position-gk'],
    'zone-row-1': ['position-1-1', 'position-1-2', 'position-1-3', 'position-1-4', 'position-1-5'],
    'zone-row-2': ['position-2-1', 'position-2-2', 'position-2-3', 'position-2-4', 'position-2-5'],
    'zone-row-3': ['position-3-1', 'position-3-2', 'position-3-3', 'position-3-4', 'position-3-5'],
    'zone-row-4': ['position-4-1', 'position-4-2', 'position-4-3', 'position-4-4', 'position-4-5'],
    'zone-row-5': ['position-5-1', 'position-5-2', 'position-5-3', 'position-5-4', 'position-5-5']
};

const FORMATION_SLOTS = {
    '4-2-3-1': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-2', 'position-2-4',
        'position-4-1', 'position-4-3', 'position-4-5',
        'position-5-3'
    ],
    '4-3-2-1': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-3',
        'position-3-2', 'position-3-4',
        'position-4-2', 'position-4-4',
        'position-5-3'
    ],
    '4-3-3': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-3',
        'position-3-2', 'position-3-4',
        'position-4-1', 'position-4-5',
        'position-5-3'
    ],
    '4-4-2': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-3-1', 'position-3-2', 'position-3-4', 'position-3-5',
        'position-5-2', 'position-5-4'
    ],
    '4-2-2-2': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-2', 'position-2-4',
        'position-4-2', 'position-4-4',
        'position-5-2', 'position-5-4'
    ],
    '4-2-4': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-2', 'position-2-4',
        'position-4-1', 'position-4-5',
        'position-5-2', 'position-5-4'
    ],
    '5-3-2': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-3', 'position-1-4', 'position-1-5',
        'position-2-3',
        'position-3-2', 'position-3-4',
        'position-5-2', 'position-5-4'
    ],
    '3-4-1-2': [
        'position-gk',
        'position-1-2', 'position-1-3', 'position-1-4',
        'position-2-1', 'position-2-2', 'position-2-4', 'position-2-5',
        'position-4-3',
        'position-5-2', 'position-5-4'
    ],
    '3-4-3': [
        'position-gk',
        'position-1-2', 'position-1-3', 'position-1-4',
        'position-2-1', 'position-2-2', 'position-2-4', 'position-2-5',
        'position-4-1', 'position-4-5',
        'position-5-3'
    ],
    '3-4-2-1': [
        'position-gk',
        'position-1-2', 'position-1-3', 'position-1-4',
        'position-2-1', 'position-2-2', 'position-2-4', 'position-2-5',
        'position-4-2', 'position-4-4',
        'position-5-3'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDropListeners();

    if (formationSelect) {
        applyFormation(formationSelect.value);
        formationSelect.addEventListener('change', (event) => {
            applyFormation(event.target.value);
        });
    } else {
        applyFormation('4-2-3-1');
    }
});

function applyFormation(formationName) {
    const formationSlotsToFill = FORMATION_SLOTS[formationName];

    allPositionSlots.forEach(slot => {
        const slotId = slot.id;
        const hasContent = slot.querySelector('.player-content-wrapper, .profile-content-wrapper');

        if (formationSlotsToFill.includes(slotId)) {
            if (!hasContent) {
                updateSlotContent(slot, null, null, null, 'placeholder');
            }
        } else {
            slot.innerHTML = '';
            slot.classList.remove('has-content');

        }
    });

    updateSlotClickListeners();
    updateDraggableElements();
    updateMiddleSlotLayouts();
}

function populateFormationSelect() {
    if (!formationSelect) {
        console.error("Formation select element not found!");
        return;
    }

    formationSelect.innerHTML = '';

    for (const formationName in FORMATION_SLOTS) {
        if (FORMATION_SLOTS.hasOwnProperty(formationName)) {
            const option = document.createElement('option');
            option.value = formationName;
            option.textContent = formationName;
            formationSelect.appendChild(option);
        }
    }
}

function updateMiddleSlotLayouts() {
    for (const zoneId in ZONE_SLOT_MAP) {
        if (!ZONE_SLOT_MAP.hasOwnProperty(zoneId) || zoneId === 'goalkeeper-zone') {
            continue;
        }

        const pitchZone = document.getElementById(zoneId);
        if (!pitchZone) {
            console.warn(`Pitch zone not found: ${zoneId}`);
            continue;
        }

        const middleSlotId = `${zoneId.replace('zone-row-', 'position-')}-3`;
        const middleSlot = document.getElementById(middleSlotId);

        if (!middleSlot) {
            console.warn(`Middle slot not found for zone: ${zoneId}`);
            continue;
        }

        const isMiddleSlotFull = middleSlot.classList.contains('has-content');

        if (!isMiddleSlotFull) {
            middleSlot.classList.add('is-middle-empty');
            middleSlot.classList.remove('is-middle-full');
            pitchZone.classList.add('middle-slot-empty');
        } else {
            middleSlot.classList.remove('is-middle-empty');
            middleSlot.classList.add('is-middle-full');
            pitchZone.classList.remove('middle-slot-empty');
        }
    }
}

function updateSlotContent(slotElement, id, name, icon, type) {
    slotElement.innerHTML = '';

    const isFieldSlot = slotElement.classList.contains('position-slot');
    const isSubSlot = slotElement.classList.contains('sub-slot');

    if (!isFieldSlot && !isSubSlot) {
        console.error("Slot element is not a field slot or a sub slot:", slotElement);
        return;
    }

    let innerHTMLContent = '';

    if (id && name && icon && (type === 'player' || type === 'profile')) {
        const actualIcon = (type === 'player' && icon) ? icon : "assets/images/player-icon.png";

        const dataAttrId = `data-${type}-id="${id}"`;
        const dataAttrName = `data-${type}-name="${name}"`;
        const dataAttrIcon = `data-${type}-icon="${actualIcon}"`;
        const dataAttrType = `data-item-type="${type}"`;

        let contentWrapperClass, buttonClass, iconClass, nameClass;

        if (isFieldSlot) {
            contentWrapperClass = type === 'player' ? 'field-player-wrapper' : 'field-profile-wrapper';
            buttonClass = 'field-slot-btn';
            iconClass = 'field-slot-icon';
            nameClass = 'field-slot-name';
        } else if (isSubSlot) {
            contentWrapperClass = type === 'player' ? 'sub-player-wrapper' : 'sub-profile-wrapper';
            buttonClass = 'sub-slot-btn';
            iconClass = 'sub-slot-icon';
            nameClass = 'sub-slot-name';
        }

        innerHTMLContent = `
            <div class="${contentWrapperClass}" ${dataAttrId} ${dataAttrName} ${dataAttrIcon} ${dataAttrType} draggable="true">
                <button class="${buttonClass}">
                    <div class="slot-content-inner">
                        <div class="${iconClass}">
                            <img src="${actualIcon}" alt="${name}" loading="lazy">
                        </div>
                        <div class="${nameClass}">
                            <span>${name}</span>
                        </div>
                    </div>
                </button>
            </div>
        `;

        slotElement.classList.add('has-content');
        slotElement.innerHTML = innerHTMLContent;

        const newButton = slotElement.querySelector(`.${buttonClass}`);
        if (newButton) {
            newButton.addEventListener('click', handleSlotClick);
        }
    } else if (type === 'placeholder') {
        const uniqueClipId = `clip${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        let placeholderButtonClass, placeholderContentInnerClass, placeholderIconClass, placeholderAddIconWrapperClass;

        if (isFieldSlot) {
            placeholderButtonClass = 'field-slot-btn';
            placeholderContentInnerClass = 'field-slot-placeholder-content';
            placeholderIconClass = 'field-slot-icon';
            placeholderAddIconWrapperClass = 'field-slot-add-icon-wrapper';
        } else if (isSubSlot) {
            placeholderButtonClass = 'sub-slot-btn';
            placeholderContentInnerClass = 'sub-slot-placeholder-content';
            placeholderIconClass = 'sub-slot-icon';
            placeholderAddIconWrapperClass = 'sub-slot-add-icon-wrapper';
        }

        innerHTMLContent = `
            <div class="${isSubSlot ? 'sub-slot-placeholder' : 'field-slot-placeholder'}" draggable="true">
                <button class="${placeholderButtonClass}">
                    <div class="${placeholderContentInnerClass}">
                        <div class="${placeholderIconClass}">
                            <img src="assets/images/player-icon.png" alt="Add Player Icon" loading="lazy">
                        </div>
                        <div class="${placeholderAddIconWrapperClass}">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#${uniqueClipId})">
                                    <path d="M11 22C16.5228 22 22 16.5228 22 11C22 5.47715 16.5228 0 11 0C5.47715 0 0 5.47715 0 11C0 16.5228 5.47715 22 11 22Z"
                                          fill="#000000"/>
                                    <path d="M17 11H5M11 5V17" stroke="white" stroke-width="2"
                                          stroke-linecap="round"/>
                                </g>
                                <defs>
                                    <clipPath id="${uniqueClipId}">
                                        <rect width="22" height="22" fill="white"/>
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </button>
            </div>
        `;

        slotElement.classList.add('has-content');
        slotElement.innerHTML = innerHTMLContent;

        const newButton = slotElement.querySelector(`.${placeholderButtonClass}`);
        if (newButton) {
            newButton.addEventListener('click', handleSlotClick);
        }
    } else {
        slotElement.innerHTML = '';
        slotElement.classList.remove('has-content');
    }
    updateDraggableElements();
    updateMiddleSlotLayouts();
}

function handleSlotClick(event) {
    const clickedSlot = event.target.closest('.position-slot, .sub-slot');

    if (clickedSlot) {
        selectedSlotForModal = clickedSlot;
        isSubstituteSlotSelected = clickedSlot.classList.contains('sub-slot');
        openModal();
        console.log(`Slot clicked: ${clickedSlot.id || clickedSlot.className}. Is substitute: ${isSubstituteSlotSelected}`);
    }
}

function updateSlotClickListeners() {
    const fieldSlotButtons = document.querySelectorAll('.position-slot .field-slot-btn');
    fieldSlotButtons.forEach(button => {
        button.removeEventListener('click', handleSlotClick);
        button.addEventListener('click', handleSlotClick);
    });

    const subSlotButtons = document.querySelectorAll('.sub-slot .sub-slot-btn');
    subSlotButtons.forEach(button => {
        button.removeEventListener('click', handleSlotClick);
        button.addEventListener('click', handleSlotClick);
    });
}

function setupDragAndDropListeners() {
    allPositionSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
    });

    document.querySelectorAll('.sub-slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
    });
    updateDraggableElements();
}

function updateDraggableElements() {
    document.querySelectorAll('[draggable="true"]').forEach(item => {
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(event) {
    draggedElement = event.target.closest('[draggable="true"]');
    if (!draggedElement) {
        event.preventDefault();
        return;
    }

    const type = draggedElement.dataset.itemType || 'placeholder';
    let id = null, name = null, icon = null;

    if (type === 'player' || type === 'profile') {
        id = draggedElement.dataset[`${type}Id`];
        name = draggedElement.dataset[`${type}Name`];
        icon = draggedElement.dataset[`${type}Icon`];
    }

    const sourceSlotId = draggedElement.closest('.position-slot, .sub-slot')?.id;

    event.dataTransfer.setData('application/json', JSON.stringify({ type, id, name, icon, sourceSlotId }));
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => draggedElement.style.opacity = '0.4', 0);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

async function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const dropZone = event.currentTarget;
    const data = JSON.parse(event.dataTransfer.getData('application/json'));

    if (!data || !data.type) {
        console.error("Data is not valid: ", data);
        return;
    }

    const sourceSlot = document.getElementById(data.sourceSlotId);

    if (!sourceSlot && data.sourceSlotId) {
        console.error("Source slot not found for ID:", data.sourceSlotId);
        if (draggedElement) draggedElement.style.opacity = '1';
        draggedElement = null;
        return;
    }

    if (sourceSlot === dropZone) {
        if (draggedElement) draggedElement.style.opacity = '1';
        draggedElement = null;
        return;
    }

    const targetContentWrapper = dropZone.querySelector(
        '.field-player-wrapper,' +
        ' .field-profile-wrapper,' +
        ' .sub-player-wrapper,' +
        ' .sub-profile-wrapper,' +
        ' .sub-slot-placeholder,' +
        ' .field-slot-placeholder');

    updateSlotContent(dropZone, data.id, data.name, data.icon, data.type);

    if (targetContentWrapper) {
        const targetType = targetContentWrapper.dataset.itemType || 'placeholder';
        let targetId = null, targetName = null, targetIcon = null;

        if (targetType === 'player' || targetType === 'profile') {
            targetId = targetContentWrapper.dataset[`${targetType}Id`];
            targetName = targetContentWrapper.dataset[`${targetType}Name`];
            targetIcon = targetContentWrapper.dataset[`${targetType}Icon`];
        }

        if (sourceSlot) {
            updateSlotContent(sourceSlot, targetId, targetName, targetIcon, targetType);
        } else {

        }
    } else {
        sourceSlot.innerHTML = '';
        sourceSlot.classList.remove('has-content');
    }

    updateDraggableElements();
    if (draggedElement) draggedElement.style.opacity = '1';
    draggedElement = null;
    updateMiddleSlotLayouts();
}

function handleDragEnd() {
    if (draggedElement) {
        draggedElement.style.opacity = '1';
        draggedElement = null;
    }
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