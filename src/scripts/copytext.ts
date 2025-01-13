document.getElementById('copyDiscord')?.addEventListener('click', function (event: MouseEvent) {
	event.preventDefault();
	const button = this as HTMLElement;
	const username = button.getAttribute('discord-username');
	const originalContent = button.innerHTML;

	if (username && !button.classList.contains('animating')) {
		button.classList.add('animating');

		navigator.clipboard
			.writeText(username)
			.then(function () {
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
      `;
				container.innerHTML =
					'<span style="font-size: 14px; text-decoration: none;">Copied!</span>';

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

				console.log('Copied to clipboard: ' + username);
			})
			.catch(function (error) {
				console.error('Error copying username to clipboard:', error);
				button.classList.remove('animating');
			});
	}
});
