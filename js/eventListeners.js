import {
    modal,
    formationSelect,
    shareButton,
    closeShareModalButton,
    downloadImageBtn,
    twitterShareBtn,
    facebookShareBtn,
    copyImageLinkBtn,
    closeModalButton,
    playersTabBtn,
    rolesTabBtn,
    controlPanelPlayersTabBtn,
    leagueSelect,
    teamSelect,
    controlPanelTabBtns,
    tabPanes,
    profileSectionHeaders, modalProfileCategoryToggleIcons
} from './domElements.js';

import {
    applyFormation
} from './formationManager.js';
import {
    openShareModal, closeShareModal, downloadImage, shareToTwitter,
    shareToFacebook, copyImageToClipboard
} from './shareUtils.js';
import { loadTeams, fetchPlayers, fetchAllPlayerProfiles } from './apiService.js';
import {clearPlayerLists, closeModal, showPlayersTab, showRolesTab} from "./modalManager.js";
import {renderPlayers} from "./renderUtils.js";


export function setupEventListeners() {
    controlPanelTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            controlPanelTabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const targetPanel = document.getElementById(this.dataset.tab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            } else {
                console.error("Target panel not found:", this.dataset.tab);
            }
        });
    });

    profileSectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const targetList = document.getElementById(targetId);
            const toggleIcon = this.querySelector('.toggle-icon');

            if (targetList) {
                targetList.classList.toggle('active-list');
                if (targetList.classList.contains('active-list')) {
                    toggleIcon.textContent = '-';
                } else {
                    toggleIcon.textContent = '+';
                }
            }
        });
    });

    modalProfileCategoryToggleIcons.forEach(icon => {
        if (icon.closest('.modal-profile-category')
            .querySelector('.modal-profile-list').classList.contains('active-list')) {
            icon.textContent = '-';
        } else {
            icon.textContent = '+';
        }
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    if (playersTabBtn) {
        playersTabBtn.addEventListener('click', showPlayersTab);
    }
    if (rolesTabBtn) {
        rolesTabBtn.addEventListener('click', showRolesTab);
    }
    if (controlPanelPlayersTabBtn) {
        controlPanelPlayersTabBtn.addEventListener('click', () => {
            if (modal.style.display === "block" && rolesTabBtn.classList.contains('active')) {
                fetchAllPlayerProfiles();
            }
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', openShareModal);
    }
    if (closeShareModalButton) {
        closeShareModalButton.addEventListener('click', closeShareModal);
    }
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', downloadImage);
    }
    if (twitterShareBtn) {
        twitterShareBtn.addEventListener('click', shareToTwitter);
    }
    if (facebookShareBtn) {
        facebookShareBtn.addEventListener('click', shareToFacebook);
    }
    if (copyImageLinkBtn) {
        copyImageLinkBtn.addEventListener('click', copyImageToClipboard);
    }

    if (formationSelect) {
        formationSelect.addEventListener('change', (event) => {
            applyFormation(event.target.value);
        });
    }

    if (leagueSelect) {
        leagueSelect.addEventListener("change", function () {
            const leagueId = this.value;
            if (leagueId) {
                loadTeams(leagueId).then(teams => {
                    if (teams && Array.isArray(teams) && teams.length > 0) {
                        teamSelect.innerHTML = '';
                        teams.forEach(team => {
                            const option = document.createElement("option");
                            option.value = team.id;
                            option.textContent = team.name;
                            teamSelect.appendChild(option);
                        });
                        const firstTeam = teams[0];
                        if (firstTeam) {
                            teamSelect.value = firstTeam.id;
                            fetchPlayers(firstTeam.id).then(players => {
                                if (players) {
                                    renderPlayers(players);
                                }
                            });
                        }
                    } else {
                        console.warn("Team data is not found or empty for this league.");
                        teamSelect.innerHTML = '<option value="">No teams found</option>';
                        clearPlayerLists();
                    }
                });
            } else {
                teamSelect.innerHTML = '';
                clearPlayerLists();
            }
        });
    }
    if (teamSelect) {
        teamSelect.addEventListener("change", function () {
            const teamId = this.value;
            if (teamId) {
                fetchPlayers(teamId).then(players => {
                    if (players) {
                        renderPlayers(players);
                    }
                });
            } else {
                clearPlayerLists();
            }
        });
    }

    document.querySelectorAll('.modal-profile-category .toggle-icon').forEach(icon => {
        if (icon.closest('.modal-profile-category')
            .querySelector('.modal-profile-list').classList.contains('active-list')) {
            icon.textContent = '-';
        } else {
            icon.textContent = '+';
        }
    });
}