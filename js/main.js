document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('advertiserForm');
    const tableBody = document.getElementById('advertisersTableBody');
    let advertisers = JSON.parse(localStorage.getItem('advertisers')) || [];

    // Load existing advertisers
    function loadAdvertisers() {
        tableBody.innerHTML = '';
        advertisers.forEach((advertiser, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${advertiser.advertiserName}</td>
                <td>${advertiser.mainCountry}</td>
                <td>${advertiser.mainPlacement}</td>
                <td><a href="${advertiser.fbAdUrl}" target="_blank">FB Library</a></td>
                <td><a href="${advertiser.googleAdUrl}" target="_blank">Google Library</a></td>
                <td class="action-buttons">
                    <button class="btn btn-edit" onclick="editAdvertiser(${index})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteAdvertiser(${index})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Save advertiser
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const advertiser = {
            advertiserName: document.getElementById('advertiserName').value,
            fbAdUrl: document.getElementById('fbAdUrl').value,
            googleAdUrl: document.getElementById('googleAdUrl').value,
            mainCountry: document.getElementById('mainCountry').value,
            mainPlacement: document.getElementById('mainPlacement').value
        };

        advertisers.push(advertiser);
        localStorage.setItem('advertisers', JSON.stringify(advertisers));
        
        form.reset();
        loadAdvertisers();
    });

    // Edit advertiser
    window.editAdvertiser = function(index) {
        const advertiser = advertisers[index];
        document.getElementById('advertiserName').value = advertiser.advertiserName;
        document.getElementById('fbAdUrl').value = advertiser.fbAdUrl;
        document.getElementById('googleAdUrl').value = advertiser.googleAdUrl;
        document.getElementById('mainCountry').value = advertiser.mainCountry;
        document.getElementById('mainPlacement').value = advertiser.mainPlacement;

        advertisers.splice(index, 1);
        localStorage.setItem('advertisers', JSON.stringify(advertisers));
        loadAdvertisers();
    };

    // Delete advertiser
    window.deleteAdvertiser = function(index) {
        if (confirm('Are you sure you want to delete this advertiser?')) {
            advertisers.splice(index, 1);
            localStorage.setItem('advertisers', JSON.stringify(advertisers));
            loadAdvertisers();
        }
    };

    // Initial load
    loadAdvertisers();
}); 
