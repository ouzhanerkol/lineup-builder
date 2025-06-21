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
    profileSectionHeaders,
    modalProfileCategoryToggleIcons,
    allBenchSlots,
    benchToggleBtn,
    controlPanelToggleBtn,
    benchSection,
    controlPanel, themeToggle, mainNav, hamburgerMenu
} from './domElements.js';

import {
    applyFormation
} from './formationManager.js';
import {
    openShareModal, closeShareModal, downloadImage, shareToTwitter,
    shareToFacebook, copyImageToClipboard
} from './shareUtils.js';
import {loadTeams, fetchPlayers, fetchAllPlayerProfiles, loadLeagues} from './apiService.js';
import {clearPlayerLists, closeModal, handleSlotClick, showPlayersTab, showRolesTab} from "./modalManager.js";
import {renderPlayers} from "./renderUtils.js";
import {clearFormationSlots, createPlaceholderContent} from "./slotManager.js";
import {AppState} from "./constants.js";

export async function initializeLeagueAndTeamSelection() {
    const customLeagueSelectDisplay = document.getElementById("custom-league-select-display");
    const customLeagueSelectOptions = document.getElementById("custom-league-select-options");

    const leagues = await loadLeagues();
    if (leagues && Array.isArray(leagues) && leagues.length > 0) {
        leagueSelect.innerHTML = '';
        customLeagueSelectOptions.innerHTML = '';

        leagues.forEach(league => {
            const option = document.createElement("option");
            option.value = league.id;
            option.textContent = league.name;
            option.dataset.logoUrl = league.logoUrl?.trim() ? league.logoUrl : 'assets/images/default-league-logo.svg';
            leagueSelect.appendChild(option);

            const customOption = document.createElement("div");
            customOption.classList.add("custom-league-option");
            customOption.dataset.leagueId = league.id;
            customOption.dataset.logoUrl = option.dataset.logoUrl;

            const img = document.createElement("img");
            img.src = option.dataset.logoUrl;
            img.alt = `${league.name} logo`;
            img.classList.add("league-logo-small");

            const span = document.createElement("span");
            span.textContent = league.name;

            customOption.appendChild(img);
            customOption.appendChild(span);
            customLeagueSelectOptions.appendChild(customOption);

            customOption.addEventListener('click', async () => {
                leagueSelect.value = league.id;
                updateCustomLeagueSelectDisplay(league.id, league.name, option.dataset.logoUrl);
                customLeagueSelectOptions.classList.remove('show');
                await populateTeamsAndPlayers(league.id);
            });
        });

        const firstLeagueId = leagues[0].id;
        const firstLeagueName = leagues[0].name;
        const firstLeagueLogoUrl = leagues[0].logoUrl?.trim() ? leagues[0].logoUrl : 'assets/images/default-league-logo.svg';

        leagueSelect.value = firstLeagueId;
        updateCustomLeagueSelectDisplay(firstLeagueId, firstLeagueName, firstLeagueLogoUrl);

        await populateTeamsAndPlayers(firstLeagueId);

    } else {
        console.warn("League data is not found or empty.");
        leagueSelect.innerHTML = '<option value="">No leagues found</option>';
        if (customLeagueSelectDisplay) customLeagueSelectDisplay.innerHTML = 'No leagues found';
        if (customLeagueSelectOptions) customLeagueSelectOptions.innerHTML = '';
        teamSelect.innerHTML = '';
        clearPlayerLists();
    }
}

function updateCustomLeagueSelectDisplay(leagueId, leagueName, logoUrl) {
    const customLeagueSelectDisplay = document.getElementById("custom-league-select-display");
    if (customLeagueSelectDisplay) {
        let img = customLeagueSelectDisplay.querySelector(".league-logo-small");
        let span = customLeagueSelectDisplay.querySelector("span:not(.dropdown-arrow)");

        if (!img) {
            img = document.createElement("img");
            img.classList.add("league-logo-small");
            customLeagueSelectDisplay.prepend(img);
        }
        img.src = logoUrl;
        img.alt = `${leagueName} logo`;

        if (!span) {
            span = document.createElement("span");
            const dropdownArrow = customLeagueSelectDisplay.querySelector(".dropdown-arrow");
            if (dropdownArrow) {
                customLeagueSelectDisplay.insertBefore(span, dropdownArrow);
            } else {
                customLeagueSelectDisplay.appendChild(span);
            }
        }
        span.textContent = leagueName;
    }
}

export async function populateTeamsAndPlayers(leagueId) {
    if (!leagueId) {
        teamSelect.innerHTML = '<option value="">No teams found</option>';
        clearPlayerLists();
        return;
    }

    const teams = await loadTeams(leagueId);
    const customTeamSelectDisplay = document.getElementById("custom-team-select-display");
    const customTeamSelectOptions = document.getElementById("custom-team-select-options");

    if (teams && Array.isArray(teams) && teams.length > 0) {
        teamSelect.innerHTML = '';
        customTeamSelectOptions.innerHTML = '';

        teams.forEach(team => {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;
            option.dataset.logoUrl = team.logoUrl?.trim() ? team.logoUrl : 'assets/images/default-team-logo.svg';
            teamSelect.appendChild(option);

            const customOption = document.createElement("div");
            customOption.classList.add("custom-team-option");
            customOption.dataset.teamId = team.id;
            customOption.dataset.logoUrl = option.dataset.logoUrl;

            const img = document.createElement("img");
            img.src = option.dataset.logoUrl;
            img.alt = `${team.name} logo`;
            img.classList.add("team-logo-small");

            const span = document.createElement("span");
            span.textContent = team.name;

            customOption.appendChild(img);
            customOption.appendChild(span);
            customTeamSelectOptions.appendChild(customOption);

            customOption.addEventListener('click', () => {
                teamSelect.value = team.id;
                updateCustomTeamSelectDisplay(team.id, team.name, option.dataset.logoUrl);
                customTeamSelectOptions.classList.remove('show');
                clearFormationSlots();
                fetchPlayers(team.id).then(renderPlayers);
            });
        });

        const firstTeamId = teams[0].id;
        const firstTeamName = teams[0].name;
        const firstTeamLogoUrl = teams[0].logoUrl?.trim() ? teams[0].logoUrl : 'assets/images/default-team-logo.svg';

        teamSelect.value = firstTeamId;
        updateCustomTeamSelectDisplay(firstTeamId, firstTeamName, firstTeamLogoUrl);
        const players = await fetchPlayers(firstTeamId);
        if (players) {
            renderPlayers(players);
        }
    } else {
        console.warn("Team data is not found or empty for this league.");
        teamSelect.innerHTML = '<option value="">No teams found</option>';
        if (customTeamSelectDisplay) customTeamSelectDisplay.innerHTML = 'No teams found';
        if (customTeamSelectOptions) customTeamSelectOptions.innerHTML = '';
        clearPlayerLists();
        clearFormationSlots();
    }
}

function updateCustomTeamSelectDisplay(teamId, teamName, logoUrl) {
    const customTeamSelectDisplay = document.getElementById("custom-team-select-display");
    if (customTeamSelectDisplay) {
        let img = customTeamSelectDisplay.querySelector(".team-logo-small");
        let span = customTeamSelectDisplay.querySelector("span:not(.dropdown-arrow)");

        if (!img) {
            img = document.createElement("img");
            img.classList.add("team-logo-small");
            customTeamSelectDisplay.prepend(img);
        }
        img.src = logoUrl;
        img.alt = `${teamName} logo`;

        if (!span) {
            span = document.createElement("span");
            const dropdownArrow = customTeamSelectDisplay.querySelector(".dropdown-arrow");
            if (dropdownArrow) {
                customTeamSelectDisplay.insertBefore(span, dropdownArrow);
            } else {
                customTeamSelectDisplay.appendChild(span);
            }
        }
        span.textContent = teamName;
    }
}

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

    if (hamburgerMenu && mainNav) {
        hamburgerMenu.addEventListener('click', () => {
            mainNav.classList.toggle('is-active');
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mainNav.classList.contains('is-active')) {
                mainNav.classList.remove('is-active');
            }
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            }
        });

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle.querySelector('i')) {
                themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            }
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle.querySelector('i')) {
                themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            }
        }
    }

    document.querySelectorAll('.modal-profile-category .toggle-icon').forEach(icon => {
        if (icon.closest('.modal-profile-category')
            .querySelector('.modal-profile-list').classList.contains('active-list')) {
            icon.textContent = '-';
        } else {
            icon.textContent = '+';
        }
    });

    allBenchSlots.forEach(slot => {
        slot.innerHTML = createPlaceholderContent(slot);
        slot.classList.add('has-content');

        const newButton = slot.querySelector('.bench-slot-btn');
        if (newButton) {
            newButton.addEventListener('click', handleSlotClick);
        }
    })

    if (controlPanelToggleBtn) {
        controlPanelToggleBtn.addEventListener('click', toggleControlPanel);
    }
    if (benchToggleBtn) {
        benchToggleBtn.addEventListener('click', toggleBenchSection);
    }

    handlePanelDisplayOnResize();
    window.addEventListener('resize', handlePanelDisplayOnResize);

    document.addEventListener('click', handleClickOutsidePanel);

    const customTeamSelectDisplay = document.getElementById("custom-team-select-display");
    const customTeamSelectOptions = document.getElementById("custom-team-select-options");
    if (customTeamSelectDisplay && customTeamSelectOptions) {
        customTeamSelectDisplay.addEventListener('click', () => {
            customTeamSelectOptions.classList.toggle('show');
            document.getElementById("custom-league-select-options")?.classList.remove('show');
        });
        document.addEventListener('click', (event) => {
            if (!customTeamSelectDisplay.contains(event.target) && !customTeamSelectOptions.contains(event.target)) {
                customTeamSelectOptions.classList.remove('show');
            }
        });
    }

    const customLeagueSelectDisplay = document.getElementById("custom-league-select-display");
    const customLeagueSelectOptions = document.getElementById("custom-league-select-options");
    if (customLeagueSelectDisplay && customLeagueSelectOptions) {
        customLeagueSelectDisplay.addEventListener('click', () => {
            customLeagueSelectOptions.classList.toggle('show');
            document.getElementById("custom-team-select-options")?.classList.remove('show');
        });
        document.addEventListener('click', (event) => {
            if (!customLeagueSelectDisplay.contains(event.target) && !customLeagueSelectOptions.contains(event.target)) {
                customLeagueSelectOptions.classList.remove('show');
            }
        });
    }

    initializeLeagueAndTeamSelection();
}

function toggleControlPanel() {
    if (!controlPanel) {
        console.error("Control panel element not found!");
        return;
    }
    AppState.isControlPanelOpen = !AppState.isControlPanelOpen;
    if (AppState.isControlPanelOpen) {
        controlPanel.classList.add('is-open');
    } else {
        controlPanel.classList.remove('is-open');
    }
}

function toggleBenchSection() {
    if (!benchSection) {
        console.error("Bench section element not found!");
        return;
    }
    AppState.isBenchSectionOpen = !AppState.isBenchSectionOpen;
    if (AppState.isBenchSectionOpen) {
        benchSection.classList.add('is-open');
    } else {
        benchSection.classList.remove('is-open');
    }
}

function handlePanelDisplayOnResize() {
    if (window.innerWidth >= 1280) {
        if (controlPanel) {
            controlPanel.classList.remove('is-open');
            controlPanel.classList.remove('is-mobile-overlay');
        }
        AppState.isControlPanelOpen = false;
    } else {
        if (controlPanel) {
            controlPanel.classList.remove('is-open');
            controlPanel.classList.add('is-mobile-overlay');
        }
        AppState.isControlPanelOpen = false;
    }

    if (window.innerWidth >= 900) {
        if (benchSection) {
            benchSection.classList.remove('is-open');
            benchSection.classList.remove('is-mobile-overlay');
        }
        AppState.isBenchSectionOpen = false;
    } else {
        if (benchSection) {
            benchSection.classList.remove('is-open');
            benchSection.classList.add('is-mobile-overlay');
        }
        AppState.isBenchSectionOpen = false;
    }
}

function handleClickOutsidePanel(event) {
    if (!controlPanel || !benchSection) {
        return;
    }

    if (modal && modal.contains(event.target)) {
        return;
    }

    if (window.innerWidth < 1280 && AppState.isControlPanelOpen && !controlPanel.contains(event.target) && event.target !== controlPanelToggleBtn) {
        toggleControlPanel();
    }
    if (window.innerWidth < 900 && AppState.isBenchSectionOpen && !benchSection.contains(event.target) && event.target !== benchToggleBtn) {
        toggleBenchSection();
    }
}