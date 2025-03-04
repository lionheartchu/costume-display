// At the beginning of your Site B JavaScript

// Debug listener to catch ALL messages
window.addEventListener('message', function(event) {
    console.log("RAW MESSAGE RECEIVED:", event.origin);
    console.log("MESSAGE DATA:", event.data);
    
    // Don't restrict by origin during testing
    if (event.data && typeof event.data === 'object') {
        console.log("Processing message with type:", event.data.type);
        
        if (event.data.type === 'questionCompleted') {
            console.log("Question completed data received:", event.data);
            revealGarment(event.data.questionIndex, event.data.score);
        } else if (event.data.type === 'surveyResults') {
            console.log("Survey results received:", event.data);
            processSurveyData(event.data);
        } else if (event.data.type === 'garmentUpdate') {
            console.log("Garment update received:", event.data);
            updateGarment(event.data.garment, event.data.stage);
        }
    }
}, false);

// Add this code to test the communication
document.addEventListener('DOMContentLoaded', function() {
    console.log("COSTUME SITE LOADED - TESTING COMMUNICATIONS");
    
    // Add a test button to verify functionality
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Garment Display';
    testButton.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 240, 255, 0.2);
        color: white;
        border: 1px solid rgba(0, 255, 240, 0.8);
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    
    // Test button will show a random garment when clicked
    testButton.onclick = function() {
        const accessoryKeys = Object.keys(accessories);
        const randomAccessory = accessoryKeys[Math.floor(Math.random() * accessoryKeys.length)];
        const randomStage = Math.floor(Math.random() * 4) + 1;
        
        console.log(`Testing: Revealing ${randomAccessory} at stage ${randomStage}`);
        updateGarment(randomAccessory, randomStage); // This should test your updateGarment function
        
        showConnectionMessage("Test garment displayed!");
    };
    
    document.body.appendChild(testButton);
});

// Track current image number for each accessory
// Listen for messages from Site A
window.addEventListener('message', function(event) {
    // Verify the origin for security - only the protocol, hostname and port
    const allowedOrigin = 'https://lionheartchu.github.io';
    
    if (!event.origin.startsWith(allowedOrigin)) {
        console.log("Origin verification failed:", event.origin);
        return;
    }
    
    console.log("Received message from survey site:", event.data);
    
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
        console.log(`Found element with ID ${garmentId}`);
        
        // Ensure it's visible - this is critical
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.style.display = 'block'; // Ensure it's displayed
        
        // Use current stage from accessories object to ensure consistency
        const currentStage = accessories[garmentId].current;
        
        // Debug: Log the image path we're trying to use
        const imagePath = `costume/${garmentId}${currentStage}.png`;
        console.log(`Setting image source to: ${imagePath}`);
        
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

function cycleAccessoryImage(accessoryId) {
    const accessory = accessories[accessoryId];
    accessory.current = accessory.current % accessory.total + 1;
    
    const element = document.getElementById(accessoryId);
    
    // Update the image source
    element.src = `costume/${accessoryId}${accessory.current}.png`;
    
    // Add fade transition effect
    element.style.opacity = '0';
    setTimeout(() => {
        element.style.opacity = '1';
        
        // Reset all state classes
        element.classList.remove('warning-state', 'caution-state', 'secure-state', 'optimal-state');
        
        // Add appropriate class based on the stage
        if (accessory.current === 1) {
            element.classList.add('warning-state');
        } else if (accessory.current === 2) {
            element.classList.add('caution-state');
        } else if (accessory.current === 3) {
            element.classList.add('secure-state');
        } else if (accessory.current === 4) {
            element.classList.add('optimal-state');
        }
        
        // When cycling manually, use stage-based calculation (no exact score)
        updatePanelWithAccessoryImage(accessoryId);
    }, 50);
}

// Add this function to the beginning of your script to set up the enhanced UI
function enhancePanelUI() {
    console.log("Enhancing panel UI with futuristic design");
    
    // Add new styles to the document
    const style = document.createElement('style');
    style.textContent = `
        /* Futuristic monospace font for the entire panel */
        .panel-container, .panel-section, .result-number, #dataTypeName, #accessoryStatusSubtitle {
            font-family: 'Courier New', monospace !important;
        }
        
        /* Make panel lighter, shorter, wider and more futuristic */
        .panel-container {
            background: rgba(15, 25, 50, 0.7) !important;
            border: 1px solid rgba(0, 240, 255, 0.3) !important;
            border-radius: 12px !important;
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.2) !important;
            padding: 15px 25px !important;
            max-height: 420px !important;
            width: 380px !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Animated border effect */
        @keyframes borderPulse {
            0% { border-color: rgba(0, 240, 255, 0.3); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
            50% { border-color: rgba(0, 240, 255, 0.7); box-shadow: 0 0 25px rgba(0, 240, 255, 0.4); }
            100% { border-color: rgba(0, 240, 255, 0.3); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
        }
        
        .panel-container {
            animation: borderPulse 4s infinite;
        }
        
        /* Enhanced data type title */
        #dataTypeName {
            font-size: 1.8em !important;
            color: rgba(0, 240, 255, 1) !important;
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.5) !important;
            letter-spacing: 1px !important;
            margin-bottom: 4px !important;
        }
        
        /* Enhanced accessory status subtitle */
        #accessoryStatusSubtitle {
            font-size: 1.4em !important;
            color: rgba(255, 255, 255, 0.9) !important;
            font-weight: bold !important;
            letter-spacing: 1px !important;
            margin-top: 2px !important;
            margin-bottom: 12px !important;
            background: rgba(0, 0, 0, 0.2) !important;
            padding: 4px 8px !important;
            border-radius: 4px !important;
            display: inline-block !important;
        }
        
        /* Futuristic progress bar */
        .progress-bar {
            height: 12px !important;
            background: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(0, 240, 255, 0.3) !important;
        }
        
        .progress-fill {
            background: linear-gradient(to right, #00f0ff, #0066ff) !important;
            box-shadow: 0 0 10px rgba(0, 240, 255, 0.7) !important;
        }
        
        /* Results number styling */
        .result-number {
            font-size: 2.2em !important;
            color: rgba(0, 240, 255, 1) !important;
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.5) !important;
        }
        
        /* Panel image styling */
        .panel-accessory-image {
            max-height: 150px !important;
            filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4)) !important;
        }
        
        /* Make bottom description larger */
        .panel-section:last-child .small-description {
            font-size: 1.1em !important;
            color: rgba(255, 255, 255, 0.9) !important;
            margin-top: 10px !important;
        }
        
        /* Make all small descriptions larger */
        .small-description {
            font-size: 1.1em !important;
            color: rgba(255, 255, 255, 0.85) !important;
        }
    `;
    document.head.appendChild(style);
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("COSTUME SITE LOADED - TESTING COMMUNICATIONS");
    // Call the UI enhancement function
    enhancePanelUI();
    
    // Add click handlers for all accessories
    Object.keys(accessories).forEach(accessoryId => {
        const element = document.getElementById(accessoryId);
        if (element) {
            // Only enable click events for visible accessories
            element.addEventListener('click', () => {
                if (accessories[accessoryId].visible) {
                    cycleAccessoryImage(accessoryId);
                    updatePanelWithAccessoryImage(accessoryId);
                }
            });
            
            // Hover event to show the current image in the panel (only for visible accessories)
            element.addEventListener('pointerover', () => {
                if (accessories[accessoryId].visible) {
                    updatePanelWithAccessoryImage(accessoryId);
                }
            });
        }
    });
    
    // Set initial panel content with message about completing survey
    const graphPlaceholder = document.querySelector('.graph-placeholder');
    if (graphPlaceholder) {
        graphPlaceholder.innerHTML = '<div class="initial-message">Complete the survey to build your digital privacy costume</div>';
        
        // Style for the initial message
        const style = document.createElement('style');
        style.textContent = `
            .initial-message {
                color: rgba(0, 255, 240, 0.8);
                font-size: 1.2em;
                text-align: center;
                padding: 20px;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
});

// Map data types from the survey to accessory IDs
const dataTypeToAccessory = {
    "Visual Data": "eyes",
    "Communication Data": "ears",  
    "Personal Data": "heart",
    "Cognitive Data": "brain",
    "Audio Data": "ears",
    "Geolocation Data": "feet",
    "Biometric Data": "bio"
};

// Function to reveal garments as questions are completed
function revealGarment(questionIndex, score) {
    console.log(`Revealing garment for question ${questionIndex} with score ${score}`);
    
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
    
    console.log(`Mapped data type ${dataType} to accessory ${accessoryId}`);
    
    // Calculate stage based on score
    const stage = mapScoreToStage(score);
    console.log(`Calculated stage ${stage} for score ${score}`);
    
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
    console.log("Processing full survey data:", data);
    
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

// In Site B (costume display)
document.addEventListener('DOMContentLoaded', function() {
    console.log("Costume site loaded, listening for messages");
    
    // Check for URL parameters first (fallback method)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('questionData')) {
        try {
            const questionData = JSON.parse(urlParams.get('questionData'));
            console.log("Received data from URL params:", questionData);
            if (questionData.type === 'questionCompleted') {
                revealGarment(questionData.questionIndex, questionData.score);
            }
        } catch (e) {
            console.error("Error parsing URL data:", e);
        }
    }
    
    // Listen for postMessage events
    window.addEventListener('message', function(event) {
        // Accept any origin during testing, tighten this later
        console.log("Received message from:", event.origin);
        console.log("Message data:", event.data);
        
        if (event.data && event.data.type === 'questionCompleted') {
            console.log("Processing question completion");
            revealGarment(event.data.questionIndex, event.data.score);
        }
    }, false);
});

// Simplified function to apply reasonable styling
function applyFuturisticStyles() {
    console.log("Applying futuristic panel styles with moderate text sizes");
    
    // Create a separate style element for our new styles
    const futuristicStyles = document.createElement('style');
    futuristicStyles.id = 'futuristic-panel-styles'; // ID to avoid duplicates
    
    // Remove any previous version if it exists
    const oldStyles = document.getElementById('futuristic-panel-styles');
    if (oldStyles) {
        oldStyles.remove();
    }
    
    futuristicStyles.textContent = `
        /* Futuristic monospace font for the entire panel */
        .panel-container, .panel-section, .result-number, #dataTypeName, #accessoryStatusSubtitle {
            font-family: 'Courier New', monospace !important;
        }
        
        /* Make panel lighter and more futuristic */
        .panel-container {
            background: rgba(15, 25, 50, 0.7) !important;
            border: 1px solid rgba(0, 240, 255, 0.3) !important;
            border-radius: 12px !important;
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.2) !important;
            padding: 15px 25px !important;
            max-height: 420px !important;
            width: 380px !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Animated border effect */
        @keyframes borderPulse {
            0% { border-color: rgba(0, 240, 255, 0.3); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
            50% { border-color: rgba(0, 240, 255, 0.7); box-shadow: 0 0 25px rgba(0, 240, 255, 0.4); }
            100% { border-color: rgba(0, 240, 255, 0.3); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
        }
        
        .panel-container {
            animation: borderPulse 4s infinite;
        }
        
        /* Enhanced data type title with moderate size */
        #dataTypeName {
            font-size: 1.7em !important;
            color: rgba(0, 240, 255, 1) !important;
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.5) !important;
            letter-spacing: 1px !important;
            margin-bottom: 4px !important;
        }
        
        /* Enhanced accessory status subtitle */
        #accessoryStatusSubtitle {
            font-size: 1.2em !important;
            color: rgba(255, 255, 255, 0.9) !important;
            font-weight: bold !important;
            letter-spacing: 1px !important;
            margin-top: 2px !important;
            margin-bottom: 12px !important;
            background: rgba(0, 0, 0, 0.2) !important;
            padding: 4px 8px !important;
            border-radius: 4px !important;
            display: inline-block !important;
        }
        
        /* Futuristic progress bar */
        .progress-bar {
            height: 12px !important;
            background: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(0, 240, 255, 0.3) !important;
        }
        
        .progress-fill {
            background: linear-gradient(to right, #00f0ff, #0066ff) !important;
            box-shadow: 0 0 10px rgba(0, 240, 255, 0.7) !important;
        }
        
        /* Results number styling */
        .result-number {
            font-size: 2em !important;
            color: rgba(0, 240, 255, 1) !important;
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.5) !important;
        }
        
        /* Panel image styling */
        .panel-accessory-image {
            max-height: 150px !important;
            filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4)) !important;
        }
        
        /* Make bottom description reasonably sized */
        .panel-section:last-child .small-description {
            font-size: 0.95em !important;
            color: rgba(255, 255, 255, 0.9) !important;
            margin-top: 10px !important;
        }
        
        /* Make all small descriptions moderately sized */
        .small-description {
            font-size: 0.95em !important;
            color: rgba(255, 255, 255, 0.85) !important;
        }
    `;
    
    document.head.appendChild(futuristicStyles);
}

// Update the panel UI function with moderate text sizes
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
    
    // Update description based on current image number
    const descriptions = {
        1: "Warning: System requires immediate attention",
        2: "Basic functionality restored",
        3: "Enhanced performance active",
        4: "Optimal condition achieved"
    };
    smallDescription.textContent = descriptions[currentImage] || 
        `${accessoryId} performance level: ${currentImage}`;
    
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
    
    // Update bottom description with new format
    const bottomDescription = document.querySelector('.panel-section:last-child .small-description');
    const pointsRemaining = (100 - percentage).toFixed(1);
    
    if (percentage < 100) {
        bottomDescription.textContent = `You need ${pointsRemaining} more points to fully protect your ${accessoryId}.`;
    } else {
        bottomDescription.textContent = `Your ${accessoryId} is fully protected!`;
    }
    
    // Log the update for debugging
    console.log(`Updated panel for ${accessoryId}: Stage ${currentImage}, Value ${percentage.toFixed(1)}%`);
}

// Fix for costume visibility and stages - call this at document load
function fixCostumeDisplay() {
    console.log("Applying costume display fixes");
    
    // Reset all accessories to ensure proper stage handling
    for (const accessoryId in accessories) {
        // Only reset if not explicitly set already
        if (accessories[accessoryId].current === 0) {
            console.log(`Resetting ${accessoryId} display state`);
            
            // Hide initially
            const element = document.getElementById(accessoryId);
            if (element) {
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        } else {
            console.log(`${accessoryId} already at stage ${accessories[accessoryId].current}, ensuring visibility`);
            
            // If it has a stage, make sure it's visible
            const element = document.getElementById(accessoryId);
            if (element) {
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                element.style.display = 'block';
                
                // Set correct image
                const stage = accessories[accessoryId].current;
                element.src = `costume/${accessoryId}${stage}.png`;
                console.log(`Set ${accessoryId} to image: costume/${accessoryId}${stage}.png`);
            }
        }
    }
}

// Call both fixes when the document loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("COSTUME SITE LOADED - APPLYING FIXES");
    
    // Apply styling with moderate text sizes
    applyFuturisticStyles();
    
    // Fix costume display
    fixCostumeDisplay();
    
    // ... rest of your existing initialization code ...
});
