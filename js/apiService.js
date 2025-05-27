import {BASE_URL} from "./constants.js";
import {hideLoading, showLoading, showNotification} from "./uiManager.js";

async function handleApiResponse(response) {
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText || 'Unknown Error' };
        }
        const errorMessage = errorData.message || `API Error: ${response.status} - ${response.statusText}`;
        console.error("API Error:", response.status, errorMessage, errorData);
        showNotification(`API Error: ${errorMessage}`, 'error');
        throw new Error(errorMessage);
    }
    return response.json();
}

export async function loadLeagues() {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/api/leagues`);
        return await handleApiResponse(response);
    } catch (error) {
        console.error("Error loading leagues:", error);
        showNotification(`Error loading leagues: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

export async function loadTeams(leagueId) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/api/teams/search/${leagueId}`);
        return await handleApiResponse(response);
    } catch (error) {
        console.error("Error loading teams:", error);
        showNotification(`Error loading teams: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

export async function fetchPlayers(teamId) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/api/players/search/${teamId}`);
        return await handleApiResponse(response);
    } catch (error) {
        console.error("Error fetching players:", error.message);
        showNotification(`Error fetching players: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

export async function fetchAllPlayerProfiles() {
    showLoading()
    try {
        const response = await fetch(`${BASE_URL}/api/player-profiles`);
        return await handleApiResponse(response);
    } catch (error) {
        console.error("Error (roles) fetching all player profiles:", error);
        showNotification(`Error (roles) fetching all player profiles: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

export async function fetchPlayerProfilesByPosition(positionCode) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/api/player-profiles/search/${positionCode}`);
        return await handleApiResponse(response);
    } catch (error) {
        console.error("Error (roles) fetching player profiles by position:", error);
        showNotification(`Error (roles) fetching player profiles by position: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

export async function fetchSearchResults(searchTerm) {
    showLoading()
    try {
        const response = await fetch(`${BASE_URL}/api/players/search?query=${searchTerm}`);
        return await handleApiResponse(response);
    } catch (error) {
        console.error("Error when fetching search result:", error);
        showNotification(`Error when fetching search result: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}