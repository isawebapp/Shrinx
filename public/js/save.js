const form = document.getElementById('pathForm');
const messageContainer = document.createElement('div');
messageContainer.style.marginTop = '10px';
messageContainer.style.color = 'red';
form.appendChild(messageContainer);

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
        window.location.href = `/success.html?path=${result.data.path}&domain=${result.data.domain}&redirectUrl=${result.data.redirectUrl}`;
    } else {
        messageContainer.textContent = result.message;
        if (window.turnstile) {
            turnstile.reset();
        }
    }
});
