import {AppState, setDraggedElement} from "./constants.js";
import {allPositionSlots} from "./domElements.js";
import {updateSlotContent} from "./slotManager.js";
import {setFormationToCustom, updateMiddleSlotLayouts} from "./formationManager.js";
import {showNotification} from "./uiManager.js";

let draggedElementClone = null;
let offsetX = 0;
let offsetY = 0;

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

export function setupDragAndDropListeners() {
    allPositionSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);

        if (isMobileDevice()) {
            slot.addEventListener('touchmove', handleTouchMove, { passive: false });
            slot.addEventListener('touchend', handleTouchEnd);
        }
    });

    document.querySelectorAll('.bench-slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);

        if (isMobileDevice()) {
            slot.addEventListener('touchmove', handleTouchMove, { passive: false });
            slot.addEventListener('touchend', handleTouchEnd);
        }
    });
    updateDraggableElements();
}

export function updateDraggableElements() {
    const draggableSelectors = [
        '.field-player-wrapper',
        '.field-profile-wrapper',
        '.bench-player-wrapper',
        '.bench-profile-wrapper',
        '.field-slot-placeholder',
        '.bench-slot-placeholder'
    ].join(', ');

    const draggableItems = document.querySelectorAll(draggableSelectors);

    draggableItems.forEach(item => {
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
        item.removeEventListener('touchstart', handleTouchStart);

        if (isMobileDevice()) {
            item.removeAttribute('draggable');
            item.addEventListener('touchstart', handleTouchStart, { passive: true });
        } else {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        }
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

    await processDropLogic(dropZone, data);
}

function handleTouchStart(event) {
    const draggableSelectors = [
        '.field-player-wrapper', '.field-profile-wrapper',
        '.bench-player-wrapper', '.bench-profile-wrapper',
        '.field-slot-placeholder', '.bench-slot-placeholder'
    ].join(', ');

    const draggableItem = event.target.closest(draggableSelectors);
    if (!draggableItem) return;

    setDraggedElement(draggableItem);

    const touch = event.touches[0];
    const rect = AppState.draggedElement.getBoundingClientRect();

    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;

    draggedElementClone = AppState.draggedElement.cloneNode(true);

    draggedElementClone.style.position = 'absolute';
    draggedElementClone.style.pointerEvents = 'none';
    draggedElementClone.style.opacity = '0.7';
    draggedElementClone.style.zIndex = '1000';
    draggedElementClone.style.boxSizing = 'border-box';

    draggedElementClone.style.width = `${rect.width}px`;
    draggedElementClone.style.height = `${rect.height}px`;

    draggedElementClone.querySelectorAll('img').forEach(img => {
        img.style.width = '50%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
    });

    draggedElementClone.querySelectorAll('button').forEach(btn => {
        btn.style.pointerEvents = 'none';
    });

    draggedElementClone.style.left = (touch.clientX - offsetX) + 'px';
    draggedElementClone.style.top = (touch.clientY - offsetY) + 'px';

    document.body.appendChild(draggedElementClone);

    AppState.draggedElement.style.opacity = '0.0';

    allPositionSlots.forEach(slot => slot.classList.remove('drag-over'));
    document.querySelectorAll('.bench-slot').forEach(slot => slot.classList.remove('drag-over'));
}

function handleTouchMove(event) {
    if (!AppState.draggedElement || !draggedElementClone) return;

    event.preventDefault();

    const touch = event.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    draggedElementClone.style.left = (clientX - offsetX) + 'px';
    draggedElementClone.style.top = (clientY - offsetY) + 'px';

    const targetElement = document.elementFromPoint(clientX, clientY);

    allPositionSlots.forEach(slot => slot.classList.remove('drag-over'));
    document.querySelectorAll('.bench-slot').forEach(slot => slot.classList.remove('drag-over'));

    if (targetElement) {
        const dropZone = targetElement.closest('.position-slot, .bench-slot');
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
    }
}

async function handleTouchEnd(event) {
    if (!AppState.draggedElement) {
        if (draggedElementClone) {
            draggedElementClone.remove();
            draggedElementClone = null;
        }
        return;
    }

    AppState.draggedElement.style.opacity = '1';

    if (draggedElementClone) {
        draggedElementClone.remove();
        draggedElementClone = null;
    }

    allPositionSlots.forEach(slot => slot.classList.remove('drag-over'));
    document.querySelectorAll('.bench-slot').forEach(slot => slot.classList.remove('drag-over'));

    const touch = event.changedTouches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    const dropZone = document.elementFromPoint(clientX, clientY)?.closest('.position-slot, .bench-slot');

    if (dropZone) {
        const type = AppState.draggedElement.dataset.itemType || 'placeholder';
        let id = null, name = null, icon = null;

        if (type === 'player' || type === 'profile') {
            id = AppState.draggedElement.dataset[`${type}Id`];
            name = AppState.draggedElement.dataset[`${type}Name`];
            icon = AppState.draggedElement.dataset[`${type}Icon`];
        }

        const sourceSlotId = AppState.draggedElement.closest('.position-slot, .bench-slot')?.id;

        const data = { type, id, name, icon, sourceSlotId };
        await processDropLogic(dropZone, data);
    }

    setDraggedElement(null);
    offsetX = 0;
    offsetY = 0;
}

async function processDropLogic(dropZone, data) {
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

    const dropZoneHasContent = dropZone.classList.contains('has-content');
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