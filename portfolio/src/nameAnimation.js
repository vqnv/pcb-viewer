// Handle name display click to open LinkedIn
const nameDisplay = document.getElementById('name-display');

if (nameDisplay) {
  nameDisplay.addEventListener('click', () => {
    window.open('https://www.linkedin.com/in/safiullah-nasim-4a40a32a9/', '_blank');
  });
}
