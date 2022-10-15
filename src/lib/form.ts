import { invalidateAll } from '$app/navigation';

type Parameters = {
	result?: ({ form }: { form: HTMLFormElement }) => void;
};
type Destroy = { destroy: () => void };
type Enhance = (form: HTMLFormElement, { result }?: Parameters) => Destroy;

export const enhance: Enhance = (form, { result } = {}) => {
	async function handleSubmit(event: Event) {
		event.preventDefault();

		const response = await fetch(form.action, {
			method: form.method,
			headers: { accept: 'application/json' },
			body: new FormData(form)
		});

		if (!response.ok) {
			console.error(await response.text());
		}

		// rerun load function
		invalidateAll();

		// reset the form
		if (result) {
			result({ form });
		}
	}

	form.addEventListener('submit', handleSubmit);

	return {
		destroy() {
			form.removeEventListener('submit', handleSubmit);
		}
	};
};
