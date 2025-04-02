document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY = 'advertisers';
    const adsGrid = document.getElementById('adsGrid');
    const advertiserFilter = document.getElementById('advertiserFilter');
    const countryFilter = document.getElementById('countryFilter');
    const placementFilter = document.getElementById('placementFilter');
    const mediaTypeFilter = document.getElementById('mediaTypeFilter');

    // Load advertisers from localStorage
    function loadAdvertisers() {
        const advertisers = localStorage.getItem(STORAGE_KEY);
        return advertisers ? JSON.parse(advertisers) : [];
    }

    // Populate advertiser filter
    function populateAdvertiserFilter() {
        const advertisers = loadAdvertisers();
        advertisers.forEach(advertiser => {
            const option = document.createElement('option');
            option.value = advertiser.id;
            option.textContent = advertiser.advertiserName;
            advertiserFilter.appendChild(option);
        });
    }

    // Generate placeholder ads
    function generatePlaceholderAds() {
        const advertisers = loadAdvertisers();
        const placeholderAds = [];

        // Generate 6 placeholder ads
        for (let i = 0; i < 6; i++) {
            const advertiser = advertisers[Math.floor(Math.random() * advertisers.length)];
            placeholderAds.push({
                id: `placeholder-${i}`,
                advertiserName: advertiser ? advertiser.advertiserName : 'Sample Advertiser',
                country: advertiser ? advertiser.mainCountry : 'DE',
                placement: advertiser ? advertiser.mainPlacement : 'facebook',
                mediaType: Math.random() > 0.5 ? 'image' : 'video',
                title: `Sample Ad ${i + 1}`,
                description: 'This is a placeholder ad for demonstration purposes.',
                createdAt: new Date().toISOString()
            });
        }

        return placeholderAds;
    }

    // Create ad card HTML
    function createAdCard(ad) {
        return `
            <div class="ad-card">
                <div class="ad-media ${ad.mediaType === 'image' ? 'placeholder' : ''}">
                    ${ad.mediaType === 'image' ? 
                        '<img src="https://via.placeholder.com/300x200" alt="Ad Image">' : 
                        '<video src="https://via.placeholder.com/300x200.mp4" controls></video>'
                    }
                </div>
                <div class="ad-info">
                    <h3>${ad.title}</h3>
                    <div class="ad-meta">
                        <span>${ad.country}</span>
                        <span>${ad.placement}</span>
                        <span>${ad.mediaType}</span>
                    </div>
                    <div class="ad-details">
                        <p><strong>Advertiser:</strong> ${ad.advertiserName}</p>
                        <p><strong>Created:</strong> ${new Date(ad.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Filter ads based on selected filters
    function filterAds(ads) {
        const selectedAdvertiser = advertiserFilter.value;
        const selectedCountry = countryFilter.value;
        const selectedPlacement = placementFilter.value;
        const selectedMediaType = mediaTypeFilter.value;

        return ads.filter(ad => {
            const advertiserMatch = !selectedAdvertiser || ad.advertiserName === selectedAdvertiser;
            const countryMatch = !selectedCountry || ad.country === selectedCountry;
            const placementMatch = !selectedPlacement || ad.placement === selectedPlacement;
            const mediaTypeMatch = !selectedMediaType || ad.mediaType === selectedMediaType;

            return advertiserMatch && countryMatch && placementMatch && mediaTypeMatch;
        });
    }

    // Render filtered ads
    function renderAds() {
        const placeholderAds = generatePlaceholderAds();
        const filteredAds = filterAds(placeholderAds);
        
        adsGrid.innerHTML = filteredAds.length > 0 
            ? filteredAds.map(ad => createAdCard(ad)).join('')
            : '<div class="no-results">No ads found matching the selected filters.</div>';
    }

    // Event listeners for filters
    advertiserFilter.addEventListener('change', renderAds);
    countryFilter.addEventListener('change', renderAds);
    placementFilter.addEventListener('change', renderAds);
    mediaTypeFilter.addEventListener('change', renderAds);

    // Initial setup
    populateAdvertiserFilter();
    renderAds();
}); 
