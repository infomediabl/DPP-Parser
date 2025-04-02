document.addEventListener('DOMContentLoaded', function() {
    const jsonFileInput = document.getElementById('jsonFileInput');
    const fileName = document.getElementById('fileName');
    let dataTable = null;
    
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
                const data = Array.isArray(jsonData) ? jsonData : [jsonData];
                
                // Destroy existing DataTable if it exists
                if (dataTable) {
                    dataTable.destroy();
                }

                // Initialize DataTable
                dataTable = $('#jsonTable').DataTable({
                    data: data,
                    responsive: true,
                    columns: Object.keys(data[0]).map(key => ({
                        title: formatHeader(key),
                        data: key,
                        render: function(data, type, row) {
                            return formatCellValue(data);
                        }
                    })),
                    pageLength: 10,
                    order: [[0, 'asc']],
                    dom: '<"top"lf>rt<"bottom"ip><"clear">',
                    language: {
                        search: "Search:",
                        lengthMenu: "Show _MENU_ entries",
                        info: "Showing _START_ to _END_ of _TOTAL_ entries",
                        infoEmpty: "Showing 0 to 0 of 0 entries",
                        infoFiltered: "(filtered from _MAX_ total entries)",
                        paginate: {
                            first: "First",
                            last: "Last",
                            next: "Next",
                            previous: "Previous"
                        }
                    }
                });
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
                if (dataTable) {
                    dataTable.destroy();
                    dataTable = null;
                }
            }
        };
        reader.readAsText(file);
    });

    // Format header text
    function formatHeader(header) {
        return header
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    // Format cell value
    function formatCellValue(value) {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return String(value);
    }
}); 