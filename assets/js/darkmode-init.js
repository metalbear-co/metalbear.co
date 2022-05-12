const globalDark = false;
// const localMode = localStorage.getItem('theme');
const localMode = null;


if (globalDark && (localMode === null)) {

  localStorage.setItem('theme', 'dark');
  document.documentElement.setAttribute('data-dark-mode', '');

}

if (globalDark && (localMode === 'dark')) {

  document.documentElement.setAttribute('data-dark-mode', '');

}

if (localMode === 'dark') {

  document.documentElement.setAttribute('data-dark-mode', '');

}
