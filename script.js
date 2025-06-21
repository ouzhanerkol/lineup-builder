import {
    AppState,
    FORMATION_SLOTS
} from './js/constants.js';
import {
    modal,
    formationSelect,
    shareModal
} from './js/domElements.js';
import {setupEventListeners} from './js/eventListeners.js';
import { closeShareModal } from './js/shareUtils.js';
import {
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
});

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }

    if (event.target === shareModal) {
        closeShareModal();
    }
});
