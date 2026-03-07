import { componentInfo } from './componentData.js';

// UI Panel Elements
const infoPanel = document.getElementById('component-info-panel');
const closeBtn = document.getElementById('close-panel');
const panelTitle = document.getElementById('component-title');
const panelName = document.getElementById('component-name');
const panelWhy = document.getElementById('component-why');
const panelDesign = document.getElementById('component-design');

// Show info panel with component data
export function showInfoPanel(componentBaseName) {
  const info = componentInfo[componentBaseName];
  
  if (info) {
    panelTitle.textContent = info.title;
    panelName.textContent = componentBaseName;
    panelWhy.textContent = info.why;
    panelDesign.textContent = info.design;
  } else {
    // Default placeholder text if no info available
    panelTitle.textContent = "Unknown Component";
    panelName.textContent = componentBaseName;
    panelWhy.textContent = "No information available for this component.";
    panelDesign.textContent = "Design details pending.";
  }
  
  infoPanel.classList.add('active');
}

// Hide info panel
export function hideInfoPanel() {
  infoPanel.classList.remove('active');
}

// Close button event listener
closeBtn.addEventListener('click', hideInfoPanel);
