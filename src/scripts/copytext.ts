document
	.getElementById('copyDiscord')
	?.addEventListener('click', async function (event: MouseEvent) {
		event.preventDefault();
		const button = this as HTMLElement;
		const username = button.getAttribute('discord-username');
		const icon = button.querySelector('svg')?.outerHTML || '';
		const originalText = button.querySelector('span')?.textContent || 'Discord';

		if (username && !button.classList.contains('animating')) {
			button.classList.add('animating');

			try {
				await navigator.clipboard.writeText(username);
				button.innerHTML = `${icon}<span>Copied!</span>`;
			} catch (error) {
				console.error('Error copying username to clipboard:', error);
				button.innerHTML = `${icon}<span>Failed to copy</span>`;
			}

			setTimeout(() => {
				button.innerHTML = `${icon}<span>${originalText}</span>`;
				button.classList.remove('animating');
			}, 1500);
		}
	});
