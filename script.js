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
function updateGarment(garmentId, stage) {
    if (accessories[garmentId]) {
        // Set the current stage
        accessories[garmentId].current = stage;
        
        // Mark as visible if not already
        accessories[garmentId].visible = true;
        
        // Update the image
        const element = document.getElementById(garmentId);
        if (element) {
            // Make sure it's visible
            element.style.visibility = 'visible';
            
            // Update source
            element.src = `costume/${garmentId}${stage}.png`;
            
            // Reset all state classes
            element.classList.remove('warning-state', 'caution-state', 'secure-state', 'optimal-state');
            
            // Add appropriate class based on the stage
            if (stage === 1) element.classList.add('warning-state');
            else if (stage === 2) element.classList.add('caution-state');
            else if (stage === 3) element.classList.add('secure-state');
            else if (stage === 4) element.classList.add('optimal-state');
            
            // Update the panel display
            updatePanelWithAccessoryImage(garmentId);
        }
    }
}

const accessories = {
    brain: { current: 1, total: 4, visible: false },
    eyes: { current: 1, total: 4, visible: false },
    ears: { current: 1, total: 4, visible: false },
    hands: { current: 1, total: 4, visible: false },
    heart: { current: 1, total: 4, visible: false },
    feet: { current: 1, total: 4, visible: false },
    bio: { current: 1, total: 4, visible: false }
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
        
        updatePanelWithAccessoryImage(accessoryId);
    }, 50);
}

function updatePanelWithAccessoryImage(accessoryId) {
    const accessory = accessories[accessoryId];
    const currentImage = accessory.current;
    const graphPlaceholder = document.querySelector('.graph-placeholder');
    const dataTypeName = document.getElementById('dataTypeName');
    const smallDescription = document.querySelector('.graph-section .small-description');
    
    // Update the panel title
    dataTypeName.textContent = accessoryId.charAt(0).toUpperCase() + accessoryId.slice(1) + ' Status';
    
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
    const percentage = (currentImage / accessory.total) * 100;
    
    resultNumber.textContent = percentage.toFixed(1);
    document.querySelector('.result-unit').textContent = '%';
    progressFill.style.width = `${percentage}%`;
    document.querySelector('.panel-section:last-child .small-description')
        .textContent = `System efficiency for ${accessoryId}`;
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Hide all garments initially
    initializeGarments();
    
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

// Add a mapping function to convert scores to stages
function mapScoreToStage(score) {
    if (score <= 25) return 1;        // Warning state (0-25)
    else if (score <= 50) return 2;   // Caution state (26-50)
    else if (score <= 75) return 3;   // Secure state (51-75)
    else return 4;                    // Optimal state (76-100)
}

// Map data types from the survey to accessory IDs
const dataTypeToAccessory = {
    "Visual Data": "eyes",
    "Communication Data": "ears",  
    "Personal Data": "heart",
    "Cognitive Data": "brain",
    "Audio Data": "ears",
    "Geolocation Data": "feet",
    "Biometric Data": "hands"
};

// Process incoming data from the survey site
function processSurveyData(data) {
    // Calculate average score
    const totalScore = data.responses.reduce((sum, response) => sum + parseFloat(response.answer), 0);
    const averageScore = totalScore / data.responses.length;
    
    console.log("Received survey data, average score:", averageScore);
    
    // Loop through each response and update corresponding accessory
    data.responses.forEach(response => {
        const questionIndex = response.question - 1;
        const score = parseFloat(response.answer);
        const stage = mapScoreToStage(score);
        
        // Get the data type from the survey questions
        if (siteAQuestions && siteAQuestions[questionIndex]) {
            const dataType = siteAQuestions[questionIndex].dataType;
            const accessoryId = dataTypeToAccessory[dataType];
            
            // Update the accessory if we have a mapping for it
            if (accessoryId) {
                console.log(`Updating ${accessoryId} (${dataType}) to stage ${stage} based on score ${score}`);
                updateGarment(accessoryId, stage);
            }
        }
    });
    
    // Show a connection confirmation
    showConnectionMessage("Profile updated based on your survey responses!");
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
function showConnectionMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 240, 0.2);
        border: 1px solid rgba(0, 255, 240, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 16px;
        box-shadow: 0 0 15px rgba(0, 255, 240, 0.5);
        opacity: 0;
        transition: opacity 0.5s;
    `;
    document.body.appendChild(messageDiv);
    
    // Fade in
    setTimeout(() => {
        messageDiv.style.opacity = "1";
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        messageDiv.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 500);
    }, 3000);
}

// Function to reveal garments as questions are completed
function revealGarment(questionIndex, score) {
    // Map question index to data type and accessory
    if (siteAQuestions && siteAQuestions[questionIndex]) {
        const dataType = siteAQuestions[questionIndex].dataType;
        const accessoryId = dataTypeToAccessory[dataType];
        
        if (accessoryId) {
            // Calculate stage based on score
            const stage = mapScoreToStage(score);
            
            // Mark accessory as visible
            accessories[accessoryId].visible = true;
            
            // Show it with animation
            const element = document.getElementById(accessoryId);
            if (element) {
                // First set the right image/stage
                element.src = `costume/${accessoryId}${stage}.png`;
                
                // Initially hidden
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';
                
                // Reset all state classes
                element.classList.remove('warning-state', 'caution-state', 'secure-state', 'optimal-state');
                
                // Add appropriate class based on the stage
                if (stage === 1) element.classList.add('warning-state');
                else if (stage === 2) element.classList.add('caution-state');
                else if (stage === 3) element.classList.add('secure-state');
                else if (stage === 4) element.classList.add('optimal-state');
                
                // Animate it in
                setTimeout(() => {
                    element.style.transition = 'opacity 1s ease, transform 1s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                    
                    // Show a connection message
                    showConnectionMessage(`${dataType} protection added!`);
                }, 100);
            }
        }
    }
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
