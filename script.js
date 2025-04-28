// --- Element References ---
const userInput = document.getElementById('userInput');
const outputGrid = document.getElementById('outputGrid'); // Reference to the grid container
const tabButtons = document.querySelectorAll('.tab-button');
const themeToggleBtn = document.getElementById('themeToggle');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const loader = document.getElementById('loader');
const calculationForm = document.getElementById('calculationForm'); // Get form reference

// --- State Variables ---
// Note: currentTab is managed by the selectTab function now,
// but we keep it as a state variable for generateCross to use.
let currentTab = 'naari'; // Default tab, matching your provided logic

// --- Urdu Numeral Converter Function ---
function toUrduNum(num) {
    // Ensure input is a non-negative number before converting
    if (typeof num !== 'number' || isNaN(num) || num < 0) {
        console.warn(`Invalid number for Urdu conversion: ${num}`);
        return String(num); // Return the original value or a placeholder
    }
    const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    // Convert number to string, split digits, map to Urdu digits, join back
    return num.toString().split('').map(digit => {
        const intDigit = parseInt(digit);
        // Check if it's a digit 0-9, otherwise keep the original character (like a decimal point if needed, or sign)
        return isNaN(intDigit) ? digit : urduDigits[intDigit];
    }).join('');
}


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
    // Optional: Disable input/button while loading to prevent multiple submits
    userInput.disabled = true;
    calculationForm.querySelector('button[type="submit"]').disabled = true;
    tabButtons.forEach(btn => btn.disabled = true);
}

function hideLoader() {
    loader.classList.remove('visible');
     // Optional: Re-enable input/button after loading
    userInput.disabled = false;
    calculationForm.querySelector('button[type="submit"]').disabled = false;
     tabButtons.forEach(btn => btn.disabled = false);
}

// --- Tab Management (Using your provided logic for tab state) ---
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
    // Only generate if input is potentially valid
    const input = parseInt(userInput.value.trim(), 10);
    if (!isNaN(input) && input >= 9) {
       generateCross();
    } else {
        // Clear the grid if input is invalid when switching tabs
         clearGrid();
    }


    // Track analytics event
    trackEvent('Tab', 'Select', tab);
}

// Helper to clear the grid boxes
function clearGrid() {
    document.getElementById('top').innerText = '';
    document.getElementById('left').innerText = '';
    document.getElementById('center').innerText = '';
    document.getElementById('right').innerText = '';
    document.getElementById('bottom').innerText = '';
     document.querySelectorAll('.box').forEach(box => box.classList.remove('calculated'));
}


// --- Calculation Logic (Integrating your calculation with other features) ---
function generateCross() {
    const inputVal = userInput.value.trim();
    const input = parseInt(inputVal, 10);

    // --- Validation (Using the enhanced validation) ---
    // Remove previous validation states
    userInput.classList.remove('error');
    userInput.checkValidity(); // Re-check native validity state

    if (!inputVal || isNaN(input) || input < 9) {
        console.warn("Validation failed: Input must be a number >= 9.");
        triggerShakeAnimation(userInput);
        clearGrid(); // Clear grid on validation failure
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

        let top = q;
        let left = q + 1;
        let center = q + 2;
        let right = q + 3;
        let bottom = q + 4;

        if (r === 2) {
            center += 1;
            right += 1;
            bottom += 1;
        } else if (r === 1) {
            right += 1;
            bottom += 1;
        }
        // --- End Your Calculation Logic ---


        // --- Update Grid Boxes with Urdu Numerals ---
        // Clear previous success state
         document.querySelectorAll('.box').forEach(box => box.classList.remove('calculated'));

        document.getElementById('top').innerText = toUrduNum(top);
        document.getElementById('left').innerText = toUrduNum(left);
        document.getElementById('center').innerText = toUrduNum(center);
        document.getElementById('right').innerText = toUrduNum(right);
        document.getElementById('bottom').innerText = toUrduNum(bottom);

        // Add success state class to updated boxes
        document.getElementById('top').classList.add('calculated');
        document.getElementById('left').classList.add('calculated');
        document.getElementById('center').classList.add('calculated');
        document.getElementById('right').classList.add('calculated');
        document.getElementById('bottom').classList.add('calculated');
        // --- End Update ---


        hideLoader(); // Hide loader after calculation and updating

        // Track analytics event on successful generation
        trackEvent('Calculation', 'Generate', currentTab);

    }, 500); // Simulate 0.5 second delay
}


// --- Accessibility & Keyboard Navigation ---
function enableKeyboardNavigation() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('keydown', (event) => {
        let currentTabIndex = Array.from(tabButtons).findIndex(button => button.classList.contains('active'));
        let nextTabIndex = -1;

        // Arrow Right (Move to next tab, wraps around) / Left (for RTL intuition)
        if (event.key === 'ArrowRight' || event.key === 'Left') {
             if (event.key === 'ArrowRight') { // Standard LTR behavior for key
                 nextTabIndex = (currentTabIndex + 1) % tabButtons.length;
             } else { // event.key === 'Left'
                 nextTabIndex = (currentTabIndex - 1 + tabButtons.length) % tabButtons.length;
             }
            event.preventDefault(); // Prevent default scroll behavior
        }
         // Arrow Left (Move to previous tab, wraps around) / Right (for RTL intuition)
         else if (event.key === 'ArrowLeft' || event.key === 'Right') {
             if (event.key === 'ArrowLeft') { // Standard LTR behavior for key
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
            // Focus the next button without selecting it immediately
            tabButtons[nextTabIndex].focus();
        }
    });

     // Input field Enter key: Handled by the form's onsubmit attribute
     // (onsubmit="event.preventDefault(); generateCross();")
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

    // 3. Set initial active tab and potentially generate initial grid
    // Use your `selectTab` function to handle this, which also calls `generateCross`
    // Get the tab marked active in HTML, or default to 'naari'
    const initialActiveTabButton = document.querySelector('.tab-button.active');
    const initialTab = initialActiveTabButton ? initialActiveTabButton.dataset.tab : 'naari';
    selectTab(initialTab); // This will set currentTab, update classes, and potentially call generateCross

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
         const input = parseInt(userInput.value.trim(), 10);
         // Only trigger shake if the input is not empty AND invalid
         if (userInput.value.trim() !== '' && (isNaN(input) || input < 9)) {
              triggerShakeAnimation(userInput);
              clearGrid(); // Clear grid on blur validation failure
         } else if (!isNaN(input) && input >= 9) {
             // If valid on blur, ensure error class is removed and maybe generate if not already
             userInput.classList.remove('error'); // Animationend usually handles this
             // Optional: generateCross() here if you want it to update on blur of valid input
         } else if (userInput.value.trim() === '') {
             // If empty on blur, clear grid and remove any error states
             userInput.classList.remove('error');
             clearGrid();
         }
     });

     // Clean up success state class on input focus/change
     userInput.addEventListener('focus', () => {
          // Optionally clear grid values on focus if you want user to start fresh
          // clearGrid();
          // Ensure error class is removed on focus so user can fix
          userInput.classList.remove('error');
     });
     // Clear success state when input value changes
     userInput.addEventListener('input', () => {
          document.querySelectorAll('.box').forEach(box => box.classList.remove('calculated'));
          // Optionally clear grid values as input changes
          // clearGrid();
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
