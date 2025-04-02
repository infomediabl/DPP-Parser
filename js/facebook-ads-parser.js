document.addEventListener('DOMContentLoaded', function() {
    const jsonFileInput = document.getElementById('jsonFileInput');
    const fileName = document.getElementById('fileName');
    const tableBody = document.querySelector('#jsonTable tbody');
    const downloadButton = document.getElementById('downloadCSV');
    const topAdsSection = document.getElementById('topAdsSection');
    const topAdsGrid = document.getElementById('topAdsGrid');
    let currentData = [];
    let currentSort = { column: null, direction: 'asc' };
    
    // Add click handlers for sorting
    const tableHeaders = document.querySelectorAll('#jsonTable th');
    tableHeaders.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => sortTable(index));
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
                console.log('Parsed JSON data:', jsonData); // Debug log
                
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
                        // Store original item for top ads display
                        originalItem: item
                    };
                    
                    currentData.push(rowData);
                });

                // Sort by duration and get top 20
                const topAds = [...currentData]
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 20);

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
            console.log('Processing ad:', ad);
            
            const adCard = document.createElement('div');
            adCard.className = 'ad-card';

            // Get media content (image or video)
            let mediaContent = '';
            const snapshot = ad.originalItem.snapshot;
            
            // Check for image in snapshot.body.cards
            if (snapshot?.body?.cards?.[0]?.original_image_url) {
                mediaContent = `<img src="${snapshot.body.cards[0].original_image_url}" alt="Ad Image">`;
            } 
            // Check for image in snapshot.images
            else if (snapshot?.images?.[0]?.original_image_url) {
                mediaContent = `<img src="${snapshot.images[0].original_image_url}" alt="Ad Image">`;
            }
            // Check for video in snapshot.body.cards
            else if (snapshot?.body?.cards?.[0]?.video_hd_url) {
                mediaContent = `<video controls><source src="${snapshot.body.cards[0].video_hd_url}" type="video/mp4">Your browser does not support the video tag.</video>`;
            }
            // Check for video in snapshot.videos
            else if (snapshot?.videos?.[0]?.video_hd_url) {
                mediaContent = `<video controls><source src="${snapshot.videos[0].video_hd_url}" type="video/mp4">Your browser does not support the video tag.</video>`;
            }

            // Get original image URL if it exists (checking both locations)
            const originalImage = snapshot?.body?.cards?.[0]?.original_image_url 
                ? `<div class="original-image"><a href="${snapshot.body.cards[0].original_image_url}" target="_blank"><img src="${snapshot.body.cards[0].original_image_url}" alt="Original Ad Image"></a></div>`
                : snapshot?.images?.[0]?.original_image_url
                    ? `<div class="original-image"><a href="${snapshot.images[0].original_image_url}" target="_blank"><img src="${snapshot.images[0].original_image_url}" alt="Original Ad Image"></a></div>`
                    : '';

            // Get video HD URL if it exists (checking both locations)
            const videoHD = snapshot?.body?.cards?.[0]?.video_hd_url 
                ? `<div class="video-hd">
                    <video controls>
                        <source src="${snapshot.body.cards[0].video_hd_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <a href="${snapshot.body.cards[0].video_hd_url}" target="_blank" class="video-link">Download HD Video</a>
                   </div>`
                : snapshot?.videos?.[0]?.video_hd_url
                    ? `<div class="video-hd">
                        <video controls>
                            <source src="${snapshot.videos[0].video_hd_url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <a href="${snapshot.videos[0].video_hd_url}" target="_blank" class="video-link">Download HD Video</a>
                       </div>`
                    : '';

            // Get ad text from body
            const adText = snapshot?.body?.text || '-';

            adCard.innerHTML = `
                ${originalImage}
                <h3>Ad ID: ${ad.adId}</h3>
                ${videoHD}
                <div class="ad-content">
                    <p><strong>Ad Text:</strong> ${adText}</p>
                    <p><strong>Card Titles:</strong> ${ad.cardTitles}</p>
                    <p><strong>Card Bodies:</strong> ${ad.cardBodies}</p>
                </div>
                ${mediaContent ? `<div class="ad-media">${mediaContent}</div>` : ''}
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
            ...currentData.map(row => [
                row.adId,
                row.startDate,
                row.endDate,
                row.duration,
                row.adText,
                row.cardTitles,
                row.cardBodies,
                row.cardLinks.replace(/<[^>]*>/g, ''),
                row.headline,
                row.description,
                row.ctaText,
                row.platform
            ].map(cell => {
                const cleanCell = cell.toString().replace(/"/g, '""');
                return `"${cleanCell}"`;
            }).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facebook_ads_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

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
                row.platform
            ].map(cell => `<td>${cell}</td>`).join('');
            tableBody.appendChild(tr);
        });
    }
}); 
