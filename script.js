import {
    AppState,
    FORMATION_SLOTS
} from './js/constants.js';
import {
    modal,
    formationSelect,
    shareModal,
    leagueSelect
} from './js/domElements.js';
import { setupEventListeners } from './js/eventListeners.js';
import { closeShareModal } from './js/shareUtils.js';
import {
    loadLeagues, loadTeams, fetchPlayers
} from './js/apiService.js'
import {
    closeModal
} from "./js/modalManager.js";
import {setupDragAndDropListeners} from "./js/dragDropManager.js";
import {applyFormation, populateFormationSelect, updateMiddleSlotLayouts} from "./js/formationManager.js";
import {renderPlayers} from "./js/renderUtils.js";

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
        leagues.forEach(league => {
            const option = document.createElement("option");
            option.value = league.id;
            option.textContent = league.name;
            leagueSelect.appendChild(option);
        });
        const firstLeague = leagues[0];
        if (firstLeague) {
            document.getElementById("league-select").value = firstLeague.id;
            loadTeams(firstLeague.id).then(teams => {
                if (teams && Array.isArray(teams) && teams.length > 0) {
                    const firstTeam = teams[0];
                    if (firstTeam) {
                        document.getElementById("team-select").value = firstTeam.id;
                        fetchPlayers(firstTeam.id).then(players => {
                            if (players) {
                                renderPlayers(players);
                            }
                        });
                    }
                } else {
                    console.warn("Team data is not found or empty.");
                }
            });
        }
    });

});

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }

    if (event.target === shareModal) {
        closeShareModal();
    }
});
