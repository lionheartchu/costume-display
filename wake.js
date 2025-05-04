// First line and rest of the lines
const firstLine = "Sleeping...";
const remainingLines = [
  "Signal detected...",
  "Reactivating sensory system...",
  "You've been awakened.",
  "Message incoming from Dr.A..."
];

const delayPerChar = 40;
const delayBetweenLines = 700;
const bootText = document.getElementById("boot-text");

let lineIndex = 0;
let messageReceived = false; // Track if we received a message

function typeLine(line, cb) {
  let i = 0;
  const span = document.createElement("div");
  bootText.appendChild(span);

  function typeChar() {
    if (i < line.length) {
      span.textContent += line[i++];
      setTimeout(typeChar, delayPerChar);
    } else {
      if (cb) setTimeout(cb, delayBetweenLines);
    }
  }

  typeChar();
}

function continueBootSequence() {
  if (lineIndex < remainingLines.length) {
    typeLine(remainingLines[lineIndex++], continueBootSequence);
  } else {
    // Add a start button after the sequence completes
    addStartButton();
  }
}

function addStartButton() {
  const wakeContainer = document.querySelector('.wake-container');
  const button = document.createElement('button');
  button.className = 'start-button';
  button.textContent = 'ENGAGE SYSTEM';
  button.addEventListener('click', startMainContent);
  wakeContainer.appendChild(button);
}

function startMainContent() {
  // Hide the boot overlay
  document.querySelector('.boot-overlay').classList.add('hidden');
  
  // Show the main content
  document.querySelector('.main-container').classList.remove('hidden');
  
  // Trigger any initialization that might need to happen
  try {
    if (typeof window.initializeParticleCanvas === 'function') {
      window.initializeParticleCanvas();
    }
    
    if (typeof window.fixCostumeDisplay === 'function') {
      window.fixCostumeDisplay();
    }
    
    if (typeof window.updateProgressDot === 'function') {
      window.updateProgressDot();
    }
  } catch (error) {
    console.error("Error initializing main content:", error);
  }
}

// Start with just the "Sleeping..." message
window.onload = function() {
  console.log("Boot sequence initialized - waiting for trigger message");
  typeLine(firstLine, null);
  
  // Auto-start when accessed directly (after a delay)
  const autoStartDelay = 5000; // 5 seconds
  const autoStartTimer = setTimeout(() => {
    if (!messageReceived) {
      console.log("No message received - auto-starting boot sequence");
      lineIndex = 0;
      continueBootSequence();
    }
  }, autoStartDelay);
  
  // Debug function to manually trigger from console
  window.manualTrigger = function() {
    console.log("Manual trigger activated");
    messageReceived = true;
    clearTimeout(autoStartTimer);
    lineIndex = 0;
    continueBootSequence();
  };
  
  // Listen for ALL messages for debugging
  window.addEventListener('message', function(event) {
    console.log("Message received from:", event.origin);
    console.log("Message data:", event.data);
    
    // Check if the message is from the allowed origin
    const allowedOrigin = 'https://lionheartchu.github.io';
    
    if (event.origin.startsWith(allowedOrigin)) {
      console.log("Origin matched allowedOrigin");
      
      // Check for the initialization message
      if (event.data && (event.data.action === 'initializeClicked' || event.data.type === 'initialize')) {
        console.log('Valid initialization message received - starting boot sequence');
        // Start the rest of the boot sequence
        messageReceived = true;
        clearTimeout(autoStartTimer);
        lineIndex = 0;
        continueBootSequence();
      } else {
        console.log("Message format didn't match expected format");
      }
    } else {
      console.log("Message origin didn't match allowedOrigin");
    }
  });
  
  // Also listen for messages with no origin restriction (for testing)
  window.addEventListener('message', function(event) {
    if (event.data && (event.data.action === 'initializeClicked' || event.data.type === 'initialize')) {
      console.log('Received initialization without origin check - starting boot sequence');
      messageReceived = true;
      clearTimeout(autoStartTimer);
      lineIndex = 0;
      continueBootSequence();
    }
  });
  
  // Check if this was opened directly (not through a link/iframe)
  // URL parameter can be used to force auto-start
  if (window.location.search.includes('autostart=true')) {
    console.log("Autostart parameter detected - will start boot sequence immediately");
    messageReceived = true;
    clearTimeout(autoStartTimer);
    // Small delay to ensure everything is initialized
    setTimeout(() => {
      lineIndex = 0;
      continueBootSequence();
    }, 1000);
  }
};

// For local testing, you can expose a function to manually trigger the sequence
window.triggerBootSequence = function() {
  lineIndex = 0;
  continueBootSequence();
};
