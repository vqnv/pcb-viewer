// Handle navigation button clicks
const navButtons = document.querySelectorAll('.nav-btn');
const aboutPanel = document.getElementById('about-panel');
const closeAboutBtn = document.getElementById('close-about');
const projectsPanel = document.getElementById('projects-panel');
const closeProjectsBtn = document.getElementById('close-projects');
const experiencePanel = document.getElementById('experience-panel');
const closeExperienceBtn = document.getElementById('close-experience');
const skillsPanel = document.getElementById('skills-panel');
const closeSkillsBtn = document.getElementById('close-skills');

// About Me button handler
const aboutBtn = document.querySelector('[data-section="about"]');
if (aboutBtn) {
  aboutBtn.addEventListener('click', () => {
    aboutPanel.classList.add('active');
  });
}

// Projects button handler
const projectsBtn = document.querySelector('[data-section="projects"]');
if (projectsBtn) {
  projectsBtn.addEventListener('click', () => {
    projectsPanel.classList.add('active');
  });
}

// Experience button handler
const experienceBtn = document.querySelector('[data-section="experience"]');
if (experienceBtn) {
  experienceBtn.addEventListener('click', () => {
    experiencePanel.classList.add('active');
  });
}

// Skills button handler
const skillsBtn = document.querySelector('[data-section="skills"]');
if (skillsBtn) {
  skillsBtn.addEventListener('click', () => {
    skillsPanel.classList.add('active');
  });
}

// Close button handlers
if (closeAboutBtn) {
  closeAboutBtn.addEventListener('click', () => {
    aboutPanel.classList.remove('active');
  });
}

if (closeProjectsBtn) {
  closeProjectsBtn.addEventListener('click', () => {
    projectsPanel.classList.remove('active');
  });
}

if (closeExperienceBtn) {
  closeExperienceBtn.addEventListener('click', () => {
    experiencePanel.classList.remove('active');
  });
}

if (closeSkillsBtn) {
  closeSkillsBtn.addEventListener('click', () => {
    skillsPanel.classList.remove('active');
  });
}

// Close on click outside
aboutPanel.addEventListener('click', (e) => {
  if (e.target === aboutPanel) {
    aboutPanel.classList.remove('active');
  }
});

projectsPanel.addEventListener('click', (e) => {
  if (e.target === projectsPanel) {
    projectsPanel.classList.remove('active');
  }
});

experiencePanel.addEventListener('click', (e) => {
  if (e.target === experiencePanel) {
    experiencePanel.classList.remove('active');
  }
});

skillsPanel.addEventListener('click', (e) => {
  if (e.target === skillsPanel) {
    skillsPanel.classList.remove('active');
  }
});

// Project Detail Modal Handler
const projectDetailModal = document.getElementById('project-detail-modal');
const closeProjectDetailBtn = document.getElementById('close-project-detail');
const projectCards = document.querySelectorAll('.project-card');

// Project data with images and links
const projectData = {
  'embedded-usb-mouse': {
    title: 'Embedded USB HID Mouse',
    image: '/projects/usb-mouse.jpg',
    demo: '#',// do this dumbass
    github: '#' // do this dumbass
  },
  'AI-powered': {
    title: 'Mathora — AI-Driven Interactive Math Visualizer',
    image: '/projects/mathora.jpg',
    demo: '#', // do this dumbass
    github: 'https://github.com/akashkothari2007/Mathora'
  },
  'embedded-system': {
    title: 'Embedded RC Car',
    image: '/projects/rc-car.jpg', 
    demo: 'https://youtu.be/Jhd58UX1a1Y',
    github: '#'
  },
  'light-controller': {
    title: 'Ambient Light Controller',
    image: '/projects/light-controller.jpg',
    demo: '#', //do this dumbass
    github: '#'
  },
  'custom-pcb': {
    title: 'Custom Etched PCB',
    image: '/projects/custom-pcb.jpg',
    demo: 'https://youtube.com/shorts/Y5EdU2NpqEo',
    github: '#'
  },
  'line-follower': {
    title: 'Line Follower Robot',
    image: '/projects/line-follower.jpg',
    demo: 'https://youtu.be/cN8zcZhuzwk', 
    github: '#'
  },
  'pcb-visualizer': {
    title: 'PCB Visualizer',
    image: '/projects/pcb-visualizer.jpg',
    demo: '#', //do this dumbass
    github: '#' //do this dumbass
  }
};

// Handle project card clicks
projectCards.forEach(card => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const projectId = card.getAttribute('data-project');
    const project = projectData[projectId];
    
    if (project) {
      // Update modal content
      document.getElementById('project-detail-title').textContent = project.title;
      document.getElementById('project-detail-img').src = project.image;
      
      const demoBtn = document.getElementById('project-demo-btn');
      const githubBtn = document.getElementById('project-github-btn');
      
      // Show/hide demo button based on link
      if (project.demo && project.demo !== '#') {
        demoBtn.href = project.demo;
        demoBtn.style.display = 'flex';
      } else {
        demoBtn.style.display = 'none';
      }
      
      // Show/hide github button based on link
      if (project.github && project.github !== '#') {
        githubBtn.href = project.github;
        githubBtn.style.display = 'flex';
      } else {
        githubBtn.style.display = 'none';
      }
      
      // Show modal
      projectDetailModal.classList.add('active');
    }
  });
});

// Close project detail modal
if (closeProjectDetailBtn) {
  closeProjectDetailBtn.addEventListener('click', () => {
    projectDetailModal.classList.remove('active');
  });
}

// Close on click outside
projectDetailModal.addEventListener('click', (e) => {
  if (e.target === projectDetailModal) {
    projectDetailModal.classList.remove('active');
  }
});
