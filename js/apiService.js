import {BASE_URL} from "./constants.js";
import {
    defendersSection,
    forwardsSection,
    goalkeepersSection, leagueSelect,
    midfieldersSection, profileCenterBacksSection, profileForwardsSection, profileFullBacksSection,
    profileGoalkeepersSection, profileMidfieldersSection, profileWingersSection, teamSelect
} from "./domElements.js";
import {clearPlayerLists, clearProfileLists, selectPlayer, selectProfile} from "../script.js";

export async function loadLeagues() {
    try {
        const response = await fetch(`${BASE_URL}/api/leagues`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("HTTP error when fetching leagues:", response.status, errorText);
            return [];
        }
        const leagues = await response.json();
        leagues.forEach(league => {
            const option = document.createElement("option");
            option.value = league.id;
            option.textContent = league.name;
            leagueSelect.appendChild(option);
        });
        return leagues;
    } catch (error) {
        console.error("Error loading leagues:", error);
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
        console.error("Error loading teams:", error);
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

export async function fetchPlayerProfilesByPosition(positionCode) {
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