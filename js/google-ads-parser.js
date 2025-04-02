document.addEventListener('DOMContentLoaded', function() {
    const jsonFileInput = document.getElementById('jsonFileInput');
    const fileName = document.getElementById('fileName');
    const tableBody = document.querySelector('#jsonTable tbody');
    const tableHeaders = document.querySelectorAll('#jsonTable th');
    const topAdsSection = document.getElementById('topAdsSection');
    const topAdsGrid = document.getElementById('topAdsGrid');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    let currentData = [];
    let currentSort = { column: null, direction: 'asc' };
    
    // Add sorting functionality to headers
    tableHeaders.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            sortTable(index);
        });
    });

    // Add copy functionality
    copyJsonBtn.addEventListener('click', async function() {
        const jsonDisplay = document.getElementById('jsonDisplay');
        try {
            await navigator.clipboard.writeText(jsonDisplay.textContent);
            
            // Visual feedback
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            this.style.backgroundColor = '#45a049';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = '#4CAF50';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard');
        }
    });

    // Sort table function
    function sortTable(columnIndex) {
        const direction = currentSort.column === columnIndex && currentSort.direction === 'asc' ? 'desc' : 'asc';
        currentSort = { column: columnIndex, direction };

        // Update sort indicators
        tableHeaders.forEach((header, index) => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (index === columnIndex) {
                header.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });

        // Sort the data
        currentData.sort((a, b) => {
            let aValue = a[columnIndex];
            let bValue = b[columnIndex];

            // Handle special cases
            if (columnIndex === 6) { // Duration column
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
            } else if (columnIndex === 7) { // Impressions column
                aValue = parseInt(aValue.split('-')[0]) || 0;
                bValue = parseInt(bValue.split('-')[0]) || 0;
            } else if (columnIndex === 4 || columnIndex === 5) { // Date columns
                aValue = aValue === '-' ? '9999-12-31' : aValue;
                bValue = bValue === '-' ? '9999-12-31' : bValue;
            }

            // Compare values
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Update table display
        updateTableDisplay();
    }

    // Update table display
    function updateTableDisplay() {
        tableBody.innerHTML = '';
        currentData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.creativeId}</td>
                <td>${row.advertiserName}</td>
                <td>${row.advertiserId}</td>
                <td>${row.format}</td>
                <td>${row.firstShown}</td>
                <td>${row.lastShown}</td>
                <td>${row.duration}</td>
                <td>${row.impressions}</td>
                <td>${row.platforms}</td>
                <td>${row.cta}</td>
                <td>${row.description}</td>
                <td>${row.regions}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
    
    // Utility function to shorten platform names
    function shortenPlatform(platform) {
        const platformMap = {
            'FACEBOOK': 'FB',
            'INSTAGRAM': 'IG',
            'MESSENGER': 'MSG',
            'WHATSAPP': 'WA',
            'AUDIENCE_NETWORK': 'AN',
            'GOOGLE': 'GG',
            'GOOGLE_SEARCH': 'G Search',
            'SEARCH_PARTNERS': 'Search P',
            'DISPLAY': 'Display',
            'YOUTUBE': 'YT',
            'GMAIL': 'Gmail',
            'DISCOVERY': 'Discov',
            'SHOPPING': 'Shop',
            'PERFORMANCE_MAX': 'Perf Max'
        };

        // If platform is an array, map each item
        if (Array.isArray(platform)) {
            return platform.map(p => platformMap[p.toUpperCase()] || p).join(', ');
        }

        // If platform is a string
        return platformMap[platform.toUpperCase()] || platform;
    }

    // Utility function to convert country names to ISO codes
    function convertToCountryCodes(countries) {
        const countryMap = {
            'AFGHANISTAN': 'AF', 'ALBANIA': 'AL', 'ALGERIA': 'DZ', 'ANDORRA': 'AD', 'ANGOLA': 'AO',
            'ARGENTINA': 'AR', 'ARMENIA': 'AM', 'AUSTRALIA': 'AU', 'AUSTRIA': 'AT', 'AZERBAIJAN': 'AZ',
            'BAHRAIN': 'BH', 'BANGLADESH': 'BD', 'BELARUS': 'BY', 'BELGIUM': 'BE', 'BELIZE': 'BZ',
            'BENIN': 'BJ', 'BHUTAN': 'BT', 'BOLIVIA': 'BO', 'BOSNIA': 'BA', 'BRAZIL': 'BR',
            'BULGARIA': 'BG', 'CAMBODIA': 'KH', 'CAMEROON': 'CM', 'CANADA': 'CA', 'CHILE': 'CL',
            'CHINA': 'CN', 'COLOMBIA': 'CO', 'CONGO': 'CG', 'COSTA RICA': 'CR', 'CROATIA': 'HR',
            'CUBA': 'CU', 'CYPRUS': 'CY', 'CZECH REPUBLIC': 'CZ', 'DENMARK': 'DK', 'ECUADOR': 'EC',
            'EGYPT': 'EG', 'ESTONIA': 'EE', 'ETHIOPIA': 'ET', 'FIJI': 'FJ', 'FINLAND': 'FI',
            'FRANCE': 'FR', 'GEORGIA': 'GE', 'GERMANY': 'DE', 'GHANA': 'GH', 'GREECE': 'GR',
            'GUATEMALA': 'GT', 'HAITI': 'HT', 'HONDURAS': 'HN', 'HONG KONG': 'HK', 'HUNGARY': 'HU',
            'ICELAND': 'IS', 'INDIA': 'IN', 'INDONESIA': 'ID', 'IRAN': 'IR', 'IRAQ': 'IQ',
            'IRELAND': 'IE', 'ISRAEL': 'IL', 'ITALY': 'IT', 'JAMAICA': 'JM', 'JAPAN': 'JP',
            'JORDAN': 'JO', 'KAZAKHSTAN': 'KZ', 'KENYA': 'KE', 'KUWAIT': 'KW', 'LATVIA': 'LV',
            'LEBANON': 'LB', 'LIBYA': 'LY', 'LIECHTENSTEIN': 'LI', 'LITHUANIA': 'LT', 'LUXEMBOURG': 'LU',
            'MACEDONIA': 'MK', 'MADAGASCAR': 'MG', 'MALAYSIA': 'MY', 'MALDIVES': 'MV', 'MALTA': 'MT',
            'MEXICO': 'MX', 'MOLDOVA': 'MD', 'MONACO': 'MC', 'MONGOLIA': 'MN', 'MONTENEGRO': 'ME',
            'MOROCCO': 'MA', 'MYANMAR': 'MM', 'NEPAL': 'NP', 'NETHERLANDS': 'NL', 'NEW ZEALAND': 'NZ',
            'NICARAGUA': 'NI', 'NIGERIA': 'NG', 'NORTH KOREA': 'KP', 'NORWAY': 'NO', 'OMAN': 'OM',
            'PAKISTAN': 'PK', 'PANAMA': 'PA', 'PARAGUAY': 'PY', 'PERU': 'PE', 'PHILIPPINES': 'PH',
            'POLAND': 'PL', 'PORTUGAL': 'PT', 'QATAR': 'QA', 'ROMANIA': 'RO', 'RUSSIA': 'RU',
            'SAUDI ARABIA': 'SA', 'SENEGAL': 'SN', 'SERBIA': 'RS', 'SINGAPORE': 'SG', 'SLOVAKIA': 'SK',
            'SLOVENIA': 'SI', 'SOUTH AFRICA': 'ZA', 'SOUTH KOREA': 'KR', 'SPAIN': 'ES', 'SRI LANKA': 'LK',
            'SWEDEN': 'SE', 'SWITZERLAND': 'CH', 'SYRIA': 'SY', 'TAIWAN': 'TW', 'TAJIKISTAN': 'TJ',
            'THAILAND': 'TH', 'TUNISIA': 'TN', 'TURKEY': 'TR', 'TURKMENISTAN': 'TM', 'UKRAINE': 'UA',
            'UNITED ARAB EMIRATES': 'AE', 'UNITED KINGDOM': 'GB', 'UNITED STATES': 'US', 'URUGUAY': 'UY',
            'UZBEKISTAN': 'UZ', 'VATICAN CITY': 'VA', 'VENEZUELA': 'VE', 'VIETNAM': 'VN', 'YEMEN': 'YE',
            'ZAMBIA': 'ZM', 'ZIMBABWE': 'ZW'
        };

        // If countries is an array, map each item
        if (Array.isArray(countries)) {
            return countries.map(country => {
                const upperCountry = country.toUpperCase();
                return countryMap[upperCountry] || country;
            }).join(', ');
        }

        // If countries is a string
        const upperCountry = countries.toUpperCase();
        return countryMap[upperCountry] || countries;
    }

    // Handle file upload
    jsonFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        fileName.textContent = `Selected file: ${file.name}`;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log('Parsed JSON data:', jsonData);
                
                // Clear existing content
                tableBody.innerHTML = '';
                topAdsGrid.innerHTML = '';
                currentData = [];

                // Process and display the data
                jsonData.forEach(item => {
                    console.log('Processing item:', item);
                    
                    // Get the earliest firstShown and latest lastShown from regionStats
                    let firstShown = null;
                    let lastShown = null;
                    let impressions = { lowerBound: 0, upperBound: 0 };
                    let platforms = new Set();

                    if (item.regionStats && Array.isArray(item.regionStats)) {
                        item.regionStats.forEach(stat => {
                            // Update firstShown
                            if (stat.firstShown) {
                                const date = new Date(stat.firstShown);
                                if (!firstShown || date < new Date(firstShown)) {
                                    firstShown = stat.firstShown;
                                }
                            }

                            // Update lastShown
                            if (stat.lastShown) {
                                const date = new Date(stat.lastShown);
                                if (!lastShown || date > new Date(lastShown)) {
                                    lastShown = stat.lastShown;
                                }
                            }

                            // Add impressions
                            if (stat.impressions) {
                                impressions.lowerBound += stat.impressions.lowerBound || 0;
                                impressions.upperBound += stat.impressions.upperBound || 0;
                            }

                            // Add platforms from surfaceServingStats
                            if (stat.surfaceServingStats && Array.isArray(stat.surfaceServingStats)) {
                                stat.surfaceServingStats.forEach(surface => {
                                    if (surface.surfaceName) {
                                        platforms.add(surface.surfaceName);
                                    }
                                });
                            }
                        });
                    }

                    // Calculate duration
                    let duration = '-';
                    if (firstShown && lastShown) {
                        const start = new Date(firstShown);
                        const end = new Date(lastShown);
                        const diffTime = Math.abs(end - start);
                        duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    // Get CTA and description from variations
                    const cta = item.variations?.[0]?.cta || '-';
                    const description = item.variations?.[0]?.description || '-';
                    const previewUrl = item.previewUrl || '#';

                    // Get distinct headlines from variations
                    const headlines = item.variations
                        ? Array.from(new Set(item.variations
                            .map(variation => variation?.headline)
                            .filter(headline => headline)))
                        : [];

                    // Create row data array
                    const rowData = {
                        creativeId: item.creativeId || '-',
                        advertiserName: item.advertiserName || '-',
                        advertiserId: item.advertiserId || '-',
                        format: item.format || '-',
                        firstShown: formatDate(firstShown),
                        lastShown: formatDate(lastShown),
                        duration: parseInt(duration) || 0,
                        impressions: `${impressions.lowerBound}-${impressions.upperBound}`,
                        platforms: Array.from(platforms).map(shortenPlatform).join(', ') || '-',
                        cta: cta,
                        description: description,
                        previewUrl: previewUrl,
                        headlines: headlines.length > 0 ? `#${headlines.join('#')}#` : '-',
                        regions: (item.creativeRegions || []).map(convertToCountryCodes).join(', ') || '-',
                        // Store original item for top ads display
                        originalItem: item
                    };
                    
                    currentData.push(rowData);
                });

                console.log('Processed data:', currentData);

                // Sort by duration and get top 50
                const topAds = [...currentData]
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 50);

                console.log('Top 50 ads:', topAds);

                // Display top 50 ads
                displayTopAds(topAds);

                // Initial table display
                updateTableDisplay();

            } catch (error) {
                console.error('Error:', error);
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    });

    // Display top 50 ads
    function displayTopAds(ads) {
        topAdsSection.style.display = 'block';
        topAdsGrid.innerHTML = '';

        // Display the grid cards
        ads.forEach(ad => {
            console.log('Displaying ad:', ad);
            
            const adCard = document.createElement('div');
            adCard.className = 'ad-card';

            // Get image URL from previewUrl
            const imageUrl = ad.originalItem.previewUrl || '-';

            // Get headlines and descriptions
            const headlines = ad.originalItem.variations
                ? Array.from(new Set(ad.originalItem.variations
                    .map(variation => variation?.headline)
                    .filter(headline => headline)))
                : [];

            const descriptions = ad.originalItem.variations
                ? Array.from(new Set(ad.originalItem.variations
                    .map(variation => variation?.description)
                    .filter(description => description)))
                : [];

            // Get click URL
            const clickUrl = ad.originalItem.variations?.[0]?.clickUrl || '-';

            console.log('Ad media:', {
                imageUrl,
                headlines,
                descriptions,
                clickUrl
            });

            adCard.innerHTML = `
                ${imageUrl !== '-' ? `
                    <div class="original-image">
                        <a href="${imageUrl}" target="_blank">
                            <img src="${imageUrl}" alt="Ad Preview">
                        </a>
                    </div>
                ` : ''}
                <div class="ad-links">
                    <p><strong>Click URL:</strong> <a href="${clickUrl}" target="_blank">${clickUrl}</a></p>
                </div>
                <h3>Creative ID: ${ad.creativeId}</h3>
                <div class="ad-content">
                    <p><strong>Headlines:</strong> ${headlines.join(' # ')}</p>
                    <p><strong>Descriptions:</strong> ${descriptions.join(' # ')}</p>
                    <p><strong>Advertiser:</strong> ${ad.advertiserName}</p>
                    <p><strong>Format:</strong> ${ad.format}</p>
                </div>
                <div class="ad-duration">Duration: ${ad.duration} days</div>
            `;

            topAdsGrid.appendChild(adCard);
        });

        // Display JSON data
        const jsonDisplaySection = document.getElementById('jsonDisplaySection');
        const jsonDisplay = document.getElementById('jsonDisplay');
        
        // Create a clean version of the ads data for JSON display
        const cleanAdsData = ads.map(ad => {
            // Create a new object with only the fields we want
            const cleanAd = {
                creativeId: ad.creativeId,
                advertiserName: ad.advertiserName,
                advertiserId: ad.advertiserId,
                format: ad.format,
                duration: ad.duration,
                impressions: ad.impressions,
                platforms: ad.platforms,
                cta: ad.cta,
                description: ad.description,
                headlines: ad.headlines,
                regions: ad.regions,
                mediaUrls: {
                    previewUrl: ad.previewUrl || null,
                    imageUrl: ad.originalItem.previewUrl || null
                }
            };
            return cleanAd;
        });

        // Display the JSON with formatting
        jsonDisplaySection.style.display = 'block';
        jsonDisplay.textContent = JSON.stringify(cleanAdsData, null, 2);
    }

    // Format date to readable format
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}); 
