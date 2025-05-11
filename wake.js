const lines = [
    "Drifting...",
    "Signal detected from sublayer...",
    "Stabilizing memory nodes...",
    "Connection established.",
  ];
  
  const delayPerChar = 25;
  const delayBetweenLines = 300;
  const bootText = document.getElementById("boot-text");
  
  let lineIndex = 0;
  
  function typeLine(line, cb) {
    let i = 0;
    const span = document.createElement("div");
    bootText.appendChild(span);
  
    function typeChar() {
      if (i < line.length) {
        span.textContent += line[i++];
        setTimeout(typeChar, delayPerChar);
      } else {
        setTimeout(cb, delayBetweenLines);
      }
    }
  
    typeChar();
  }
  
  function playBootSequence(startFrom = 0) {
    lineIndex = startFrom;
    typeNextLine();
  }
  
  function typeHudMessage(element, text, delay = 30) {
    element.textContent = '';
    
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, delay);
      }
    }
    
    typeChar();
  }
  
  function typeNextLine() {
    if (lineIndex < lines.length) {
      typeLine(lines[lineIndex++], typeNextLine);
    } else {
      setTimeout(() => {
        const wakeContainer = document.querySelector(".wake-container");
        if (wakeContainer) {
          const originalOpacity = window.getComputedStyle(wakeContainer).opacity;
          
          wakeContainer.style.transition = "opacity 0.8s ease";
          wakeContainer.style.opacity = "0";
          
          setTimeout(() => {
            wakeContainer.style.display = "none";
            
            document.body.classList.add("lab-bg");
            
            const hudContainer = document.querySelector(".hud-container");
            if (hudContainer) {
              hudContainer.style.display = "block";
              hudContainer.style.opacity = "0";
              hudContainer.style.transition = "opacity 1.2s ease";
              
              setTimeout(() => {
                hudContainer.style.opacity = "1";
                
                const hudTitle = document.querySelector(".hud-title");
                if (hudTitle) {
                  typeHudMessage(hudTitle, "Message incoming from Dr.A…", 30);
                }
              }, 10);
            }
          }, 500);
        }
      }, 800);
    }
  }

// Global state variables
let hasPlayedBootSequence = false;
let lastProcessedStep = null;
let isResetInProgress = false; // Add flag to prevent reset conflicts

function handleStep(step) {
  if (!step || step === lastProcessedStep) return;
  
  console.log(`Processing step: ${step}`);
  lastProcessedStep = step;

  if (step === "booting" && !hasPlayedBootSequence) {
    hasPlayedBootSequence = true;
    const wakeContainer = document.querySelector(".wake-container");
    if (wakeContainer) {
      wakeContainer.style.display = "block";
      wakeContainer.style.opacity = "1";
      const bootText = document.getElementById("boot-text");
      if (bootText) bootText.innerHTML = "";
    }
    playBootSequence(0);
  }

  else if (step === "example_scan") {
    // Hide the HUD container with a fade-out effect
    const hudContainer = document.querySelector(".hud-container");
    if (hudContainer && hudContainer.style.display !== "none") {
      hudContainer.style.opacity = "0";
      setTimeout(() => {
        hudContainer.style.display = "none";
      }, 600);
    }

    // Create and show body-lab image
    if (!document.getElementById("body-lab-image")) {
      const img = document.createElement("img");
      img.id = "body-lab-image";
      img.className = "body-lab-image"; // Apply the CSS class
      img.src = "body-lab-frame.png";
      document.body.appendChild(img);

      // Fade in with lower opacity
      requestAnimationFrame(() => {
        setTimeout(() => {
          img.style.opacity = "0.5"; // Lower opacity as requested
        }, 100);
      });
    }
  }

  else if (step === "start_scan") {
    // Create a promise-based sequence for clean transitions
    const transitionSequence = async () => {
      // 1. First hide the lab image with proper fade-out
      const labImg = document.getElementById("body-lab-image");
      if (labImg) {
        labImg.style.opacity = "0";
        // Wait for fade-out to complete
        await new Promise(resolve => setTimeout(resolve, 800));
        if (labImg.parentNode) {
          labImg.parentNode.removeChild(labImg);
        }
      }
      
      // Remove the lab background
      document.body.classList.remove("lab-bg");
      
      // Wait a tiny bit for background to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. Force hide wake container immediately
      const wakeContainer = document.querySelector(".wake-container");
      if (wakeContainer) {
        wakeContainer.style.transition = "none"; // Disable transition for immediate effect
        wakeContainer.style.opacity = "0";
        wakeContainer.style.display = "none";
      }
      
      // 3. Force hide HUD container immediately
      const hudContainer = document.querySelector(".hud-container");
      if (hudContainer) {
        hudContainer.style.transition = "none"; // Disable transition for immediate effect
        hudContainer.style.opacity = "0";
        hudContainer.style.display = "none";
      }
      
      // 4. Force hide bubble canvas immediately
      const bubbleCanvas = document.getElementById("bubbleCanvas");
      if (bubbleCanvas) {
        bubbleCanvas.style.transition = "none"; // Disable transition for immediate effect
        bubbleCanvas.style.opacity = "0";
        bubbleCanvas.style.display = "none";
      }

      // 5. Show main-container with forced visibility AFTER lab elements are hidden
      const mainContainer = document.querySelector(".main-container");
      if (mainContainer) {
        // FORCE remove hidden class and ensure display is flex
        mainContainer.classList.remove("hidden");
        
        // Reset styles first to ensure clean state
        mainContainer.style.transition = "none";
        mainContainer.style.opacity = "0";
        mainContainer.style.display = "flex";
        
        // Force browser to process these changes
        void mainContainer.offsetWidth; // Trigger reflow
        
        // Now set up the transition for the fade-in
        mainContainer.style.transition = "opacity 1s ease";
        
        // Ensure particleCanvas is properly initialized
        const particleCanvas = document.getElementById("particleCanvas");
        if (particleCanvas && window.initializeParticleCanvas) {
          window.initializeParticleCanvas();
        }
        
        // Finally fade in with a short delay to ensure all DOM operations are complete
        setTimeout(() => {
          mainContainer.style.opacity = "1";
        }, 100);
      } else {
        console.error("Could not find main-container element!");
      }
    };
    
    // Start the sequence
    transitionSequence();
  }
}

function listenToNarrative(narrativeId) {
  // Get Firebase references inside the function to ensure they're available
  const database = window.database;
  const ref = window.databaseRef;
  const onValue = window.onValue;
  const get = window.get;
  
  const statusRef = ref(database, `status/${narrativeId}`);

  // ✅ First read current state manually
  get(statusRef).then(snapshot => {
    const data = snapshot.val();
    if (data && data.step) {
      console.log(`Initial sync: ${data.step}`);
      handleStep(data.step);
    }
  });

  // ✅ Then set up live listener
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.step) {
      console.log(`Firebase updated: ${data.step}`);
      handleStep(data.step);
    }
  });
}

function startNarrativeListener() {
  // Get Firebase references inside the function to ensure they're available
  const database = window.database;
  const ref = window.databaseRef;
  const onValue = window.onValue;
  
  const statusRoot = ref(database, `status`);
  let currentId = null;

  onValue(statusRoot, (snapshot) => {
    const allSessions = snapshot.val();
    if (!allSessions) return;

    const entries = Object.entries(allSessions);
    const sorted = entries
      .filter(([key, val]) => val.timestamp)
      .sort((a, b) => b[1].timestamp - a[1].timestamp);

    if (sorted.length === 0) return;
    const [latestId] = sorted[0];
    
    console.log(`Session update: Latest=${latestId}, Current=${currentId}`);

    if (currentId !== latestId) {
      console.log(`Switching to session: ${latestId}`);
      
      // Only reset if we're not in the middle of a step transition
      if (!isResetInProgress) {
        // Reset state for new session
        hasPlayedBootSequence = false;
        lastProcessedStep = null;
        
        // Reset UI for new session if not first time
        if (currentId !== null) {
          resetUI();
        }
      }
      
      currentId = latestId;
      listenToNarrative(currentId);
    }
  });
}

function resetUI() {
  console.log("Resetting UI for new session");
  
  // Clear boot content
  const bootText = document.getElementById("boot-text");
  if (bootText) bootText.innerHTML = "";
  
  // Reset wake container
  const wakeContainer = document.querySelector(".wake-container");
  if (wakeContainer) {
    wakeContainer.style.display = "block";
    wakeContainer.style.opacity = "1";
  }
  
  // Reset bubble canvas
  const bubbleCanvas = document.getElementById("bubbleCanvas");
  if (bubbleCanvas) {
    bubbleCanvas.style.display = "block";
    bubbleCanvas.style.opacity = "1";
  }
  
  // Hide HUD container
  const hudContainer = document.querySelector(".hud-container");
  if (hudContainer) {
    hudContainer.style.display = "none";
    hudContainer.style.opacity = "0";
  }
  
  // Hide main container
  const mainContainer = document.querySelector(".main-container");
  if (mainContainer) {
    mainContainer.classList.add("hidden");
    mainContainer.style.opacity = "0";
    mainContainer.style.display = "none";
  }
  
  // Remove lab image
  const labImg = document.getElementById("body-lab-image");
  if (labImg && labImg.parentNode) {
    labImg.parentNode.removeChild(labImg);
  }
  
  // Remove lab background only (remove darken reference)
  document.body.classList.remove("lab-bg");
  
  // Reset costume display if available
  if (window.resetCostumeDisplay) {
    window.resetCostumeDisplay();
  }
}

function waitForFirebaseAndStart() {
  if (
    window.database &&
    window.databaseRef &&
    window.onValue &&
    window.get &&
    window.child &&
    document.readyState === "complete"
  ) {
    console.log("Firebase ready, starting narrative listener");
    startNarrativeListener();
  } else {
    setTimeout(waitForFirebaseAndStart, 100);
  }
}

// Initialize bubble canvas
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bubbles = Array.from({ length: 42 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: Math.random() * 2.4 + 1.2,
  speed: Math.random() * 0.25 + 0.1,
  opacity: Math.random() * 0.25 + 0.2
}));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 255, ${b.opacity})`;
    ctx.fill();
    b.y -= b.speed;
    if (b.y < -b.radius) b.y = canvas.height + b.radius;
  }
  requestAnimationFrame(draw);
}
draw();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Simplify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  // Add a simple transition for the background only
  document.body.style.transition = "background 1.5s ease";
});

waitForFirebaseAndStart();
  