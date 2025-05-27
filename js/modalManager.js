import {
    defendersSection, forwardsSection,
    goalkeepersSection, midfieldersSection,
    modal, playerListSection, playerRolesSection, playerSearchInput, playerSearchResults, playersTabBtn,
    profileCenterBacksSection, profileForwardsSection,
    profileFullBacksSection,
    profileGoalkeepersSection,
    profileMidfieldersSection, profileWingersSection, rolesTabBtn
} from "./domElements.js";
import {
    AppState,
    setIsBenchSlotSelected,
    setSearchInputListener,
    setSelectedSlotForModal, SLOT_POSITION_MAP
} from "./constants.js";
import {displaySearchResults, updateSlotContent} from "../script.js";
import {fetchAllPlayerProfiles, fetchPlayerProfilesByPosition, fetchSearchResults} from './apiService.js';

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

    playersTabBtn.classList.add('active');
    rolesTabBtn.classList.remove('active');

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
    playersTabBtn.classList.add('active');
    rolesTabBtn.classList.remove('active');

    document.querySelectorAll('#playerListSection .modal-player-category').forEach(section => {
        section.style.display = 'block';
    });
}

export function showRolesTab() {
    playerListSection.style.display = 'none';
    playerRolesSection.style.display = 'grid';
    playersTabBtn.classList.remove('active');
    rolesTabBtn.classList.add('active');

    clearProfileLists();

    if (AppState.isBenchSlotSelected) {
        fetchAllPlayerProfiles();
        showAllProfilePositionSections();
    } else if (AppState.selectedSlotForModal) {
        const slotId = AppState.selectedSlotForModal.id;
        const positionCode = SLOT_POSITION_MAP[slotId] || 'UNKNOWN';

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

export function setupPlayerSearch() {
    if (AppState.searchInputListener) {
        playerSearchInput.removeEventListener('input', AppState.searchInputListener);
    }

    setSearchInputListener(async function () {
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

export function hideAllProfilePositionSections() {
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

export function showProfilePositionSection(positionCode) {
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

export function handleSlotClick(event) {
    const clickedSlot = event.target.closest('.position-slot, .bench-slot');

    if (clickedSlot) {
        setSelectedSlotForModal(clickedSlot);
        setIsBenchSlotSelected(clickedSlot.classList.contains('bench-slot'));
        openModal();
        console.log(`Slot clicked: ${clickedSlot.id || clickedSlot.className}. Is bench : ${AppState.isBenchSlotSelected}`);
    }
}

export function selectPlayer(player) {
    console.log("selectPlayer called :", AppState.selectedSlotForModal ? AppState.selectedSlotForModal.id : 'Yok');
    if (AppState.selectedSlotForModal) {
        updateSlotContent(AppState.selectedSlotForModal, player.id, player.name, player.photoUrl, 'player');
        closeModal();
    }
}

export function selectProfile(profile) {
    console.log("selectProfile called :", AppState.selectedSlotForModal ? AppState.selectedSlotForModal.id : 'Yok');
    if (AppState.selectedSlotForModal) {
        updateSlotContent(AppState.selectedSlotForModal, profile.id, profile.name, "assets/images/placeholder-icon.png", 'profile');
        closeModal();
    }
}

export function clearPlayerLists() {
    goalkeepersSection.innerHTML = "";
    defendersSection.innerHTML = "";
    midfieldersSection.innerHTML = "";
    forwardsSection.innerHTML = "";
}

export function clearProfileLists() {
    profileGoalkeepersSection.innerHTML = "";
    profileCenterBacksSection.innerHTML = "";
    profileFullBacksSection.innerHTML = "";
    profileMidfieldersSection.innerHTML = "";
    profileWingersSection.innerHTML = "";
    profileForwardsSection.innerHTML = "";
}