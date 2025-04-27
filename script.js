// --- Element References ---
const userInput = document.getElementById('userInput');
const outputGrid = document.getElementById('outputGrid'); // Reference to the grid container
const tabButtons = document.querySelectorAll('.tab-button');
const themeToggleBtn = document.getElementById('themeToggle');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const loader = document.getElementById('loader');
const calculationForm = document.getElementById('calculationForm'); // Get form reference

// --- State Variables ---
let currentTab = 'naari'; // Default tab, matching your provided logic

// --- Theme Toggle Logic ---
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    // Track analytics event
    trackEvent('Theme', 'Toggle', localStorage.getItem('theme'));
}

// --- Font Size Control ---
function setFontSize(scalePercentage) {
    const scale = scalePercentage / 100;
    document.documentElement.style.setProperty('--base-font-scale', scale);
    localStorage.setItem('fontSize', scalePercentage);
}

// --- Form Validation & Shake Animation ---
function triggerShakeAnimation(element) {
    element.classList.add('error');
    element.addEventListener('animationend', () => {
        element.classList.remove('error');
    }, { once: true });
}

// --- Loader Control ---
function showLoader() {
    loader.classList.add('visible');
}

function hideLoader() {
    loader.classList.remove('visible');
}

// --- Tab Management (Integrated your logic) ---
function selectTab(tab) {
    // Update state variable
    currentTab = tab;

    // Update tab button classes and ARIA attributes
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
             // Auto-focus the selected tab for keyboard navigation flow
            btn.focus();
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        }
    });

    // Your logic: generate cross when tab changes
    generateCross();

    // Track analytics event
    trackEvent('Tab', 'Select', tab);
}

// --- Calculation Logic (Your provided logic integrated) ---
function generateCross() {
    const inputVal = userInput.value.trim();
    const input = parseInt(inputVal, 10);

    // --- Validation (Enhanced with shake and class toggling) ---
    // Remove previous validation states
    userInput.classList.remove('error');
    userInput.checkValidity(); // Re-check native validity state

    if (!inputVal || isNaN(input) || input < 9) {
        console.warn("Validation failed: Input must be a number >= 9."); // Use console.warn instead of alert
        triggerShakeAnimation(userInput); // Trigger CSS shake animation
        // Optional: Display an error message element if you added one in HTML
        hideLoader(); // Ensure loader is hidden if submit fails
        return; // Stop the function
    }
    // --- End Validation ---

    console.log(`Generating cross for number: ${input} (Type: ${currentTab})`);

    showLoader(); // Show loader before calculation starts

    // Simulate a delay for the "advanced" calculation to make loader visible
    setTimeout(() => {
        // --- Your Calculation Logic ---
        let m = input - 6;
        let q = Math.floor(m / 3);
        let r = m % 3;

        let boxesOrder = []; // Changed variable name from 'boxes' to avoid conflict with the HTML elements later

        switch (currentTab) {
            case 'naari':
                boxesOrder = ['top', 'left', 'center', 'right', 'bottom'];
                break;
            case 'maai':
                boxesOrder = ['right', 'bottom', 'center', 'top', 'left'];
                break;
            case 'hawaai':
                boxesOrder = ['left', 'bottom', 'center', 'top', 'right'];
                break;
            case 'khaki':
                boxesOrder = ['bottom', 'right', 'center', 'left', 'top'];
                break;
        }

        let values = [q, q + 1, q + 2, q + 3, q + 4];

        if (r === 2) {
            values[2] += 1;
            values[3] += 1;
            values[4] += 1;
        } else if (r === 1) {
            values[3] += 1;
            values[4] += 1;
        }
        // --- End Your Calculation Logic ---


        // Update grid boxes with calculated values
        // Ensure box elements exist before trying to update them
        boxesOrder.forEach((boxId, index) => {
            const boxElement = document.getElementById(boxId);
            if (boxElement) {
                boxElement.innerText = values[index];
                 // Optional: Add a class for success state after calculation if needed
                 boxElement.classList.add('calculated'); // Example class
            } else {
                console.error(`Element with ID "${boxId}" not found.`);
            }
        });

         // Optional: Remove success state class from all boxes before adding
         document.querySelectorAll('.box').forEach(box => box.classList.remove('calculated'));
         boxesOrder.forEach(boxId => {
             const boxElement = document.getElementById(boxId);
             if (boxElement) boxElement.classList.add('calculated');
         });


        hideLoader(); // Hide loader after calculation and updating

        // Track analytics event on successful generation
        trackEvent('Calculation', 'Generate', currentTab);

    }, 500); // Simulate 0.5 second delay
}


// --- Accessibility & Keyboard Navigation (Ensuring compatibility with new selectTab) ---
function enableKeyboardNavigation() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('keydown', (event) => {
        let currentTabIndex = Array.from(tabButtons).findIndex(button => button.classList.contains('active'));
        let nextTabIndex = -1;

        // Arrow Right (Move to next tab, wraps around)
        if (event.key === 'ArrowRight' || event.key === 'Left') { // Add Left for RTL direction intuition
             if (event.key === 'ArrowRight') {
                 nextTabIndex = (currentTabIndex + 1) % tabButtons.length;
             } else { // event.key === 'Left'
                 nextTabIndex = (currentTabIndex - 1 + tabButtons.length) % tabButtons.length;
             }
            event.preventDefault(); // Prevent default scroll behavior
        }
         // Arrow Left (Move to previous tab, wraps around)
         else if (event.key === 'ArrowLeft' || event.key === 'Right') { // Add Right for RTL intuition
             if (event.key === 'ArrowLeft') {
                  nextTabIndex = (currentTabIndex - 1 + tabButtons.length) % tabButtons.length;
             } else { // event.key === 'Right'
                  nextTabIndex = (currentTabIndex + 1) % tabButtons.length;
             }
            event.preventDefault(); // Prevent default scroll behavior
        }
        // Enter or Space (Activate tab)
        else if (event.key === 'Enter' || event.key === ' ') {
            // event.target is the button currently focused
            if (event.target.classList.contains('tab-button')) {
                 selectTab(event.target.dataset.tab); // Use your selectTab function
                 event.preventDefault(); // Prevent default spacebar scroll
            }
        }

        if (nextTabIndex !== -1) {
            // Focus the next button
            tabButtons[nextTabIndex].focus();
             // Note: The `selectTab` function is called by pressing Enter/Space,
             // not just by focusing. If you wanted focus to also select, you'd call
             // selectTab here, but that might be less intuitive for users.
        }
    });

     // Add keydown listener to the input for Enter key to submit the form
     // This is often default behavior for forms with a submit button, but explicit can help.
     userInput.addEventListener('keydown', (event) => {
         if (event.key === 'Enter') {
             // Prevent default Enter behavior (like newline in textareas) if applicable,
             // although not an issue for type="number".
             // Trigger form submission or call generateCross directly.
             // Calling generateCross directly bypasses the native form submit flow (onsubmit).
             // Let's stick to the form's onsubmit handler by not preventing default.
             // The onsubmit handler is already configured in HTML.
         }
     });
}


// --- Analytics Hook (Placeholder) ---
function trackEvent(category, action, label) {
    console.log(`Analytics Event: Category="${category}", Action="${action}", Label="${label}"`);
    // Replace with actual analytics tracking code (e.g., ga(), gtag(), etc.)
    // if (typeof gtag === 'function') {
    //     gtag('event', action, {
    //         'event_category': category,
    //         'event_label': label
    //     });
    // }
}


// --- Initialize Calculator ---
function initializeCalculator() {
    // 1. Load Theme Preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // 2. Load Font Size Preference
    const savedFontSize = localStorage.getItem('fontSize') || 100; // Default 100%
    fontSizeSlider.value = savedFontSize; // Set slider position
    setFontSize(savedFontSize); // Apply the saved size

    // 3. Set initial active tab and generate initial grid
    // Use your `selectTab` function to handle this, which also calls `generateCross`
    // Get the tab marked active in HTML, or default to 'naari'
    const initialActiveTabButton = document.querySelector('.tab-button.active');
    const initialTab = initialActiveTabButton ? initialActiveTabButton.dataset.tab : 'naari';
    selectTab(initialTab); // This will set currentTab, update classes, and call generateCross

    // 4. Set initial focus (Optional)
    // userInput.focus(); // Focus the input field on load

    // 5. Enable Keyboard Navigation
    enableKeyboardNavigation();

    // 6. Add Event Listeners
    themeToggleBtn.addEventListener('click', toggleTheme);

    fontSizeSlider.addEventListener('input', (event) => {
        setFontSize(event.target.value);
        // Track analytics event
        trackEvent('Font Size', 'Change', event.target.value);
    });

    // Form submission is handled by onsubmit="event.preventDefault(); generateCross();" in HTML
    // Tab clicks are handled by onclick="selectTab(...);" in HTML
    // These are fine, though event listeners here would also work.

     // Add a blur listener to input to trigger validation feedback when user leaves the field
     userInput.addEventListener('blur', () => {
         // Trigger validation checks (native and potentially JS logic)
         // Only show validation feedback if the field is not empty after blur
         if (userInput.value.trim() !== '') {
            const input = parseInt(userInput.value.trim(), 10);
            if (isNaN(input) || input < 9) {
                 triggerShakeAnimation(userInput);
            } else {
                 // If valid, ensure error class is removed (animationend handles this, but good to be sure)
                 userInput.classList.remove('error');
            }
         }
     });

     // Clean up success state class on input focus/change
     userInput.addEventListener('focus', () => {
          document.querySelectorAll('.box').forEach(box => box.classList.remove('calculated'));
     });
     userInput.addEventListener('input', () => {
          document.querySelectorAll('.box').forEach(box => box.classList.remove('calculated'));
     });

}

// --- Service Worker Registration (kept inline in HTML as before) ---
// This registration code remains in the <script> tag within index.html's <body>
// and requires a separate service-worker.js file in your root directory.


// --- Run initialization when DOM is ready ---
document.addEventListener('DOMContentLoaded', initializeCalculator);

// Expose generateCross and selectTab to global scope because they are used in HTML attributes (onclick, onsubmit)
window.generateCross = generateCross;
window.selectTab = selectTab;