import {AppState, setDraggedElement} from "./constants.js";
import {allPositionSlots} from "./domElements.js";
import {updateSlotContent} from "./slotManager.js";
import {setFormationToCustom, updateMiddleSlotLayouts} from "./formationManager.js";
import {showNotification} from "./uiManager.js";

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

    const dropZoneHasContent = dropZone.classList.contains('has-content')
    const isDraggedFromBench = sourceSlot && sourceSlot.classList.contains('bench-slot');

    if (isDraggedFromBench && !dropZoneHasContent) {
        console.warn("Drop zone does not have content. Cannot drop from bench to field slot.");
        showNotification("Drop zone does not have content. Cannot drop from bench to field slot.", "warning");
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