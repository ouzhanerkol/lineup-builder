export const BASE_URL = "http://localhost:8080";

export const AppState = {
    selectedSlotForModal: null,
    searchInputListener: null,
    isBenchSlotSelected: false,
    currentFormation: "4-2-3-1",
    draggedElement: null
};

export const DEFAULT_PLAYER_PHOTO = 'assets/images/placeholder-icon.png';
export const DEFAULT_PROFILE_PHOTO = 'assets/images/placeholder-icon.png';

export function setSelectedSlotForModal(slot) {
    AppState.selectedSlotForModal = slot;
}
export function setSearchInputListener(listener) {
    AppState.searchInputListener = listener;
}
export function setIsBenchSlotSelected(isBench) {
    AppState.isBenchSlotSelected = isBench;
}
export function setCurrentFormation(formation) {
    AppState.currentFormation = formation;
}
export function setDraggedElement(element) {
    AppState.draggedElement = element;
}

export const SLOT_POSITION_MAP = {
    'position-gk': 'GK',
    'position-1-1': 'FB', 'position-1-5': 'FB',
    'position-2-1': 'FB', 'position-2-5': 'FB',
    'position-3-1': 'FW', 'position-3-5': 'FW',
    'position-4-1': 'FW', 'position-4-5': 'FW',
    'position-5-1': 'FW', 'position-5-5': 'FW',
    'position-1-2': 'CB', 'position-1-3': 'CB', 'position-1-4': 'CB',
    'position-2-2': 'DM', 'position-2-3': 'DM', 'position-2-4': 'DM',
    'position-3-2': 'CM', 'position-3-3': 'CM', 'position-3-4': 'CM',
    'position-4-2': 'AM', 'position-4-3': 'AM', 'position-4-4': 'AM',
    'position-5-2': 'ST', 'position-5-3': 'ST', 'position-5-4': 'ST'
};

export const ZONE_SLOT_MAP = {
    'goalkeeper-zone': ['position-gk'],
    'zone-row-1': ['position-1-1', 'position-1-2', 'position-1-3', 'position-1-4', 'position-1-5'],
    'zone-row-2': ['position-2-1', 'position-2-2', 'position-2-3', 'position-2-4', 'position-2-5'],
    'zone-row-3': ['position-3-1', 'position-3-2', 'position-3-3', 'position-3-4', 'position-3-5'],
    'zone-row-4': ['position-4-1', 'position-4-2', 'position-4-3', 'position-4-4', 'position-4-5'],
    'zone-row-5': ['position-5-1', 'position-5-2', 'position-5-3', 'position-5-4', 'position-5-5']
};

export const FORMATION_SLOTS = {
    '4-2-3-1': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-2', 'position-2-4',
        'position-4-1', 'position-4-3', 'position-4-5',
        'position-5-3'
    ],
    '4-3-2-1': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-3',
        'position-3-2', 'position-3-4',
        'position-4-2', 'position-4-4',
        'position-5-3'
    ],
    '4-3-3': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-3',
        'position-3-2', 'position-3-4',
        'position-4-1', 'position-4-5',
        'position-5-3'
    ],
    '4-4-2': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-3-1', 'position-3-2', 'position-3-4', 'position-3-5',
        'position-5-2', 'position-5-4'
    ],
    '4-2-2-2': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-2', 'position-2-4',
        'position-4-2', 'position-4-4',
        'position-5-2', 'position-5-4'
    ],
    '4-2-4': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-4', 'position-1-5',
        'position-2-2', 'position-2-4',
        'position-4-1', 'position-4-5',
        'position-5-2', 'position-5-4'
    ],
    '5-3-2': [
        'position-gk',
        'position-1-1', 'position-1-2', 'position-1-3', 'position-1-4', 'position-1-5',
        'position-2-3',
        'position-3-2', 'position-3-4',
        'position-5-2', 'position-5-4'
    ],
    '3-4-1-2': [
        'position-gk',
        'position-1-2', 'position-1-3', 'position-1-4',
        'position-2-1', 'position-2-2', 'position-2-4', 'position-2-5',
        'position-4-3',
        'position-5-2', 'position-5-4'
    ],
    '3-4-3': [
        'position-gk',
        'position-1-2', 'position-1-3', 'position-1-4',
        'position-2-1', 'position-2-2', 'position-2-4', 'position-2-5',
        'position-4-1', 'position-4-5',
        'position-5-3'
    ],
    '3-4-2-1': [
        'position-gk',
        'position-1-2', 'position-1-3', 'position-1-4',
        'position-2-1', 'position-2-2', 'position-2-4', 'position-2-5',
        'position-4-2', 'position-4-4',
        'position-5-3'
    ]
};

export const addIconSvgPaths = {
    M: "M11 22C16.5228 22 22 16.5228 22 11C22 5.47715 16.5228 0 11 0C5.47715 0 0 5.47715 0 11C0 16.5228 5.47715 22 11 22Z",
    line: "M17 11H5M11 5V17"
};