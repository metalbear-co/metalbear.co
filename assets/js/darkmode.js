const mode = document.getElementById('mode');

if (mode !== null) {

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {

    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-dark-mode', '');

  })

  mode.addEventListener('click', () => {

    document.documentElement.toggleAttribute('data-dark-mode');
    localStorage.setItem('theme', document.documentElement.hasAttribute('data-dark-mode') ? 'dark' : 'light');

  });

  

  document.documentElement.setAttribute('data-dark-mode', '');

  

}
