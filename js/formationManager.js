import {FORMATION_SLOTS, setCurrentFormation, ZONE_SLOT_MAP} from "./constants.js";
import {allPositionSlots, formationSelect} from "./domElements.js";
import {updateDraggableElements} from "./dragDropManager.js";
import {updateSlotClickListeners, updateSlotContent} from "./slotManager.js";

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
            const currentItemType = slot.querySelector('[data-item-type]')?.dataset.itemType;
            if (!hasContent || currentItemType === 'placeholder') {
                const playerId = slot.querySelector('[data-player-id]')?.dataset.playerId;
                const playerName = slot.querySelector('[data-player-name]')?.dataset.playerName;
                const playerIcon = slot.querySelector('[data-player-icon]')?.dataset.playerIcon;
                const playerType = slot.querySelector('[data-item-type]')?.dataset.itemType;

                if (playerId && playerType === 'player') {
                    updateSlotContent(slot, playerId, playerName, playerIcon, playerType);
                } else {
                    updateSlotContent(slot, null, null, null, 'placeholder');
                }
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

export function setFormationToCustom() {
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