document
	.getElementById('copyDiscord')
	?.addEventListener('click', async function (event: MouseEvent) {
		event.preventDefault();
		const button = this as HTMLElement;
		const username = button.getAttribute('discord-username');
		const originalContent = button.innerHTML;

		if (username && !button.classList.contains('animating')) {
			button.classList.add('animating');

			try {
				await navigator.clipboard.writeText(username);
				showTemporaryMessage(button, 'Copied!', originalContent);
			} catch (error) {
				console.error('Error copying username to clipboard:', error);
				showTemporaryMessage(button, 'Failed to copy', originalContent, '#ff4444');
			}
		}
	});

function showTemporaryMessage(
	button: HTMLElement,
	message: string,
	originalContent: string,
	color: string = 'inherit'
) {
	const container = document.createElement('div');
	container.style.cssText = `
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		opacity: 0;
		transform: scale(0.8);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		text-decoration: none;
		color: ${color};
		font-size: 14px;
	`;
	container.textContent = message;

	button.innerHTML = '';
	button.appendChild(container);

	requestAnimationFrame(() => {
		container.style.opacity = '1';
		container.style.transform = 'scale(1)';
	});

	setTimeout(() => {
		container.style.opacity = '0';
		container.style.transform = 'scale(0.8)';

		setTimeout(() => {
			button.innerHTML = originalContent;
			button.classList.remove('animating');
		}, 300);
	}, 1000);
}
