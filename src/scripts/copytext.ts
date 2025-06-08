const COPY_DISCORD_BUTTON_ID = 'copyDiscord';
const DISCORD_USERNAME_ATTR = 'discord-username';
const ANIMATING_CLASS = 'animating';
const COPIED_SUCCESS_TEXT = 'Copied!';
const COPIED_FAIL_TEXT = 'Failed to copy';
const DEFAULT_ORIGINAL_TEXT = 'Discord';
const FEEDBACK_TIMEOUT_MS = 1500;

const copyDiscordButton = document.getElementById(COPY_DISCORD_BUTTON_ID);

if (copyDiscordButton) {
	copyDiscordButton.addEventListener('click', async function (event: MouseEvent) {
		const button = this as HTMLElement;
		const usernameToCopy = button.getAttribute(DISCORD_USERNAME_ATTR);

		if (!usernameToCopy || button.classList.contains(ANIMATING_CLASS)) {
			if (!usernameToCopy) {
				console.warn(
					`Button '${COPY_DISCORD_BUTTON_ID}' has no '${DISCORD_USERNAME_ATTR}' attribute.`,
				);
			}
			return;
		}

		event.preventDefault();

		const textSpan = button.querySelector('span');
		if (!textSpan) {
			console.error(
				`Text span not found within button ID '${COPY_DISCORD_BUTTON_ID}'. Cannot update text.`,
			);
			return;
		}

		const originalButtonText = textSpan.textContent || DEFAULT_ORIGINAL_TEXT;

		button.classList.add(ANIMATING_CLASS);

		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				await navigator.clipboard.writeText(usernameToCopy);
				textSpan.textContent = COPIED_SUCCESS_TEXT;
			} catch (error) {
				console.error('Error copying username to clipboard:', error);
				textSpan.textContent = COPIED_FAIL_TEXT;
			}
		} else {
			console.warn('Clipboard API not available.');
			textSpan.textContent = COPIED_FAIL_TEXT;
		}

		setTimeout(() => {
			if (textSpan) {
				textSpan.textContent = originalButtonText;
			}
			button.classList.remove(ANIMATING_CLASS);
		}, FEEDBACK_TIMEOUT_MS);
	});
} else {
	console.warn(
		`Button with ID '${COPY_DISCORD_BUTTON_ID}' not found. Copy functionality will not be available.`,
	);
}
