/*

*/
// Parameters
const TOC_SOURCE_SANDBOX = '#post-body';
const TOC_TITLE_TEXT = 'Table of Contents';
const TOC_CONTAINER_PARENT_SEL = 'main';
const TOC_TOGGLE_PARENT_SEL = 'main';
const TOC_TOGGLE_TEXT = 'Table of Contents';
const HEADING_SEL = [2,3,4,5,6]
                      .map(i => `${TOC_SOURCE_SANDBOX} h${i}[id]`)
                      .join(',');
                      
                      
// HTML element IDs
const TOC_BACKDROP_ID = 'toc-backdrop';
const TOC_CONTAINER_ID = 'toc-container';
const TOC_HEADER_ID = 'toc-header';
const TOC_TITLE_ID = 'toc-title';
const TOC_CLOSE_BUTTON_ID = 'toc-close-button';
const TOC_BODY_ID = 'toc-body';
const TOC_LEVEL_CLASS_PREFIX = 'toc-level-';
const TOC_TOGGLE_ID = 'toc-toggle';

// HTML Class Names
const FADE_CLASS_NAME = 'fade';
const SHOW_CLASS_NAME = 'show';

// Property symbols
const TOC_BACKDROP_ELEMENT = Symbol(TOC_BACKDROP_ID);
const TOC_CONTAINER_ELEMENT = Symbol(TOC_CONTAINER_ID);
const TOC_VISIBLE = Symbol();

document.addEventListener('DOMContentLoaded', () => {
    
  insertTOC(document.querySelector(TOC_CONTAINER_PARENT_SEL));
  insertTOCToggle(document.querySelector(TOC_TOGGLE_PARENT_SEL));
  
  window.onhashchange = () => hideTOC();
  
});

/*
  Generate the elements composing table of contents and prepend
  the container to the specified parent element.
*/
function insertTOC(parent) {
  
  // Short circuit if parent is falsy.
  if (!parent) { return; }
  
  // Create the backdrop.
  let backdrop = document.createElement('DIV');
  
  // Store the element for easy access.
  document[TOC_BACKDROP_ELEMENT] = backdrop;
  
  // Set the ID.
  backdrop.id = TOC_BACKDROP_ID;
  
  // Give it the fade class so it's initially hidden.
  backdrop.className = FADE_CLASS_NAME;
  
  // Add a handler for touches/clicks.
  backdrop.onclick = () => hideTOC();
    
  // Prepend the backdrop.
  parent.prepend(backdrop);
  
  // Create the container for the table of contents.
  let container = document.createElement('DIV');
  
  // Store the element for easy access.
  document[TOC_CONTAINER_ELEMENT] = container;
  
  // Set the ID.
  container.id = TOC_CONTAINER_ID;
  
  // Remove the container from tab navigation.
  container.tabIndex = '-1';
  
  // Specify its label.
  container.setAttribute('aria-labelledby', TOC_TITLE_ID);
  
  // Create the header element
  let header = document.createElement('HEADER');
  header.id = TOC_HEADER_ID;
  
  // Create the table of contents title.
  let title = document.createElement('H2');
  title.id = TOC_TITLE_ID;
  title.innerHTML = TOC_TITLE_TEXT;
  
  // Append the title to the header and the header to the container.
  header.append(title);
  
  let button = document.createElement('BUTTON');
  button.id = TOC_CLOSE_BUTTON_ID;
  button.type = 'button';
  button.onclick = () => hideTOC();
  
  let svg = document.createElement('SVG');
  svg.innerHTML = `\
    <svg aria-hidden='true' 
         focusable='false' 
         data-prefix='fad' 
         data-icon='window-close' 
         class='svg-inline--fa fa-window-close fa-w-16' 
         role='img' 
         xmlns='http://www.w3.org/2000/svg' 
         viewBox='0 0 512 512'>
      <g class='fa-group'>
        <path class='fa-secondary' 
              fill='currentColor' 
              d='M464 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 \
              48h416a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48zm-83.6 \
              290.5a12.31 12.31 0 0 1 0 17.4l-40.5 40.5a12.31 12.31 \
              0 0 1-17.4 0L256 313.3l-66.5 67.1a12.31 12.31 0 0 \
              1-17.4 0l-40.5-40.5a12.31 12.31 0 0 1 \
              0-17.4l67.1-66.5-67.1-66.5a12.31 12.31 0 0 1 \
              0-17.4l40.5-40.5a12.31 12.31 0 0 1 17.4 0l66.5 67.1 \
              66.5-67.1a12.31 12.31 0 0 1 17.4 0l40.5 40.5a12.31 \
              12.31 0 0 1 0 17.4L313.3 256z' opacity='0.4'>
        </path>
        <path class='fa-primary' 
              fill='currentColor' 
              d='M380.4 322.5a12.31 12.31 0 0 1 0 17.4l-40.5 \
              40.5a12.31 12.31 0 0 1-17.4 0L256 313.3l-66.5 \
              67.1a12.31 12.31 0 0 1-17.4 0l-40.5-40.5a12.31 \
              12.31 0 0 1 0-17.4l67.1-66.5-67.1-66.5a12.31 12.31 \
              0 0 1 0-17.4l40.5-40.5a12.31 12.31 0 0 1 17.4 0l66.5 \
              67.1 66.5-67.1a12.31 12.31 0 0 1 17.4 0l40.5 \
              40.5a12.31 12.31 0 0 1 0 17.4L313.3 256z'>
        </path>
      </g>
    </svg>`
  button.append(svg);
  header.append(button);
  
  container.append(header);
  
  // Create the <nav> element that will contain the links.
  let body = document.createElement('NAV');
  body.id = TOC_BODY_ID;
  
  // Append the nav element to the container.
  container.append(body);
  
  // Prepend the container.
  parent.prepend(container);
  
  // Fetch eligible headings for link generation.
  let headings = document.querySelectorAll(HEADING_SEL);
    
  // Iterate the headings, which should all have IDs courtesy of
  // the selector used to fetch them.
  for (let heading of headings) {
   
    // Parse the heading level, subtracting one as we 
    // never include <h1> headings.
    let level = parseInt(heading.tagName.charAt(1)) - 1
    
    // Create the anchor element to be inserted into the 
    // table of contents.
    let link = document.createElement('A');
    
    // Assign a level-relevant class name for styling.
    link.className = `${TOC_LEVEL_CLASS_PREFIX}${level}`;
    
    // Point the anchor at the heading.
    link.href = `#${heading.id}`;
    
    // Give the anchor the heading's content.
    link.innerHTML = heading.innerHTML;
    
    // Append the anchor to the <nav> element.
    body.append(link)
    
  }
  
  // Initialize the property storing the state.
  document[TOC_VISIBLE] = false;
  
}

/*
  Generate the toggle button and prepend to 
  the specified parent element.
*/
function insertTOCToggle(parent) {
  
  // Create the button.
  let button = document.createElement('BUTTON');
  
  // Set the ID.
  button.id = TOC_TOGGLE_ID;
  
  // Set the type.
  button.type = 'button';
  
  // Set the button's text.
  button.innerHTML = TOC_TOGGLE_TEXT;
  
  // Connect the button to the element it controls.
  button.setAttribute('aria-controls', TOC_CONTAINER_ID);
  
  // Configure the button action.
  button.onclick = () => document[TOC_VISIBLE] ? hideTOC() : showTOC();
    
  // Prepend the button.
  parent.prepend(button);
  
}
  
function showTOC() {
  
  // Ensure the table of contents is not already visible.
  if (document[TOC_VISIBLE]) { return; }
  
  // Retrieve the backdrop.
  let backdrop = document[TOC_BACKDROP_ELEMENT];
    
  // Configure the backdrop for visibility.
  backdrop.classList.add(SHOW_CLASS_NAME);
  
  // Retrieve the container.
  let container = document[TOC_CONTAINER_ELEMENT];
  
  // Configure the container for visibility.
  container.style.visibility = 'visible';
  container.removeAttribute('aria-hidden');
  container.setAttribute('aria-modal', true);
  container.setAttribute('role', 'dialog');
  container.classList.add(SHOW_CLASS_NAME);
  
  // Update the property storing the state.
  document[TOC_VISIBLE] = true;
  
}

function hideTOC() {
  
  // Ensure the table of contents is actually visible.
  if (!document[TOC_VISIBLE]) { return; }
  
  // Retrieve the backdrop.
  let backdrop = document[TOC_BACKDROP_ELEMENT];
    
  // Configure the backdrop for invisibility.
  backdrop.classList.remove(SHOW_CLASS_NAME);
  
  // Retrieve the container.
  let container = document[TOC_CONTAINER_ELEMENT];
  
  // Configure the container for invisibility.
  container.setAttribute('aria-hidden', true);
  container.removeAttribute('aria-modal');
  container.removeAttribute('role');
  container.classList.remove(SHOW_CLASS_NAME);
  container.style.visibility = 'hidden';

  // Update the property storing the state.
  document[TOC_VISIBLE] = false;
  
  }