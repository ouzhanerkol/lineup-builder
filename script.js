import {
    AppState,
    FORMATION_SLOTS
} from './js/constants.js';
import {
    modal,
    formationSelect,
    shareModal,
    leagueSelect, teamSelect
} from './js/domElements.js';
import {populateTeamsAndPlayers, setupEventListeners} from './js/eventListeners.js';
import { closeShareModal } from './js/shareUtils.js';
import {
    loadLeagues
} from './js/apiService.js'
import {
    clearPlayerLists,
    closeModal
} from "./js/modalManager.js";
import {setupDragAndDropListeners} from "./js/dragDropManager.js";
import {applyFormation, populateFormationSelect, updateMiddleSlotLayouts} from "./js/formationManager.js";

document.addEventListener('DOMContentLoaded', async function () {
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

    const leagues = await loadLeagues();
    if (leagues && Array.isArray(leagues) && leagues.length > 0) {
        leagues.forEach(league => {
            const option = document.createElement("option");
            option.value = league.id;
            option.textContent = league.name;
            leagueSelect.appendChild(option);
        });

        const firstLeague = leagues[0];
        if (firstLeague) {
            leagueSelect.value = firstLeague.id;

            await populateTeamsAndPlayers(firstLeague.id);
        }
    } else {
        console.warn("League data is not found or empty.");
        leagueSelect.innerHTML = '<option value="">No leagues found</option>';
        teamSelect.innerHTML = '';
        clearPlayerLists();
    }
});

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }

    if (event.target === shareModal) {
        closeShareModal();
    }
});
