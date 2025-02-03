fetch('/api/domains')
    .then(response => response.json())
    .then(data => {
        const selectElement = document.getElementById('domain');
        data.domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            selectElement.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading domains:', error));
