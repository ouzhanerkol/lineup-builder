import {BASE_URL} from "./constants.js";
import {renderPlayerProfiles, renderPlayers} from "../script.js";
import {teamSelect} from "./domElements.js";

export async function loadLeagues() {
    try {
        const response = await fetch(`${BASE_URL}/api/leagues`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("HTTP error when fetching leagues:", response.status, errorText);
            return [];
        }
        return await response.json();
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
            option.dataset.logoUrl = team.logoUrl?.trim() ? team.logoUrl : 'assets/images/default-team-logo.png';
            if (team.id === '1') {
                option.selected = true;
            }
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

export async function fetchSearchResults(searchTerm) {
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