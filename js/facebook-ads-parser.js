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

    // Add click handlers for sorting
    tableHeaders.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => sortTable(index));
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

    // Handle file upload
    jsonFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Display file name
        fileName.textContent = `Selected file: ${file.name}`;

        // Read file content
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
                    // Format dates
                    const startDate = formatDate(item.start_date);
                    const endDate = formatDate(item.end_date);
                    
                    // Calculate duration
                    let duration = '-';
                    if (item.start_date && item.end_date) {
                        const start = new Date(item.start_date * 1000);
                        const end = new Date(item.end_date * 1000);
                        const diffTime = Math.abs(end - start);
                        duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    // Process card titles
                    const cardTitles = item.snapshot?.cards
                        ? Array.from(new Set(item.snapshot.cards
                            .map(card => card?.title)
                            .filter(title => title)))
                        : [];

                    // Process card bodies
                    const cardBodies = item.snapshot?.cards
                        ? Array.from(new Set(item.snapshot.cards
                            .map(card => {
                                if (!card) return '';
                                if (card.body?.text) return card.body.text;
                                if (typeof card.body === 'string') return card.body;
                                return '';
                            })
                            .filter(body => body)))
                        : [];

                    // Process card links
                    const cardLinks = item.snapshot?.cards
                        ? Array.from(new Set(item.snapshot.cards
                            .map(card => card?.link_url)
                            .filter(link => link)))
                        : [];

                    // Create row data array
                    const rowData = {
                        adId: item.ad_archive_id || '-',
                        startDate,
                        endDate,
                        duration: parseInt(duration) || 0,
                        adText: item.snapshot?.body?.text || '-',
                        cardTitles: cardTitles.join('\n') || '-',
                        cardBodies: cardBodies.join('\n') || '-',
                        cardLinks: cardLinks.map(link => `<a href="${link}" target="_blank">LINK</a>`).join('\n') || '-',
                        headline: item.snapshot?.title || '-',
                        description: item.snapshot?.caption || '-',
                        ctaText: item.snapshot?.cta_text || '-',
                        platform: item.publisher_platform || '-',
                        snapshotLink: item.snapshot?.link_url ? `<a href="${item.snapshot.link_url}" target="_blank">LINK</a>` : '-',
                        // Store original item for top ads display
                        originalItem: item
                    };
                    
                    currentData.push(rowData);
                });

                // Sort by duration and get top 50
                const topAds = [...currentData]
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 50);

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

        ads.forEach(ad => {
            console.log('Processing ad:', ad);
            
            const adCard = document.createElement('div');
            adCard.className = 'ad-card';

            // Get media content (image or video)
            let mediaContent = '';
            const snapshot = ad.originalItem.snapshot;
            
            // Function to get image URL from various possible locations
            function findImageUrl() {
                // Check in snapshot.images array
                if (snapshot?.images?.[0]?.original_image_url) {
                    return snapshot.images[0].original_image_url;
                }
                // Check in snapshot.body.cards
                if (snapshot?.body?.cards?.[0]?.original_image_url) {
                    return snapshot.body.cards[0].original_image_url;
                }
                // Check in snapshot.cards
                if (snapshot?.cards?.[0]?.original_image_url) {
                    return snapshot.cards[0].original_image_url;
                }
                // Check in snapshot.body.images
                if (snapshot?.body?.images?.[0]?.original_image_url) {
                    return snapshot.body.images[0].original_image_url;
                }
                return null;
            }

            // Function to get video URL from various possible locations
            function findVideoUrl() {
                // Check in snapshot.videos array
                if (snapshot?.videos?.[0]?.video_hd_url) {
                    return snapshot.videos[0].video_hd_url;
                }
                // Check in snapshot.body.cards
                if (snapshot?.body?.cards?.[0]?.video_hd_url) {
                    return snapshot.body.cards[0].video_hd_url;
                }
                // Check in snapshot.cards
                if (snapshot?.cards?.[0]?.video_hd_url) {
                    return snapshot.cards[0].video_hd_url;
                }
                // Check in snapshot.body.videos
                if (snapshot?.body?.videos?.[0]?.video_hd_url) {
                    return snapshot.body.videos[0].video_hd_url;
                }
                return null;
            }

            // Get image and video URLs
            const imageUrl = findImageUrl();
            const videoUrl = findVideoUrl();

            // Create media content based on what's available
            if (imageUrl) {
                mediaContent = `<img src="${imageUrl}" alt="Ad Image">`;
            } else if (videoUrl) {
                mediaContent = `<video controls><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
            }

            // Get original image URL if it exists
            const originalImage = imageUrl 
                ? `<div class="original-image"><a href="${imageUrl}" target="_blank"><img src="${imageUrl}" alt="Original Ad Image"></a></div>`
                : '';

            // Get video HD URL if it exists
            const videoHD = videoUrl
                ? `<div class="video-hd">
                    <video controls>
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <a href="${videoUrl}" target="_blank" class="video-link">Download HD Video</a>
                   </div>`
                : '';

            // Get ad text from various possible locations
            const adText = snapshot?.body?.text || 
                         snapshot?.text || 
                         snapshot?.body?.cards?.[0]?.body?.text ||
                         snapshot?.cards?.[0]?.body?.text || 
                         '-';

            // Get card titles and bodies
            const cardTitles = ad.cardTitles || '-';
            const cardBodies = ad.cardBodies || '-';

            // Add snapshot link to the ad card
            const snapshotLink = snapshot?.link_url 
                ? `<p><strong>Snapshot Link:</strong> <a href="${snapshot.link_url}" target="_blank">LINK</a></p>`
                : '';

            adCard.innerHTML = `
                ${originalImage}
                <h3>Ad ID: ${ad.adId}</h3>
                ${videoHD}
                <div class="ad-content">
                    <p><strong>Ad Text:</strong> ${adText}</p>
                    <p><strong>Card Titles:</strong> ${cardTitles}</p>
                    <p><strong>Card Bodies:</strong> ${cardBodies}</p>
                    ${snapshotLink}
                </div>
                ${mediaContent ? `<div class="ad-media">${mediaContent}</div>` : ''}
                <div class="ad-duration">Duration: ${ad.duration} days</div>
            `;

            topAdsGrid.appendChild(adCard);
        });

        // Display JSON data
        const jsonDisplaySection = document.getElementById('jsonDisplaySection');
        const jsonDisplay = document.getElementById('jsonDisplay');
        
        // Create a clean version of the ads data for JSON display
        const cleanAdsData = ads.map(ad => {
            const snapshot = ad.originalItem.snapshot;

            // Function to get image URL from various possible locations
            function findImageUrl() {
                // Check in snapshot.images array
                if (snapshot?.images?.[0]?.original_image_url) {
                    return snapshot.images[0].original_image_url;
                }
                // Check in snapshot.body.cards
                if (snapshot?.body?.cards?.[0]?.original_image_url) {
                    return snapshot.body.cards[0].original_image_url;
                }
                // Check in snapshot.cards
                if (snapshot?.cards?.[0]?.original_image_url) {
                    return snapshot.cards[0].original_image_url;
                }
                // Check in snapshot.body.images
                if (snapshot?.body?.images?.[0]?.original_image_url) {
                    return snapshot.body.images[0].original_image_url;
                }
                return null;
            }

            // Function to get video URL from various possible locations
            function findVideoUrl() {
                // Check in snapshot.videos array
                if (snapshot?.videos?.[0]?.video_hd_url) {
                    return snapshot.videos[0].video_hd_url;
                }
                // Check in snapshot.body.cards
                if (snapshot?.body?.cards?.[0]?.video_hd_url) {
                    return snapshot.body.cards[0].video_hd_url;
                }
                // Check in snapshot.cards
                if (snapshot?.cards?.[0]?.video_hd_url) {
                    return snapshot.cards[0].video_hd_url;
                }
                // Check in snapshot.body.videos
                if (snapshot?.body?.videos?.[0]?.video_hd_url) {
                    return snapshot.body.videos[0].video_hd_url;
                }
                return null;
            }

            // Function to extract URLs from text and return both clean text and URLs
            function extractUrls(text) {
                if (!text || text === '-') return { text: '-', urls: [] };

                // URL regex pattern
                const urlPattern = /(https?:\/\/[^\s]+)/g;
                const urls = text.match(urlPattern) || [];
                const cleanText = text.replace(urlPattern, '').trim();

                return {
                    text: cleanText || '-',
                    urls: urls
                };
            }

            // Create a new object with only the fields we want
            const cleanAd = {
                adId: ad.adId,
                duration: ad.duration,
                adText: snapshot?.body?.text || 
                       snapshot?.text || 
                       snapshot?.body?.cards?.[0]?.body?.text ||
                       snapshot?.cards?.[0]?.body?.text || 
                       '-',
                cardTitles: ad.cardTitles || '-',
                cardBodies: ad.cardBodies || '-',
                headline: snapshot?.title || '-',
                description: snapshot?.caption || '-',
                ctaText: ad.ctaText,
                platform: ad.platform,
                snapshotLink: snapshot?.link_url || null,
                // Extract URLs from text fields
                adTextUrl: extractUrls(ad.adText).urls.join(' ') || null,
                cardTitlesUrl: extractUrls(ad.cardTitles).urls.join(' ') || null,
                cardBodiesUrl: extractUrls(ad.cardBodies).urls.join(' ') || null,
                headlineUrl: extractUrls(ad.headline).urls.join(' ') || null,
                descriptionUrl: extractUrls(ad.description).urls.join(' ') || null,
                mediaUrls: {
                    imageUrl: findImageUrl(),
                    videoUrl: findVideoUrl()
                }
            };

            // Remove null URL fields
            Object.keys(cleanAd).forEach(key => {
                if (key.endsWith('Url') && !cleanAd[key]) {
                    delete cleanAd[key];
                }
            });

            return cleanAd;
        });

        // Display the JSON with formatting
        jsonDisplaySection.style.display = 'block';
        jsonDisplay.textContent = JSON.stringify(cleanAdsData, null, 2);
    }

    // Format Unix timestamp to readable date
    function formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

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
            if (columnIndex === 3) { // Duration column
                aValue = aValue === '-' ? 0 : parseInt(aValue);
                bValue = bValue === '-' ? 0 : parseInt(bValue);
            } else if (columnIndex === 0 || columnIndex === 1 || columnIndex === 2) { // Date columns
                aValue = aValue === '-' ? '0' : aValue;
                bValue = bValue === '-' ? '0' : bValue;
            }

            // Compare values
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Update display
        updateTableDisplay();
    }

    // Update table display
    function updateTableDisplay() {
        tableBody.innerHTML = '';
        currentData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = [
                row.adId,
                row.startDate,
                row.endDate,
                row.duration,
                row.adText,
                row.cardTitles,
                row.cardBodies,
                row.cardLinks,
                row.headline,
                row.description,
                row.ctaText,
                row.platform,
                row.snapshotLink
            ].map(cell => `<td>${cell}</td>`).join('');
            tableBody.appendChild(tr);
        });
    }
}); 
