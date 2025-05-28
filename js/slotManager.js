import {handleSlotClick} from "./modalManager.js";
import {addIconSvgPaths, DEFAULT_PLAYER_PHOTO} from "./constants.js";
import {updateMiddleSlotLayouts} from "./formationManager.js";
import {updateDraggableElements} from "./dragDropManager.js";
import {allSlots} from "./domElements.js";

export function updateSlotContent(slotElement, id, name, icon, type) {
    slotElement.innerHTML = '';

    const isFieldSlot = slotElement.classList.contains('position-slot');
    const isBenchSlot = slotElement.classList.contains('bench-slot');

    if (!isFieldSlot && !isBenchSlot) {
        console.error("Slot element is not a field slot or a bench slot:", slotElement);
        return;
    }

    let innerHTMLContent = '';

    if (id && name && icon && (type === 'player' || type === 'profile')) {
        const actualIcon = (type === 'player' && icon) ? icon : DEFAULT_PLAYER_PHOTO;

        const dataAttrId = `data-${type}-id="${id}"`;
        const dataAttrName = `data-${type}-name="${name}"`;
        const dataAttrIcon = `data-${type}-icon="${actualIcon}"`;
        const dataAttrType = `data-item-type="${type}"`;

        let contentWrapperClass, buttonClass, iconClass, nameClass;

        if (isFieldSlot) {
            contentWrapperClass = type === 'player' ? 'field-player-wrapper' : 'field-profile-wrapper';
            buttonClass = 'field-slot-btn';
            iconClass = 'field-slot-icon';
            nameClass = 'field-slot-name';
        } else if (isBenchSlot) {
            contentWrapperClass = type === 'player' ? 'bench-player-wrapper' : 'bench-profile-wrapper';
            buttonClass = 'bench-slot-btn';
            iconClass = 'bench-slot-icon';
            nameClass = 'bench-slot-name';
        }

        innerHTMLContent = `
            <div class="${contentWrapperClass}" ${dataAttrId} ${dataAttrName} ${dataAttrIcon} ${dataAttrType} draggable="true">
                <button class="${buttonClass}">
                    <div class="slot-content-inner">
                        <div class="${iconClass}">
                            <img src="${actualIcon}" alt="${name}" loading="lazy">
                        </div>
                        <div class="${nameClass}">
                            <span>${name}</span>
                        </div>
                    </div>
                </button>
            </div>
        `;

        slotElement.classList.add('has-content');
        slotElement.innerHTML = innerHTMLContent;

        const newButton = slotElement.querySelector(`.${buttonClass}`);
        if (newButton) {
            newButton.addEventListener('click', handleSlotClick);
        }
    } else if (type === 'placeholder') {
        slotElement.classList.add('has-content');
        slotElement.innerHTML = createPlaceholderContent(slotElement);

        const newButton = slotElement.querySelector('.field-slot-btn, .bench-slot-btn');
        if (newButton) {
            newButton.addEventListener('click', handleSlotClick);
        }
    } else {
        slotElement.innerHTML = '';
        slotElement.classList.remove('has-content');
    }
    updateDraggableElements();
    updateMiddleSlotLayouts();
}

export function updateSlotClickListeners() {
    const fieldSlotButtons = document.querySelectorAll('.position-slot .field-slot-btn');
    fieldSlotButtons.forEach(button => {
        button.removeEventListener('click', handleSlotClick);
        button.addEventListener('click', handleSlotClick);
    });

    const benchSlotButtons = document.querySelectorAll('.bench-slot .bench-slot-btn');
    benchSlotButtons.forEach(button => {
        button.removeEventListener('click', handleSlotClick);
        button.addEventListener('click', handleSlotClick);
    });
}

export function clearFormationSlots() {
    allSlots.forEach(slotElement => {
        if (slotElement.classList.contains('has-content')) {
            slotElement.classList.add('has-content');
            slotElement.innerHTML = createPlaceholderContent(slotElement);

            const newButton = slotElement.querySelector('.field-slot-btn, .bench-slot-btn');
            if (newButton) {
                newButton.addEventListener('click', handleSlotClick);
            }
        }
    });

    updateDraggableElements();
    updateMiddleSlotLayouts();
}

function createPlaceholderContent(slotElement) {
    const isBenchSlot = slotElement.classList.contains('bench-slot');
    const uniqueClipId = `clip${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let placeholderButtonClass, placeholderContentInnerClass, placeholderIconClass, placeholderAddIconWrapperClass;

    if (isBenchSlot) {
        placeholderButtonClass = 'bench-slot-btn';
        placeholderContentInnerClass = 'bench-slot-placeholder-content';
        placeholderIconClass = 'bench-slot-icon';
        placeholderAddIconWrapperClass = 'bench-slot-add-icon-wrapper';
    } else { // field slot
        placeholderButtonClass = 'field-slot-btn';
        placeholderContentInnerClass = 'field-slot-placeholder-content';
        placeholderIconClass = 'field-slot-icon';
        placeholderAddIconWrapperClass = 'field-slot-add-icon-wrapper';
    }

    return `
        <div class="${isBenchSlot ? 'bench-slot-placeholder' : 'field-slot-placeholder'}" draggable="true">
            <button class="${placeholderButtonClass}">
                <div class="${placeholderContentInnerClass}">
                    <div class="${placeholderIconClass}">
                        <img src="${DEFAULT_PLAYER_PHOTO}" alt="Add Player Icon" loading="lazy">
                    </div>
                    <div class="${placeholderAddIconWrapperClass}">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#${uniqueClipId})">
                                <path d="${addIconSvgPaths.M}"
                                      fill="#000000"/>
                                <path d="${addIconSvgPaths.line}" stroke="white" stroke-width="2"
                                      stroke-linecap="round"/>
                            </g>
                            <defs>
                                <clipPath id="${uniqueClipId}">
                                    <rect width="22" height="22" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                </div>
            </button>
        </div>
    `;
}