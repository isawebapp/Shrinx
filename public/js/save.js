const form = document.getElementById('pathForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const path = document.getElementById('path').value;
    const domain = document.getElementById('domain').value;
    const redirectUrl = document.getElementById('redirectUrl').value;
    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;

    const response = await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, domain, redirectUrl, turnstileResponse }),
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        loadEntries();
        form.reset();
    } else {
        alert(result.message);
    }
});