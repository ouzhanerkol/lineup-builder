import {BASE_URL, AppState, DEFAULT_PLAYER_PHOTO} from './constants.js';
import {
    shareModal,
    generatedImageView,
    teamNameInput,
    teamSelect,
    allPositionSlots, pitchContainer, allBenchSlots
} from './domElements.js';

export function openShareModal() {
    generateShareImage().then(() => {
        shareModal.style.display = 'flex';
    }).catch(error => {
        console.error("Error while generating share image: ", error);
        alert("Error while generating share image. Please try again.");
    });
}

export function closeShareModal() {
    shareModal.style.display = "none";
    const imgElement = generatedImageView.querySelector('img');
    if (imgElement) {
        imgElement.src = '';
    }
    const tempContainer = document.getElementById('image-generation-container');
    if (tempContainer) {
        tempContainer.remove();
    }
}

export async function generateShareImage() {
    const teamName = teamNameInput.value || "My Team";
    const formationName = AppState.currentFormation;

    let teamLogoUrl = 'assets/images/default-team-logo.png';
    const selectedTeamOption = document.querySelector(`#team-select option[value="${teamSelect.value}"]`)
    if (selectedTeamOption && selectedTeamOption.dataset.logoUrl) {
        const originalLogoUrl = selectedTeamOption.dataset.logoUrl;
        teamLogoUrl = `${BASE_URL}/api/proxy/image?imageUrl=${originalLogoUrl}`;
    }

    const siteLogoUrl = 'assets/images/logo.png';

    let imageGenerationContainer = document.getElementById('image-generation-container');
    if (imageGenerationContainer) {
        imageGenerationContainer.remove();
    }
    imageGenerationContainer = document.createElement('div');
    imageGenerationContainer.id = 'image-generation-container';
    document.body.appendChild(imageGenerationContainer);

    const leftColumnHtml = `
        <div id="left-column-content">
            <div class="site-logo-area">
                <img src="${siteLogoUrl}" alt="MyTeamFormation Logo">
            </div>
            <div id="image-bench-area">
                </div>
            <div class="team-info-area">
                <img src="${teamLogoUrl}" alt="Team Logo">
                <span class="team-name">${teamName}</span>
                <span class="formation-name">${formationName}</span>
            </div>
        </div>
    `;

    const pitchAreaHtml = `
    <div id="image-pitch-container">
        </div>
`;

    imageGenerationContainer.innerHTML = leftColumnHtml + pitchAreaHtml;

    const imagePitchContainer = imageGenerationContainer.querySelector('#image-pitch-container');
    const imageBenchArea = imageGenerationContainer.querySelector('#image-bench-area');

    allPositionSlots.forEach(slot => {
        const slotContent = slot.querySelector('.field-player-wrapper, .field-profile-wrapper, .field-slot-placeholder');
        if (slotContent) {
            const newSlotDiv = document.createElement('div');
            newSlotDiv.className = 'image-position-slot';
            newSlotDiv.style.position = 'absolute';


            const pitchRect = pitchContainer.getBoundingClientRect();
            const slotRect = slot.getBoundingClientRect();

            const originalPitchPaddingLeft = 10;
            const originalPitchPaddingTop = 10;

            const xRatio = (slotRect.left - pitchRect.left - originalPitchPaddingLeft) / (pitchRect.width - (originalPitchPaddingLeft * 2));
            const yRatio = (slotRect.top - pitchRect.top - originalPitchPaddingTop) / (pitchRect.height - (originalPitchPaddingTop * 2));

            const newPitchWidth = imagePitchContainer.offsetWidth;
            const newPitchHeight = imagePitchContainer.offsetHeight;

            const slotWidth = 90;
            const slotHeight = 90;

            newSlotDiv.style.left = `${(xRatio * newPitchWidth) - (slotWidth / 2) + 43}px`;
            newSlotDiv.style.top = `${(yRatio * newPitchHeight) - (slotHeight / 2) + 50}px`;

            let contentHtml = '';
            if (slotContent.classList.contains('field-player-wrapper') || slotContent.classList.contains('field-profile-wrapper')) {
                const type = slotContent.dataset.itemType;
                const name = slotContent.dataset[`${type}Name`];
                let icon = slotContent.dataset[`${type}Icon`];

                if (icon && !icon.startsWith('assets/images/')) {
                    icon = `${BASE_URL}/api/proxy/image?imageUrl=${icon}`;
                }

                contentHtml = `
                    <div class="image-pitch-player-content">
                        <div class="image-placeholder-icon-container">
                            <img src="${icon}" alt="${name}">
                        </div>
                        <span>${name}</span>
                    </div>
                `;
            } else if (slotContent.classList.contains('field-slot-placeholder')) {
                contentHtml = `
                    <div class="image-pitch-player-content">
                        <img src="${DEFAULT_PLAYER_PHOTO}" alt="Empty Slot">
                        <span>Empty Slot</span>
                    </div>
                `;
            }

            newSlotDiv.innerHTML = contentHtml;
            imagePitchContainer.appendChild(newSlotDiv);
        }
    });

    allBenchSlots.forEach(benchSlot => {
        const benchSlotContent = benchSlot.querySelector('.bench-player-wrapper, .bench-profile-wrapper, .bench-slot-placeholder');
        if (benchSlotContent) {
            const newBenchSlotDiv = document.createElement('div');
            newBenchSlotDiv.className = 'image-bench-slot';

            let contentHtml = '';
            if (benchSlotContent.classList.contains('bench-player-wrapper') || benchSlotContent.classList.contains('bench-profile-wrapper')) {
                const type = benchSlotContent.dataset.itemType;
                const name = benchSlotContent.dataset[`${type}Name`];
                let icon = benchSlotContent.dataset[`${type}Icon`];

                if (icon && !icon.startsWith('assets/images/')) {
                    icon = `${BASE_URL}/api/proxy/image?imageUrl=${icon}`;
                }

                contentHtml = `
                    <div class="image-bench-player-content">
                        <img src="${icon}" alt="${name}">
                        <span>${name}</span>
                    </div>
                `;
            } else if (benchSlotContent.classList.contains('bench-slot-placeholder')) {
                contentHtml = `
                    <div class="image-bench-player-content">
                        <img src="${DEFAULT_PLAYER_PHOTO}" alt="Empty Bench">
                        <span>Empty Bench</span>
                    </div>
                `;
            }

            newBenchSlotDiv.innerHTML = contentHtml;
            imageBenchArea.appendChild(newBenchSlotDiv);
        }
    });

    try {
        const canvas = await html2canvas(imageGenerationContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });

        const imgDataUrl = canvas.toDataURL('image/png');
        const imgElement = generatedImageView.querySelector('img');
        if (imgElement) {
            imgElement.src = imgDataUrl;
        }

        imageGenerationContainer.remove();

    } catch (error) {
        console.error("Error while generating image: ", error);
        alert("Error while generating image. Please try again.");
        if (imageGenerationContainer) {
            imageGenerationContainer.remove();
        }
    }
}

export function downloadImage() {
    const imgElement = generatedImageView.querySelector('img');
    if (imgElement && imgElement.src) {
        const link = document.createElement('a');
        link.href = imgElement.src;
        link.download = `my-team-formation-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Does not found any image to download.");
    }
}

export function shareToTwitter() {
    const imgElement = generatedImageView.querySelector('img');
    if (imgElement && imgElement.src) {
        const text = encodeURIComponent(`Tak?m Formasyonumu inceleyin: ${teamNameInput.value || "Tak?m?m"} - ${AppState.currentFormation}. #FutbolFormasyon #Taktik`);
        const url = encodeURIComponent(window.location.href);

        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
    } else {
        alert("Does not found any image to share.");
    }
}

export function shareToFacebook() {
    const imgElement = generatedImageView.querySelector('img');
    if (imgElement && imgElement.src) {
        const imageUrl = encodeURIComponent(imgElement.src);
        const url = encodeURIComponent(window.location.href);

        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&picture=${imageUrl}`, '_blank', 'width=600,height=400');
    } else {
        alert("Does not found any image to share.");
    }
}

export function copyImageToClipboard() {
    const imgElement = generatedImageView.querySelector('img');
    if (imgElement && imgElement.src) {
        fetch(imgElement.src)
            .then(res => res.blob())
            .then(blob => {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => {
                    alert("Copy image to clipboard successfully.");
                }).catch(err => {
                    console.error("Error while copying image to clipboard: ", err);
                    alert("Error while copying image to clipboard. Browser does not support clipboard API. Please try to download the image instead.");
                });
            })
            .catch(err => {
                console.error('Copy image URL to clipboard failed:', err);
                alert("Copy image URL to clipboard failed. Please try to download the image instead.");
            });
    } else {
        alert("Does not found any image to copy.");
    }
}