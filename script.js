import {
    BASE_URL,
    AppState,
    setSelectedSlotForModal,
    setSearchInputListener,
    setIsBenchSlotSelected,
    setCurrentFormation,
    setDraggedElement,
    ZONE_SLOT_MAP,
    FORMATION_SLOTS,
    addIconSvgPaths
} from './js/constants.js';
import {
    modal, playerSearchInput, formationSelect, allPositionSlots,
    playerListSection,
    playerRolesSection,
    goalkeepersSection,
    defendersSection,
    midfieldersSection,
    forwardsSection,
    profileGoalkeepersSection,
    profileCenterBacksSection,
    profileFullBacksSection,
    profileMidfieldersSection,
    profileWingersSection,
    profileForwardsSection,
    shareModal, playerSearchResults
} from './js/domElements.js';
import { setupEventListeners } from './js/eventListeners.js';
import { closeShareModal } from './js/shareUtils.js';

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();

    populateFormationSelect();
    setupDragAndDropListeners();

    if (formationSelect) {
        formationSelect.value = Object.keys(FORMATION_SLOTS)[0] || '4-2-3-1';
        applyFormation(formationSelect.value);
    } else {
        applyFormation(AppState.currentFormation);
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

export function openModal() {
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

export function closeModal() {
    modal.style.display = "none";
    setSelectedSlotForModal(null);

    playerListSection.style.display = "none";
    playerRolesSection.style.display = "none";

    if (AppState.searchInputListener) {
        playerSearchInput.removeEventListener('input', AppState.searchInputListener);
        setSearchInputListener(null);
    }
}

export function showPlayersTab() {
    playerListSection.style.display = 'block';
    playerRolesSection.style.display = 'none';
    document.getElementById('playersTabBtn').classList.add('active');
    document.getElementById('rolesTabBtn').classList.remove('active');

    document.querySelectorAll('#playerListSection .modal-player-category').forEach(section => {
        section.style.display = 'block';
    });
}

export function showRolesTab() {
    playerListSection.style.display = 'none';
    playerRolesSection.style.display = 'grid';
    document.getElementById('playersTabBtn').classList.remove('active');
    document.getElementById('rolesTabBtn').classList.add('active');

    clearProfileLists();

    if (AppState.isBenchSlotSelected) {
        fetchAllPlayerProfiles();
        showAllProfilePositionSections();
    } else if (AppState.selectedSlotForModal) {
        const slotId = AppState.selectedSlotForModal.id;
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

export function showAllProfilePositionSections() {
    document.querySelectorAll('#playerRolesSection .modal-profile-category').forEach(section => {
        section.style.display = "block";
        const list = section.querySelector('.modal-profile-list');
        if (list) {
            list.classList.remove('active-list');
        }
        const toggleIcon = section.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = '+';
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

    if (event.target === shareModal) {
        closeShareModal();
    }
});

async function fetchPlayerProfilesByPosition(positionCode) {
    try {
        const response = await fetch(`${BASE_URL}/api/player-profiles/search/${positionCode}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const profiles = await response.json();
        renderPlayerProfiles(profiles);
    } catch (error) {
        console.error("Error (roles):", error);
    }
}

export async function fetchAllPlayerProfiles() {
    try {
        const response = await fetch(`${BASE_URL}/api/player-profiles`);
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
    console.log("selectProfile called :", AppState.selectedSlotForModal ? AppState.selectedSlotForModal.id : 'Yok');
    if (AppState.selectedSlotForModal) {
        updateSlotContent(AppState.selectedSlotForModal, profile.id, profile.name, "assets/images/placeholder-icon.png", 'profile');
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
                        <img src="assets/images/placeholder-icon.png" alt="Profile Icon" width="50" height="50">
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

export async function loadLeagues() {
    try {
        const response = await fetch(`${BASE_URL}/api/leagues`);
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

export async function loadTeams(leagueId) {
    try {
        const response = await fetch(`${BASE_URL}/api/teams/search/${leagueId}`);
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
            option.dataset.logoUrl = team.logoUrl || 'assets/images/default-team-logo.png';
            teamSelect.appendChild(option);
        });
        return teams;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

export async function fetchPlayers(teamId) {
    try {
        const response = await fetch(`${BASE_URL}/api/players/search/${teamId}`);
        if (!response.ok) throw new Error("Didn't fetch players");
        const players = await response.json();
        renderPlayers(players);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

export function clearPlayerLists() {
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
    console.log("selectPlayer called :", AppState.selectedSlotForModal ? AppState.selectedSlotForModal.id : 'Yok');
    if (AppState.selectedSlotForModal) {
        updateSlotContent(AppState.selectedSlotForModal, player.id, player.name, player.photoUrl, 'player');
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
        const response = await fetch(`${BASE_URL}/api/players/search?query=${searchTerm}`);
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
    if (AppState.searchInputListener) {
        playerSearchInput.removeEventListener('input', AppState.searchInputListener);
    }

    setSearchInputListener(function () {
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
    });
    playerSearchInput.addEventListener('input', AppState.searchInputListener);
}

document.getElementById("formation-select").addEventListener("change", function () {
    setCurrentFormation(this.value);
});

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

export function applyFormation(formationName) {
    const formationSlotsToFill = FORMATION_SLOTS[formationName];

    const customOption = formationSelect.querySelector('option[value="Custom"]');
    if (customOption) {
        customOption.remove();
    }

    formationSelect.value = formationName;
    setCurrentFormation(formationName);

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

export function populateFormationSelect() {
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

function setFormationToCustom() {
    if (formationSelect) {
        formationSelect.value = 'Custom';
        let customOption = formationSelect.querySelector('option[value="Custom"]');
        if (!customOption) {
            customOption = document.createElement('option');
            customOption.value = 'Custom';
            customOption.textContent = 'Custom';
            formationSelect.prepend(customOption);
        }
        formationSelect.value = 'Custom';
    }
}

export function updateMiddleSlotLayouts() {
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

export function updateSlotContent(slotElement, id, name, icon, type) {
    slotElement.innerHTML = '';

    const isFieldSlot = slotElement.classList.contains('position-slot');
    const isBenchSlot = slotElement.classList.contains('bench-slot');

    if (!isFieldSlot && !isBenchSlot) {
        console.error("Slot element is not a field slot or a bench slot:", slotElement);
        return;
    }

    let innerHTMLContent = '';

    if (id && name && icon && (type === 'player' || type === 'profile')) {
        const actualIcon = (type === 'player' && icon) ? icon : "assets/images/placeholder-icon.png";

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
        } else if (isBenchSlot) {
            contentWrapperClass = type === 'player' ? 'bench-player-wrapper' : 'bench-profile-wrapper';
            buttonClass = 'bench-slot-btn';
            iconClass = 'bench-slot-icon';
            nameClass = 'bench-slot-name';
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
        } else if (isBenchSlot) {
            placeholderButtonClass = 'bench-slot-btn';
            placeholderContentInnerClass = 'bench-slot-placeholder-content';
            placeholderIconClass = 'bench-slot-icon';
            placeholderAddIconWrapperClass = 'bench-slot-add-icon-wrapper';
        }

        innerHTMLContent = `
            <div class="${isBenchSlot ? 'bench-slot-placeholder' : 'field-slot-placeholder'}" draggable="true">
                <button class="${placeholderButtonClass}">
                    <div class="${placeholderContentInnerClass}">
                        <div class="${placeholderIconClass}">
                            <img src="assets/images/placeholder-icon.png" alt="Add Player Icon" loading="lazy">
                        </div>
                        <div class="${placeholderAddIconWrapperClass}">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#${uniqueClipId})">
                                    <path d="${addIconSvgPaths.M}"
                                          fill="#000000"/>
                                    <path d="${addIconSvgPaths.line}" stroke="white" stroke-width="2"
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
    const clickedSlot = event.target.closest('.position-slot, .bench-slot');

    if (clickedSlot) {
        setSelectedSlotForModal(clickedSlot);
        setIsBenchSlotSelected(clickedSlot.classList.contains('bench-slot'));
        openModal();
        console.log(`Slot clicked: ${clickedSlot.id || clickedSlot.className}. Is bench : ${AppState.isBenchSlotSelected}`);
    }
}

export function updateSlotClickListeners() {
    const fieldSlotButtons = document.querySelectorAll('.position-slot .field-slot-btn');
    fieldSlotButtons.forEach(button => {
        button.removeEventListener('click', handleSlotClick);
        button.addEventListener('click', handleSlotClick);
    });

    const benchSlotButtons = document.querySelectorAll('.bench-slot .bench-slot-btn');
    benchSlotButtons.forEach(button => {
        button.removeEventListener('click', handleSlotClick);
        button.addEventListener('click', handleSlotClick);
    });
}

export function setupDragAndDropListeners() {
    allPositionSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
    });

    document.querySelectorAll('.bench-slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
    });
    updateDraggableElements();
}

export function updateDraggableElements() {
    document.querySelectorAll('[draggable="true"]').forEach(item => {
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(event) {
    setDraggedElement(event.target.closest('[draggable="true"]'));
    if (!AppState.draggedElement) {
        event.preventDefault();
        return;
    }

    const type = AppState.draggedElement.dataset.itemType || 'placeholder';
    let id = null, name = null, icon = null;

    if (type === 'player' || type === 'profile') {
        id = AppState.draggedElement.dataset[`${type}Id`];
        name = AppState.draggedElement.dataset[`${type}Name`];
        icon = AppState.draggedElement.dataset[`${type}Icon`];
    }

    const sourceSlotId = AppState.draggedElement.closest('.position-slot, .bench-slot')?.id;

    event.dataTransfer.setData('application/json', JSON.stringify({ type, id, name, icon, sourceSlotId }));
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => AppState.draggedElement.style.opacity = '0.4', 0);
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
        if (AppState.draggedElement) AppState.draggedElement.style.opacity = '1';
        setDraggedElement(null);
        return;
    }

    if (sourceSlot === dropZone) {
        if (AppState.draggedElement) AppState.draggedElement.style.opacity = '1';
        setDraggedElement(null);
        return;
    }

    const targetContentWrapper = dropZone.querySelector(
        '.field-player-wrapper,' +
        ' .field-profile-wrapper,' +
        ' .bench-player-wrapper,' +
        ' .bench-profile-wrapper,' +
        ' .bench-slot-placeholder,' +
        ' .field-slot-placeholder');

    if (data.type === 'profile') {
        updateSlotContent(dropZone, null, null, null, 'placeholder');
    } else {
        updateSlotContent(dropZone, data.id, data.name, data.icon, data.type);
    }

    if (targetContentWrapper) {
        const targetType = targetContentWrapper.dataset.itemType || 'placeholder';
        let targetId = null, targetName = null, targetIcon = null;
        if (targetType === 'profile') {
            updateSlotContent(sourceSlot, null, null, null, 'placeholder');
        } else {
            if (targetType === 'player') {
                targetId = targetContentWrapper.dataset[`${targetType}Id`];
                targetName = targetContentWrapper.dataset[`${targetType}Name`];
                targetIcon = targetContentWrapper.dataset[`${targetType}Icon`];
            }

            if (sourceSlot) {
                updateSlotContent(sourceSlot, targetId, targetName, targetIcon, targetType);
            } else {

            }
        }
    } else {
        sourceSlot.innerHTML = '';
        sourceSlot.classList.remove('has-content');
    }

    updateDraggableElements();
    if (AppState.draggedElement) AppState.draggedElement.style.opacity = '1';
    setDraggedElement(null);
    updateMiddleSlotLayouts();
    setFormationToCustom();
}

function handleDragEnd() {
    if (AppState.draggedElement) {
        AppState.draggedElement.style.opacity = '1';
        setDraggedElement(null);
    }
}