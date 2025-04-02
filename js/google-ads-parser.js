document.addEventListener('DOMContentLoaded', function() {
    const jsonFileInput = document.getElementById('jsonFileInput');
    const fileName = document.getElementById('fileName');
    const tableBody = document.querySelector('#jsonTable tbody');
    const tableHeaders = document.querySelectorAll('#jsonTable th');
    const downloadButton = document.getElementById('downloadCSV');
    const topAdsSection = document.getElementById('topAdsSection');
    const topAdsGrid = document.getElementById('topAdsGrid');
    let currentData = [];
    let currentSort = { column: null, direction: 'asc' };
    
    // Add sorting functionality to headers
    tableHeaders.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            sortTable(index);
        });
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
                        platforms: Array.from(platforms).join(', ') || '-',
                        cta: cta,
                        description: description,
                        previewUrl: previewUrl,
                        headlines: headlines.length > 0 ? `#${headlines.join('#')}#` : '-',
                        regions: (item.creativeRegions || []).join(', ') || '-',
                        // Store original item for top ads display
                        originalItem: item
                    };
                    
                    currentData.push(rowData);
                });

                console.log('Processed data:', currentData);

                // Sort by duration and get top 20
                const topAds = [...currentData]
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 20);

                console.log('Top 20 ads:', topAds);

                // Display top 20 ads
                displayTopAds(topAds);

                // Initial table display
                updateTableDisplay();
                downloadButton.disabled = false;

            } catch (error) {
                console.error('Error:', error);
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    });

    // Display top 20 ads
    function displayTopAds(ads) {
        topAdsSection.style.display = 'block';
        topAdsGrid.innerHTML = '';

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
    }

    // Download CSV functionality
    downloadButton.addEventListener('click', function() {
        if (!currentData.length) return;

        // Get headers from table
        const headers = Array.from(document.querySelectorAll('#jsonTable th')).map(th => th.textContent);
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...currentData.map(row => row.map(cell => {
                // Remove HTML tags and replace newlines with spaces for CSV
                const cleanCell = cell.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
                return `"${cleanCell.replace(/"/g, '""')}"`; // Escape quotes in CSV
            }).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `google_ads_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

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
