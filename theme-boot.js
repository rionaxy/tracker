// Applies the saved colorway before first paint so the lock screen matches. Stores only a theme name.
(()=>{try{const t=localStorage.getItem('glass-ledger-theme');if(t&&/^[a-z-]{1,32}$/.test(t))document.documentElement.dataset.theme=t;}catch{}})();
