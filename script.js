// Debug listener to catch ALL messages
window.addEventListener('message', function(event) {
    // Remove console logs for raw message data
    
    // Don't restrict by origin during testing
    if (event.data && typeof event.data === 'object') {
        // Remove processing message type log
        
        if (event.data.type === 'questionCompleted') {
            revealGarment(event.data.questionIndex, event.data.score);
        } else if (event.data.type === 'surveyResults') {
            processSurveyData(event.data);
        } else if (event.data.type === 'garmentUpdate') {
            updateGarment(event.data.garment, event.data.stage);
        }
    }
}, false);

// Track current image number for each accessory
// Listen for messages from Site A
window.addEventListener('message', function(event) {
    // Verify the origin for security - only the protocol, hostname and port
    const allowedOrigin = 'https://lionheartchu.github.io';
    
    if (!event.origin.startsWith(allowedOrigin)) {
        return;
    }
    
    // Process individual question completion (new functionality)
    if (event.data.type === 'questionCompleted') {
        revealGarment(event.data.questionIndex, event.data.score);
    }
    
    // Process the garment update
    if (event.data.type === 'garmentUpdate') {
        updateGarment(event.data.garment, event.data.stage);
    }
    
    // Process survey results (new functionality)
    if (event.data.type === 'surveyResults') {
        processSurveyData(event.data);
    }
}, false);

// Function to update garment to specific stage
function updateGarment(garmentId, stage, exactScore = null, dataType = null) {
    console.log(`Updating garment ${garmentId} to stage ${stage}`);
    
    if (!accessories[garmentId]) {
        console.error(`Unknown accessory: ${garmentId}`);
        return;
    }
    
    // Set the current stage
    if (stage > 0) {
        accessories[garmentId].current = stage;
    } else {
        // If stage is 0, set to 1 as default
        accessories[garmentId].current = 1;
    }
    
    // Mark as visible
    accessories[garmentId].visible = true;
    
    // Update the image
    const element = document.getElementById(garmentId);
    if (element) {
        // Remove element found log
        
        // Ensure it's visible - this is critical
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.style.display = 'block'; // Ensure it's displayed
        
        // Use current stage from accessories object to ensure consistency
        const currentStage = accessories[garmentId].current;
        
        // Debug: Log the image path we're trying to use
        const imagePath = `costume/${garmentId}${currentStage}.png`;
        // Remove image path log
        
        // Now set the actual element source
        element.src = imagePath;
        
        // Reset all state classes
        element.classList.remove('warning-state', 'caution-state', 'secure-state', 'optimal-state');
        
        // Add appropriate class based on the stage
        if (currentStage === 1) element.classList.add('warning-state');
        else if (currentStage === 2) element.classList.add('caution-state');
        else if (currentStage === 3) element.classList.add('secure-state');
        else if (currentStage === 4) element.classList.add('optimal-state');
        
        // Update the panel display with exact score and data type if available
        updatePanelWithAccessoryImage(garmentId, exactScore, dataType);
        
        // Show success message
        showConnectionMessage(`Updated ${garmentId} to stage ${currentStage}`);
    } else {
        console.error(`Element with ID ${garmentId} not found`);
    }
}

const accessories = {
    brain: { current: 0, total: 4, visible: false },
    eyes: { current: 0, total: 4, visible: false },
    ears: { current: 0, total: 4, visible: false },
    hands: { current: 0, total: 4, visible: false },
    heart: { current: 0, total: 4, visible: false },
    feet: { current: 0, total: 4, visible: false },
    bio: { current: 0, total: 4, visible: false }
};

// Map data types from the survey to accessory IDs
const dataTypeToAccessory = {
    "Visual Data": "eyes",
    "Communication Data": "hands",
    "Personal Data": "heart",
    "Cognitive Data": "brain",
    "Audio Data": "ears",
    "Geolocation Data": "feet",
    "Biometric Data": "bio"
};

// Function to reveal garments as questions are completed
function revealGarment(questionIndex, score) {
    // Remove revealing garment log
    
    // Get the data type from Site A's questions array equivalent
    let dataType = null;
    
    // If we have the direct dataType from message
    if (typeof questionIndex === 'object' && questionIndex.dataType) {
        dataType = questionIndex.dataType;
        score = questionIndex.score;
    } 
    // If we just have question index, use hardcoded mapping based on index
    else {
        // Hardcoded mapping based on your Site A question order
        const dataTypes = [
            "Visual Data",        // Q1: When posting personal photos...
            "Communication Data", // Q2: When sending personal messages...
            "Personal Data",      // Q3: When creating personal profiles...
            "Cognitive Data",     // Q4: When apps analyze your data...
            "Audio Data",         // Q5: When using voice assistants...
            "Geolocation Data",   // Q6: When using apps that track locations...
            "Biometric Data"      // Q7: When using biometric login...
        ];
        
        dataType = dataTypes[questionIndex];
    }
    
    // Map data type to accessory
    const accessoryId = dataTypeToAccessory[dataType];
    
    if (!accessoryId) {
        console.error(`No accessory mapped for data type: ${dataType}`);
        return;
    }
    
    // Calculate stage based on score
    const stage = mapScoreToStage(score);
    // Remove calculated stage log
    
    // Update the garment
    updateGarment(accessoryId, stage, score, dataType);
    
    // Show a message to user
    showConnectionMessage(`Updated ${accessoryId} to stage ${stage}`);
}

// Function to map score to stage
function mapScoreToStage(score) {
    if (score <= 25) return 1;        // Warning state (0-25)
    else if (score <= 50) return 2;   // Caution state (26-50)
    else if (score <= 75) return 3;   // Secure state (51-75)
    else return 4;                    // Optimal state (76-100)
}

// Function to process the complete survey data
function processSurveyData(data) {
    // Remove processing survey data log
    
    if (data.responses) {
        // Process each response to update the corresponding garment
        data.responses.forEach(response => {
            const questionIndex = response.question - 1; // Convert from 1-based to 0-based
            const score = parseFloat(response.answer);
            
            // Find data type from the question index
            const dataTypes = [
                "Visual Data",        // Q1: When posting personal photos...
                "Communication Data", // Q2: When sending personal messages...
                "Personal Data",      // Q3: When creating personal profiles...
                "Cognitive Data",     // Q4: When apps analyze your data...
                "Audio Data",         // Q5: When using voice assistants...
                "Geolocation Data",   // Q6: When using apps that track locations...
                "Biometric Data"      // Q7: When using biometric login...
            ];
            
            const dataType = dataTypes[questionIndex];
            const accessoryId = dataTypeToAccessory[dataType];
            
            // Update the garment if we have a valid mapping
            if (accessoryId) {
                const stage = mapScoreToStage(score);
                updateGarment(accessoryId, stage, score, dataType);
            }
        });
        
        // Show a summary message
        showConnectionMessage("Survey data processed! Your digital costume is complete.");
    }
}

// Store the questions structure from Site A for reference
const siteAQuestions = [
    { dataType: "Visual Data" },
    { dataType: "Communication Data" },
    { dataType: "Personal Data" },
    { dataType: "Cognitive Data" },
    { dataType: "Audio Data" },
    { dataType: "Geolocation Data" },
    { dataType: "Biometric Data" }
];

// Show a temporary message that data was received
function showConnectionMessage(message, isError = false) {
    // Create or update a floating message
    let messageBox = document.getElementById('connectionMessage');
    
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'connectionMessage';
        messageBox.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 240, 255, 0.2);
            border: 1px solid rgba(0, 255, 240, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(messageBox);
    }
    
    // Update the message with error styling if needed
    messageBox.textContent = message;
    messageBox.style.opacity = '1';
    
    if (isError) {
        messageBox.style.background = 'rgba(255, 0, 0, 0.2)';
        messageBox.style.border = '1px solid rgba(255, 0, 0, 0.8)';
    } else {
        messageBox.style.background = 'rgba(0, 240, 255, 0.2)';
        messageBox.style.border = '1px solid rgba(0, 255, 240, 0.8)';
    }
    
    // Hide after a delay
    setTimeout(() => {
        messageBox.style.opacity = '0';
    }, 3000);
}

// Add initialization function to hide all garments on page load
function initializeGarments() {
    Object.keys(accessories).forEach(accessoryId => {
        const element = document.getElementById(accessoryId);
        if (element) {
            // Hide all garments initially
            element.style.opacity = '0';
            
            // For accessibility, we should make them truly invisible rather than just transparent
            element.style.visibility = 'hidden';
        }
    });
}

// Add this listener to handle the survey results message type
document.addEventListener('DOMContentLoaded', function() {
    // Remove costume site loaded log
    
    // Listen for postMessage events
    window.addEventListener('message', function(event) {
        // Accept any origin during testing, tighten this later
        // Remove received message logs
        
        if (event.data && event.data.type === 'questionCompleted') {
            // Remove processing question completion log
            
            // Add pause and effects before revealing garment
            playRevealEffect(() => {
                revealGarment(event.data.questionIndex, event.data.score, event.data.dataType);
            });
        } else if (event.data && event.data.type === 'surveyResults') {
            console.log("All questions completed, showing final results");
            
            // Add pause and effects before showing final results
            playRevealEffect(() => {
                // Transform the data format to match what displayFinalResults expects
                const formattedResults = event.data.detailedResults || {};
                displayFinalResults(formattedResults);
            });
        }
    }, false);
    
    // Check for URL parameters (for direct navigation with results)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('surveyData')) {
        try {
            const surveyData = JSON.parse(urlParams.get('surveyData'));
            // Remove URL params log
            
            if (surveyData.type === 'surveyResults') {
                // Add pause and effects before showing final results
                playRevealEffect(() => {
                    // Transform the data format to match what displayFinalResults expects
                    const formattedResults = surveyData.detailedResults || {};
                    displayFinalResults(formattedResults);
                });
            }
        } catch (e) {
            console.error("Error parsing URL survey data:", e);
        }
    }
});

// Function to initialize and animate the particle canvas
function initializeParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Make sure canvas dimensions match its display size
        canvas.width = canvas.offsetWidth || canvas.clientWidth || 200;
        canvas.height = canvas.offsetHeight || canvas.clientHeight || 200;
        
        // Remove canvas dimensions log
        
        // Only create particles if canvas has valid dimensions
        if (canvas.width > 0 && canvas.height > 0) {
            // REDUCED: number of particles from 80 to 25
            const particles = Array.from({ length: 25 }, () => {
                // Larger random sized particles
                const radius = Math.random() * 2 + 1;
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: radius,
                    // REDUCED: particle speed for less CPU usage
                    speed: Math.random() * 0.3 + 0.05,
                    angle: Math.random() * 2 * Math.PI,
                    opacity: Math.random() * 0.35 + 0.15,
                    // SIMPLIFIED: removed animation parameters for opacity
                };
            });
            
            // Using a slower animation frame rate (less frequent updates)
            let lastFrame = 0;
            const frameInterval = 50; // Only update every 50ms (instead of every frame)
            
            function drawParticles(timestamp) {
                // Only update if enough time has passed
                if (!lastFrame || timestamp - lastFrame > frameInterval) {
                    lastFrame = timestamp;
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (const p of particles) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0,255,255,${p.opacity})`;
                        ctx.fill();
                        p.x += Math.cos(p.angle) * p.speed;
                        p.y += Math.sin(p.angle) * p.speed;
                        
                        if (p.x < 0) p.x = canvas.width;
                        if (p.x > canvas.width) p.x = 0;
                        if (p.y < 0) p.y = canvas.height;
                        if (p.y > canvas.height) p.y = 0;
                    }
                }
                requestAnimationFrame(drawParticles);
            }
            
            requestAnimationFrame(drawParticles);
            // Remove animation started log
        } else {
            console.warn("Canvas has invalid dimensions");
        }
    } else {
        console.warn("Particle canvas element not found");
    }
}

// Update the panel UI function with more friendly descriptions
function updatePanelWithAccessoryImage(accessoryId, exactScore = null, dataType = null) {
    const accessory = accessories[accessoryId];
    const currentImage = accessory.current;
    const graphPlaceholder = document.querySelector('.graph-placeholder');
    const dataTypeName = document.getElementById('dataTypeName');
    const smallDescription = document.querySelector('.graph-section .small-description');
    
    // Determine the data type if not provided (for backward compatibility)
    let displayDataType = dataType;
    if (!displayDataType) {
        // Try to reverse-lookup the data type based on accessory
        for (const [type, accId] of Object.entries(dataTypeToAccessory)) {
            if (accId === accessoryId) {
                displayDataType = type;
                break;
            }
        }
        // Fallback if no match found
        if (!displayDataType) {
            displayDataType = accessoryId.charAt(0).toUpperCase() + accessoryId.slice(1) + " Data";
        }
    }
    
    // Update the panel title to show data type security
    dataTypeName.textContent = `${displayDataType} Security`;
    
    // Add or update subtitle to show accessory status
    let subtitle = document.getElementById('accessoryStatusSubtitle');
    if (!subtitle) {
        subtitle = document.createElement('div');
        subtitle.id = 'accessoryStatusSubtitle';
        subtitle.style.cssText = `
            font-size: 1.2em;
            color: rgba(255, 255, 255, 0.9);
            font-weight: bold;
            letter-spacing: 1px;
            margin-top: 2px;
            margin-bottom: 12px;
            background: rgba(0, 0, 0, 0.2);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
        `;
        dataTypeName.parentNode.insertBefore(subtitle, dataTypeName.nextSibling);
    }
    subtitle.textContent = `${accessoryId.toUpperCase()} STATUS`;
    
    // Remove the "System Analysis Report" subtitle if it exists
    const systemAnalysisSubtitle = document.querySelector('.subtitle, .panel-subtitle');
    if (systemAnalysisSubtitle && systemAnalysisSubtitle.textContent.includes('System Analysis')) {
        systemAnalysisSubtitle.remove();
    }
    
    // Clear and update the graph section with the current accessory image
    graphPlaceholder.innerHTML = '';
    const img = document.createElement('img');
    img.src = `costume/${accessoryId}${currentImage}.png`;
    img.alt = `${accessoryId} visualization`;
    img.classList.add('panel-accessory-image');
    
    // Reset all state classes from the image and placeholder
    img.classList.remove('panel-warning-state', 'panel-caution-state', 'panel-secure-state', 'panel-optimal-state');
    graphPlaceholder.classList.remove('graph-warning', 'graph-caution', 'graph-secure', 'graph-optimal');
    
    // Add appropriate class based on the stage
    if (currentImage === 1) {
        img.classList.add('panel-warning-state');
        graphPlaceholder.classList.add('graph-warning');
    } else if (currentImage === 2) {
        img.classList.add('panel-caution-state');
        graphPlaceholder.classList.add('graph-caution');
    } else if (currentImage === 3) {
        img.classList.add('panel-secure-state');
        graphPlaceholder.classList.add('graph-secure');
    } else if (currentImage === 4) {
        img.classList.add('panel-optimal-state');
        graphPlaceholder.classList.add('graph-optimal');
    }
    
    graphPlaceholder.appendChild(img);
    
    // Update description based on current image number with more friendly wording
    const descriptions = {
        1: "Looks like this needs some attention:|",
        2: "Getting better! Some protection in place.",
        3: "Solid protection active--but there's room for improvement.",
        4: "Amazing! You've maximized your protection."
    };
    smallDescription.textContent = descriptions[currentImage] || 
        `Protection level: ${currentImage}`;
    
    // Update the result number and progress bar
    const resultNumber = document.querySelector('.result-number');
    const progressFill = document.querySelector('.progress-fill');
    
    // Use the exact score from survey if provided, otherwise calculate from stage
    let percentage;
    if (exactScore !== null) {
        // Use the exact value from the slider (0-100)
        percentage = exactScore;
    } else {
        // Calculate based on stage as before
        percentage = (currentImage / accessory.total) * 100;
    }
    
    // Update the display
    resultNumber.textContent = percentage.toFixed(1);
    document.querySelector('.result-unit').textContent = '%';
    progressFill.style.width = `${percentage}%`;

    // Update the glow dot position whenever the progress fill width changes
    updateProgressDot();
    
    // Update bottom description with new friendly format
    const bottomDescription = document.querySelector('.panel-section:last-child .small-description');
    const pointsRemaining = (100 - percentage).toFixed(1);
    
    if (percentage < 100) {
        bottomDescription.textContent = `You need${pointsRemaining} more points to get your ${accessoryId} fully protected!`;
    } else {
        bottomDescription.textContent = `Fantastic! Your ${accessoryId} has complete protection!`;
    }
    
    // Log the update for debugging (keep this one for important garment updates)
    console.log(`Updated panel for ${accessoryId}: Stage ${currentImage}, Value ${percentage.toFixed(1)}%`);
}

// Fix for costume visibility and stages - call this at document load
function fixCostumeDisplay() {
    // Remove applying costume display fixes log
    
    // Reset all accessories to ensure proper stage handling
    for (const accessoryId in accessories) {
        // Only reset if not explicitly set already
        if (accessories[accessoryId].current === 0) {
            // Remove resetting display state log
            
            // Hide initially
            const element = document.getElementById(accessoryId);
            if (element) {
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        } else {
            // Remove already at stage log
            
            // If it has a stage, make sure it's visible
            const element = document.getElementById(accessoryId);
            if (element) {
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                element.style.display = 'block';
                
                // Set correct image
                const stage = accessories[accessoryId].current;
                element.src = `costume/${accessoryId}${stage}.png`;
                // Remove set image log
            }
        }
    }
}
const value = 84.7;
document.querySelector('.progress-fill').style.width = `${value}%`;
updateProgressDot();

// Call both fixes when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // Keep COSTUME SITE LOADED log for important init confirmation
    console.log("COSTUME SITE LOADED - APPLYING FIXES");
    
    // Fix costume display
    fixCostumeDisplay();
    
    // Initialize particle canvas animation
    initializeParticleCanvas();
    
    // Update the progress dot position
    updateProgressDot();
    
    // Set up MutationObserver to watch for changes to the progress fill width
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    // When progress fill style changes, update the dot position
                    updateProgressDot();
                }
            });
        });
        
        // Start observing the progress fill for attribute changes
        observer.observe(progressFill, { attributes: true });
    }
});

// Enhanced function to display final survey results with simplified output
function displayFinalResults(surveyResults, sessionId) {
    if (sessionId !== latestSessionApplied) {
        console.log("⏸️ Ignored finalResults from old session:", sessionId);
        return;
    }
    console.log("✅ Applying final results for session:", sessionId);
    
    // Get the panel elements
    const graphPlaceholder = document.querySelector('.graph-placeholder');
    const dataTypeName = document.getElementById('dataTypeName');
    const subtitle = document.getElementById('accessoryStatusSubtitle');
    const panelContainer = document.querySelector('.panel-container');
    
    // Set a flag to indicate we're in final results mode
    document.body.setAttribute('data-final-results', 'true');
    
    // Update the panel title
    dataTypeName.textContent = "Digital Privacy Complete!";
    
    // Update subtitle
    if (subtitle) {
        subtitle.textContent = "FINAL RESULTS";
    }
    
    // Remove all state classes from graph and panel
    graphPlaceholder.classList.remove('graph-warning', 'graph-caution', 'graph-secure', 'graph-optimal');
    if (panelContainer) {
        panelContainer.classList.remove('warning-state', 'caution-state', 'secure-state', 'optimal-state');
        // Apply neutral sci-fi styling
        panelContainer.classList.add('final-results-panel');
    }
    
    // Find strongest and weakest data types
    let strongestType = null;
    let weakestType = null;
    let highestScore = -1;
    let lowestScore = 101; // Higher than possible
    let totalScore = 0;
    let count = 0;
    
    // Process survey results to find strongest and weakest
    for (const [dataType, score] of Object.entries(surveyResults)) {
        if (typeof score === 'number') {
            if (score > highestScore) {
                highestScore = score;
                strongestType = dataType;
            }
            if (score < lowestScore) {
                lowestScore = score;
                weakestType = dataType;
            }
            totalScore += score;
            count++;
        }
    }
    
    // Calculate average score (still needed for progress bar)
    const averageScore = count > 0 ? totalScore / count : 0;
    
    // Create HTML for the side-by-side results
    let resultsHTML = '<div class="final-results simplified side-by-side">';
    
    // Get accessory IDs for the strongest and weakest types
    const strongestAccessoryId = dataTypeToAccessory[strongestType] || 'brain';
    const weakestAccessoryId = dataTypeToAccessory[weakestType] || 'hands';
    
    // Add strong point with visualization
    if (strongestType) {
        resultsHTML += `
            <div class="result-item result-strongest">
                <div class="result-header">
                    <div class="result-label">Strongest Area:</div>
                    <div class="result-value">${highestScore.toFixed(1)}%</div>
                </div>
                <div class="result-type">${strongestType}</div>
                <div class="result-visualization">
                    <img src="costume/${strongestAccessoryId}4.png" alt="${strongestType}" class="type-icon">
                </div>
                <div class="result-bar">
                    <div class="result-bar-fill strongest" style="width: ${highestScore}%"></div>
                </div>
            </div>
        `;
    }
    
    // Add weak point with visualization
    if (weakestType) {
        resultsHTML += `
            <div class="result-item result-weakest">
                <div class="result-header">
                    <div class="result-label">Weakest Area:</div>
                    <div class="result-value">${lowestScore.toFixed(1)}%</div>
                </div>
                <div class="result-type">${weakestType}</div>
                <div class="result-visualization">
                    <img src="costume/${weakestAccessoryId}1.png" alt="${weakestType}" class="type-icon">
                </div>
                <div class="result-bar">
                    <div class="result-bar-fill weakest" style="width: ${lowestScore}%"></div>
                </div>
            </div>
        `;
    }
    
    resultsHTML += '</div>';
    
    // Inject into the graph area
    graphPlaceholder.innerHTML = resultsHTML;
    
    // Hide bottom descriptions
    const smallDescriptions = document.querySelectorAll('.small-description');
    smallDescriptions.forEach(desc => {
        desc.style.display = 'none';
    });
    
    // Update the result number and progress bar with the average
    const resultNumber = document.querySelector('.result-number');
    const progressFill = document.querySelector('.progress-fill');
    
    if (resultNumber) resultNumber.textContent = averageScore.toFixed(1);
    if (progressFill) progressFill.style.width = `${averageScore}%`;
    
    // Store the average score in an attribute to prevent hover issues
    if (resultNumber) resultNumber.setAttribute('data-final-score', averageScore.toFixed(1));
    
    // Add styles for side-by-side results
    const style = document.createElement('style');
    style.id = 'final-results-styles';
    style.textContent = `
        /* Side-by-side final results styles */
        .final-results.simplified.side-by-side {
            padding: 0;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            gap: 12px;
            height: auto;
            width: 100%;
        }
        
        .final-results.side-by-side .result-item {
            flex: 1;
            margin-bottom: 0;
            padding: 18px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border: 1px solid rgba(0, 240, 255, 0.2);
            display: flex;
            flex-direction: column;
        }
        
        .final-results.side-by-side .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .final-results.side-by-side .result-strongest {
            border: 1px solid rgba(0, 240, 255, 0.5);
            background: rgba(0, 30, 80, 0.2);
        }
        
        .final-results.side-by-side .result-weakest {
            border: 1px solid rgba(255, 50, 50, 0.5);
            background: rgba(50, 0, 0, 0.2);
        }
        
        .final-results.side-by-side .result-type {
            font-size: 1.2em;
            margin-bottom: 10px;
            font-weight: bold;
            text-align: center;
        }
        
        .final-results.side-by-side .result-strongest .result-type {
            color: rgba(0, 240, 255, 1);
            text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
        }
        
        .final-results.side-by-side .result-weakest .result-type {
            color: rgba(255, 100, 100, 1);
            text-shadow: 0 0 5px rgba(255, 50, 50, 0.5);
        }
        
        .final-results.side-by-side .result-label {
            font-size: 1em;
            opacity: 0.9;
        }
        
        .final-results.side-by-side .result-value {
            font-weight: bold;
            font-size: 1em;
        }
        
        .final-results.side-by-side .result-visualization {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 15px 0;
            height: 130px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 12px;
        }
        
        .final-results.side-by-side .type-icon {
            max-height: 130px;
            max-width: 100px;
            object-fit: contain;
        }
        .final-results.side-by-side .result-strongest .type-icon {
            filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.7));
        }
        
        .final-results.side-by-side .result-weakest .type-icon {
            filter: drop-shadow(0 0 8px rgba(255, 50, 50, 0.7));
        }
        
        .final-results.side-by-side .result-bar {
            height: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
            overflow: hidden;
            margin-top: auto;
        }
        
        .final-results.side-by-side .result-bar-fill {
            height: 100%;
            border-radius: 6px;
        }
        
        .final-results.side-by-side .result-bar-fill.strongest {
            background: linear-gradient(to right, #00f0ff, #4d00ff);
            box-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
        }
        
        .final-results.side-by-side .result-bar-fill.weakest {
            background: linear-gradient(to right, #ff3366, #ff6633);
            box-shadow: 0 0 8px rgba(255, 50, 50, 0.7);
        }
        
        /* Disable hover effects on final results */
        body[data-final-results="true"] .accessory:hover {
            cursor: default !important;
        }
        
        body[data-final-results="true"] .small-description {
            display: none !important;
        }
        
        /* Move final results down and add margin from panel-section */
        body[data-final-results="true"] .graph-placeholder {
            margin-top: 30px !important;
            border: none !important;
            background: none !important;
            box-shadow: none !important;
        }
        
        /* Add margin between final results and the next panel section */
        body[data-final-results="true"] .graph-section {
            margin-bottom: 80px !important;
        }
        
        /* Add more space before the final panel section */
        body[data-final-results="true"] .panel-section:last-child {
            margin-top: 25px !important;
        }
    `;
    
    // Remove any existing styles
    const oldStyles = document.getElementById('final-results-styles');
    if (oldStyles) oldStyles.remove();
    
    // Add new styles
    document.head.appendChild(style);
    
    // Disable hover behavior for accessories
    const accessories = document.querySelectorAll('.accessory');
    accessories.forEach(accessory => {
        accessory.style.pointerEvents = 'none';
    });
    
    // Store the final progress width
    if (progressFill) {
        progressFill.setAttribute('data-width', `${averageScore}%`);
    }
}

// * - firebase section - *

let latestSessionApplied = null;

document.addEventListener('DOMContentLoaded', function () {
    // Remove DOM fully loaded log
    
    // ✅ Firebase session tracker
    const sessionsRef = window.databaseRef(window.database, 'sessions');
    window.onValue(sessionsRef, (snapshot) => {
        const sessions = snapshot.val();
        if (!sessions) return;

        const sortedSessions = Object.entries(sessions).sort((a, b) => {
            const tsA = a[1]?.timestamp || 0;
            const tsB = b[1]?.timestamp || 0;
            return tsB - tsA;
        });

        const latestSessionId = sortedSessions[0][0];
        console.log("🔥 Current:", currentSessionId, "Latest:", latestSessionId);

        if (latestSessionId !== currentSessionId) {
            currentSessionId = latestSessionId;
            resetCostumeDisplay();
            setupFirebaseSession(latestSessionId);
        }
    });

    // ✅ Also handle messages from postMessage (if still used)
    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'questionCompleted') {
            revealGarment(event.data.questionIndex, event.data.score, event.data.dataType);
        } else if (event.data && event.data.type === 'surveyResults') {
            const formattedResults = event.data.detailedResults || {};
            displayFinalResults(formattedResults);
        }
    });

    // ✅ If you support URL param display
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('surveyData')) {
        try {
            const surveyData = JSON.parse(urlParams.get('surveyData'));
            if (surveyData.type === 'surveyResults') {
                const formattedResults = surveyData.detailedResults || {};
                displayFinalResults(formattedResults);
            }
        } catch (e) {
            // fail silently
        }
    }
});


function resetCostumeDisplay() {
    console.log("🔁 Resetting display to clean state...");

    // 移除 final result 状态和样式
    const graphPlaceholder = document.querySelector('.graph-placeholder');
    if (graphPlaceholder) {
        graphPlaceholder.classList.remove('final-results');
        graphPlaceholder.innerHTML = '<div class="initial-message">Waiting for the latest survey to complete...</div>';
    }

    const panelContainer = document.querySelector('.panel-container');
    if (panelContainer) {
        panelContainer.classList.remove('final-results-panel');
    }

    const finalStyle = document.getElementById('final-results-styles');
    if (finalStyle) {
        finalStyle.remove();
    }

    document.body.removeAttribute('data-final-results');

    // 继续重置 accessory 状态 & 面板内容
    Object.keys(accessories).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.display = 'none';
            el.classList.remove('warning-state', 'caution-state', 'secure-state', 'optimal-state');
        }
        accessories[id].current = 0;
        accessories[id].visible = false;
    });

    const dataTypeName = document.getElementById('dataTypeName');
    if (dataTypeName) dataTypeName.textContent = 'Awaiting Data';

    const subtitle = document.getElementById('accessoryStatusSubtitle');
    if (subtitle) subtitle.textContent = '';

    const resultNumber = document.querySelector('.result-number');
    const progressFill = document.querySelector('.progress-fill');
    if (resultNumber) resultNumber.textContent = '--';
    if (progressFill) progressFill.style.width = '0%';
    
    // Also reset the glow dot position
    updateProgressDot();
}

let currentSessionId = null;

let currentQuestionsUnsubscribe = null;
let currentResultsUnsubscribe = null;

function setupFirebaseSession(sessionId) {
    console.log("📡 Listening to session:", sessionId);

    // ✅ 设置当前 session（必须放最前）
    latestSessionApplied = sessionId;

    // ✅ Step 1: 清理旧的监听器
    if (currentQuestionsUnsubscribe) currentQuestionsUnsubscribe();
    if (currentResultsUnsubscribe) currentResultsUnsubscribe();

    // ✅ Step 2: 设置新的监听器
    const questionsRef = window.databaseRef(window.database, `sessions/${sessionId}/questions`);
    currentQuestionsUnsubscribe = window.onChildAdded(questionsRef, (snapshot) => {
        const questionData = snapshot.val();
        if (questionData) {
            // Add pause and effects before revealing garment
            playRevealEffect(() => {
                revealGarment({
                    dataType: questionData.dataType,
                    score: questionData.score
                });
            });
        }
    });

    const finalResultsRef = window.databaseRef(window.database, `sessions/${sessionId}/finalResults`);
    currentResultsUnsubscribe = window.onValue(finalResultsRef, (snapshot) => {
        const finalResults = snapshot.val();
        console.log("📥 Final results received:", finalResults);
        if (finalResults?.detailedResults) {
            // Add pause and effects before showing final results
            playRevealEffect(() => {
                displayFinalResults(finalResults.detailedResults, sessionId);
            });
        }
    });
}

// Add this new function after the resetCostumeDisplay function
function playRevealEffect(callback) {
    // Get body image element
    const bodyImage = document.getElementById('body-image');
    const costumeDisplay = document.querySelector('.costume-display');
    
    // Add scan pulse effect
    const scanPulseElement = document.createElement('div');
    scanPulseElement.className = 'scan-pulse-effect';
    costumeDisplay.appendChild(scanPulseElement);
    
    // Add scan-pulse CSS if not already added
    if (!document.getElementById('scan-pulse-styles')) {
        const scanPulseStyles = document.createElement('style');
        scanPulseStyles.id = 'scan-pulse-styles';
        scanPulseStyles.textContent = `
            .scan-pulse-effect {
                position: absolute;
                top: 0;
                left: -100%;
                width: 80%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(0, 255, 255, 0.1),
                    rgba(255, 255, 255, 0.3),
                    rgba(0, 255, 255, 0.1),
                    transparent
                );
                opacity: 0.3;
                animation: scanPulseMove 3.5s linear;
                pointer-events: none;
                z-index: 6;
            }
            
            @keyframes scanPulseMove {
    0% { left: -35%; }
    100% { left: 35%; }
}

        `;
        document.head.appendChild(scanPulseStyles);
    }
    
    // Store current visibility state of all accessories
    const visibilityStates = {};
    Object.keys(accessories).forEach(accessoryId => {
        const element = document.getElementById(accessoryId);
        if (element) {
            visibilityStates[accessoryId] = {
                visible: accessories[accessoryId].visible,
                style: {
                    visibility: element.style.visibility,
                    opacity: element.style.opacity,
                    display: element.style.display
                }
            };
            
            // Hide all accessories during the effect
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
            element.style.display = 'none';
        }
    });
    
    // Add glow effect class to body image
    bodyImage.classList.add('reveal-glow-effect');
    
    // Show a visual indicator that data is loading
    showConnectionMessage("Loading data visualization...", false);
    
    // After 3 seconds, remove glow effect and execute callback
    setTimeout(() => {
        bodyImage.classList.remove('reveal-glow-effect');
        
        // Remove scan pulse effect
        if (scanPulseElement && scanPulseElement.parentNode) {
            scanPulseElement.parentNode.removeChild(scanPulseElement);
        }
        
        // Execute the callback (which will set up the new garment)
        if (typeof callback === 'function') {
            callback();
        }
        
        // Restore all accessories that should be visible
        Object.keys(accessories).forEach(accessoryId => {
            const element = document.getElementById(accessoryId);
            if (element && accessories[accessoryId].visible) {
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                element.style.display = 'block';
            }
        });
    }, 3000);
}

// Add CSS for glow effect immediately
const revealGlowStyle = document.createElement('style');
revealGlowStyle.textContent = `
    @keyframes revealGlow {
    0% {
        filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4)) brightness(0.9);
        transform: scale(1);
        opacity: 0.75;
    }
    50% {
        filter: drop-shadow(0 0 16px rgba(0, 255, 255, 0.6)) brightness(1.1);
        transform: scale(1.015); /* ✨微微膨胀 */
        opacity: 0.9;
    }
    100% {
        filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4)) brightness(0.9);
        transform: scale(1);
        opacity: 0.75;
    }
}

.reveal-glow-effect {
    animation: revealGlow 2.8s ease-in-out infinite;
    will-change: filter, transform, opacity;
}

`;
document.head.appendChild(revealGlowStyle);

// Modified particle canvas initialization - move inside document loaded event
document.addEventListener('DOMContentLoaded', function() {
    // ... existing DOMContentLoaded code ...
    
    // Initialize particle canvas animation
    initializeParticleCanvas();
});

// Function to initialize and animate the particle canvas
function initializeParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Make sure canvas dimensions match its display size
        canvas.width = canvas.offsetWidth || canvas.clientWidth || 200;
        canvas.height = canvas.offsetHeight || canvas.clientHeight || 200;
        
        // Remove canvas dimensions log
        
        // Only create particles if canvas has valid dimensions
        if (canvas.width > 0 && canvas.height > 0) {
            // REDUCED: number of particles from 80 to 25
            const particles = Array.from({ length: 45 }, () => {
                // Larger random sized particles
                const radius = Math.random() * 2 + 1;
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: radius,
                    // REDUCED: particle speed for less CPU usage
                    speed: Math.random() * 0.3 + 0.05,
                    angle: Math.random() * 2 * Math.PI,
                    opacity: Math.random() * 0.35 + 0.15,
                    // SIMPLIFIED: removed animation parameters for opacity
                };
            });
            
            // Using a slower animation frame rate (less frequent updates)
            let lastFrame = 0;
            const frameInterval = 50; // Only update every 50ms (instead of every frame)
            
            function drawParticles(timestamp) {
                // Only update if enough time has passed
                if (!lastFrame || timestamp - lastFrame > frameInterval) {
                    lastFrame = timestamp;
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (const p of particles) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0,255,255,${p.opacity})`;
                        ctx.fill();
                        p.x += Math.cos(p.angle) * p.speed;
                        p.y += Math.sin(p.angle) * p.speed;
                        
                        if (p.x < 0) p.x = canvas.width;
                        if (p.x > canvas.width) p.x = 0;
                        if (p.y < 0) p.y = canvas.height;
                        if (p.y > canvas.height) p.y = 0;
                    }
                }
                requestAnimationFrame(drawParticles);
            }
            
            requestAnimationFrame(drawParticles);
            // Remove animation started log
        } else {
            console.warn("Canvas has invalid dimensions");
        }
    } else {
        console.warn("Particle canvas element not found");
    }
}

// Add a function to update the progress glow dot position
function updateProgressDot() {
    const progressFill = document.querySelector('.progress-fill');
    const progressDot = document.querySelector('.progress-glow-dot');
    
    if (progressFill && progressDot) {
        // Get the current width from the style attribute
        const widthStr = progressFill.style.width || '0%';
        const widthValue = parseFloat(widthStr);
        
        // Position the dot at the end of the fill bar, adjusted for the dot's radius
        progressDot.style.left = `calc(${widthValue}% - 6px)`;
    }
}