import { render, html } from './lib/ui.js';
import { App } from './components/App.js';

const root = document.getElementById('app');

function showBootstrapError(error) {
	console.error('App bootstrap failed:', error);
	if (!root) return;

	root.innerHTML = `
		<div class="status-card">
			<div id="status">App failed to load.</div>
			<pre style="white-space: pre-wrap; margin: 10px 0 0; color: var(--danger);">${String(error?.message || error)}</pre>
		</div>
	`;
}

try {
	render(html`<${App} />`, root);
} catch (error) {
	showBootstrapError(error);
}

window.addEventListener('error', (event) => {
	showBootstrapError(event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
	showBootstrapError(event.reason || 'Unhandled promise rejection');
});
