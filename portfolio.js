const filters = document.querySelector('.filters');
const projects = [...document.querySelectorAll('.project')];
const results = document.querySelector('#resultados');

filters.hidden = false;
filters.addEventListener('click', (event) => {
  const selected = event.target.closest('button[data-filter]');
  if (!selected) return;

  const category = selected.dataset.filter;
  filters.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button === selected));
  });

  projects.forEach((project) => {
    const categories = project.dataset.category.split(' ');
    project.hidden = category !== 'all' && !categories.includes(category);
  });

  const count = projects.filter((project) => !project.hidden).length;
  results.textContent = count === 1 ? '1 proyecto visible' : `${count} proyectos visibles`;
});
