document.addEventListener('alpine:init', () => {
    Alpine.store('tsClipboard', { value: null });
});

window.copyToClipboard = async function (el) {
    const wrapper = el.closest('[data-ts-field]');
    if (!wrapper) return;

    const input = wrapper.querySelector('input, textarea, select');
    if (!input || !input.value) return;

    try {
        await navigator.clipboard.writeText(input.value);
        toast('Copied');
    } catch (e) {
        Alpine.store('tsClipboard').value = input.value;
        toast('Copied');
    }
};

window.pasteFromClipboard = async function (el) {
    const wrapper = el.closest('[data-ts-field]');
    if (!wrapper) return;

    const input = wrapper.querySelector('input, textarea, select');
    if (!input) return;

    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            setNativeValue(input, text);
            toast('Pasted');
        }
    } catch (e) {
        const clip = Alpine.store('tsClipboard');
        if (clip.value) {
            setNativeValue(input, clip.value);
            toast('Pasted');
        }
    }
};

window.translateField = async function (el, targetLocale, sourceLocale, adapter) {
    const spinner = el.querySelector('.animate-spin');
    spinner?.classList.remove('hidden');

    const wrapper = el.closest('[data-ts-field]');
    if (!wrapper) { spinner?.classList.add('hidden'); return; }

    const targetInput = wrapper.querySelector('input, textarea, select');
    if (!targetInput) { spinner?.classList.add('hidden'); return; }

    const fieldName = wrapper.dataset.tsField;
    if (!fieldName) { spinner?.classList.add('hidden'); return; }

    const sourceWrapper = document.querySelector(
        `[data-ts-field="${CSS.escape(fieldName)}"][data-ts-locale="${CSS.escape(sourceLocale)}"]`
    );
    if (!sourceWrapper) { spinner?.classList.add('hidden'); return; }

    const sourceInput = sourceWrapper.querySelector('input, textarea, select');
    if (!sourceInput || !sourceInput.value) { spinner?.classList.add('hidden'); return; }

    try {
        const response = await fetch('/fts/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                text: sourceInput.value,
                source: sourceLocale,
                target: targetLocale,
                adapter: adapter,
            }),
        });

        spinner?.classList.add('hidden');

        if (!response.ok) return;

        const data = await response.json();
        if (data.translation) {
            setNativeValue(targetInput, data.translation);
            toast('Translated');
        }
    } catch (e) {
        spinner?.classList.add('hidden');
    }
};

function toast(message) {
    window.dispatchEvent(new CustomEvent('ts-toast', { detail: { message } }));
}

function setNativeValue(el, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLInputElement
            ? window.HTMLInputElement.prototype
            : el instanceof HTMLTextAreaElement
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLSelectElement.prototype,
        'value'
    )?.set;

    if (nativeSetter) {
        nativeSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
