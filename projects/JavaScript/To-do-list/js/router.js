// router.js
// Handles list ID in URL query and generates a new one if absent

function generateUUID() {
    // RFC4122 version 4 compliant UUID
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

export function initRouter() {
    const params = new URLSearchParams(window.location.search);
    let listId = params.get('list');
    if (!listId) {
        listId = generateUUID();
        params.set('list', listId);
        history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
    }
    return listId;
} 