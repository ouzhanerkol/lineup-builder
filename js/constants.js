export const BASE_URL = "http://localhost:8080";

export const AppState = {
    selectedSlotForModal: null,
    searchInputListener: null,
    isBenchSlotSelected: false,
    currentFormation: "4-2-3-1",
    draggedElement: null
};

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

export const modal = document.getElementById('playerModal');
export const playerListSection = document.getElementById('playerListSection');
export const playerRolesSection = document.getElementById("playerRolesSection");
export const goalkeepersSection = document.querySelector(".modal-player-list.goalkeepers");
export const defendersSection = document.querySelector(".modal-player-list.defenders");
export const midfieldersSection = document.querySelector(".modal-player-list.midfielders");
export const forwardsSection = document.querySelector(".modal-player-list.forwards");
export const playerSearchInput = document.getElementById('playerSearchInput');
export const playerSearchResults = document.getElementById('playerSearchResults');
export const profileGoalkeepersSection = document.querySelector(".modal-profile-list.profile-goalkeepers");
export const profileCenterBacksSection = document.querySelector(".modal-profile-list.profile-center-backs");
export const profileFullBacksSection = document.querySelector(".modal-profile-list.profile-full-backs");
export const profileMidfieldersSection = document.querySelector(".modal-profile-list.profile-midfielders");
export const profileWingersSection = document.querySelector(".modal-profile-list.profile-wingers");
export const profileForwardsSection = document.querySelector(".modal-profile-list.profile-forwards");
export const formationSelect = document.getElementById('formation-select');
export const allPositionSlots = document.querySelectorAll('.position-slot');
export const teamNameInput = document.getElementById('team-name');
export const shareButton = document.querySelector('.share-btn');
export const shareModal = document.getElementById('shareModal');
export const closeShareModalButton = document.querySelector('#shareModal .close-btn');
export const downloadImageBtn = document.getElementById('downloadImageBtn');
export const twitterShareBtn = document.getElementById('twitterShareBtn');
export const facebookShareBtn = document.getElementById('facebookShareBtn');
export const copyImageLinkBtn = document.getElementById('copyImageLinkBtn');
export const generatedImageView = document.getElementById('generatedImageView');

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