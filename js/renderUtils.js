import {
    defendersSection,
    forwardsSection,
    goalkeepersSection,
    midfieldersSection,
    playerSearchInput,
    playerSearchResults,
    profileCenterBacksSection, profileForwardsSection,
    profileFullBacksSection,
    profileGoalkeepersSection,
    profileMidfieldersSection, profileWingersSection
} from "./domElements.js";
import {clearPlayerLists, clearProfileLists, selectPlayer, selectProfile} from "./modalManager.js";

export function renderPlayers(players) {
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

export function renderPlayerProfiles(profiles) {
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

export function displaySearchResults(results) {
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

export function createSearchResultItem(player) {
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