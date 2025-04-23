// Main JavaScript for Wellness Calendar

// Global variables
let calendarData = null;
let userProgress = {
    meals: {},
    supplements: {},
    exercise: {},
    habits: {},
    notes: {}
};
let currentDayIndex = 0;
let darkMode = false;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Wellness Calendar...');
    
    try {
        // Load calendar data
        await loadCalendarData();
        
        // Load user progress from localStorage
        loadUserProgress();
        
        // Set up navigation
        setupNavigation();
        
        // Set up date navigation
        setupDateNavigation();
        
        // Set up theme toggle
        setupThemeToggle();
        
        // Set up save functionality
        document.getElementById('save-button').addEventListener('click', saveUserProgress);
        
        // Initialize current day index based on today's date
        initializeCurrentDayIndex();
        
        // Display initial day
        displayDay(currentDayIndex);
        
        // Set up data import/export
        setupDataHandling();
        
        console.log('Initialization complete!');
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('Failed to initialize the application. Please refresh the page.', 'error');
    }
});

// Load calendar data from JSON file
async function loadCalendarData() {
    try {
        const response = await fetch('data/calendar_data.json');
        if (!response.ok) {
            throw new Error('Failed to load calendar data');
        }
        calendarData = await response.json();
        console.log('Calendar data loaded successfully');
    } catch (error) {
        console.error('Error loading calendar data:', error);
        showMessage('Failed to load calendar data. Please refresh the page.', 'error');
    }
}

// Load user progress from localStorage
function loadUserProgress() {
    const savedProgress = localStorage.getItem('wellnessCalendarProgress');
    if (savedProgress) {
        try {
            userProgress = JSON.parse(savedProgress);
            console.log('User progress loaded from localStorage');
        } catch (error) {
            console.error('Error parsing saved progress:', error);
            userProgress = {
                meals: {},
                supplements: {},
                exercise: {},
                habits: {},
                notes: {}
            };
        }
    }
}

// Save user progress to localStorage
function saveUserProgress() {
    try {
        localStorage.setItem('wellnessCalendarProgress', JSON.stringify(userProgress));
        showMessage('Progress saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving progress:', error);
        showMessage('Failed to save progress. Please try again.', 'error');
    }
}

// Set up navigation between views
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = {
        calendar: document.getElementById('calendar-view'),
        exercise: document.getElementById('exercise-view'),
        dashboard: document.getElementById('dashboard-view')
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and views
            navLinks.forEach(l => l.classList.remove('active'));
            Object.values(views).forEach(view => {
                if (view) view.classList.remove('active');
            });
            
            // Add active class to clicked link and corresponding view
            link.classList.add('active');
            const viewName = link.getAttribute('data-view');
            if (views[viewName]) {
                views[viewName].classList.add('active');
                
                // Update dashboard if viewing it
                if (viewName === 'dashboard') {
                    updateDashboard();
                }
                
                // Initialize exercise program if viewing it
                if (viewName === 'exercise' && typeof initializeExerciseProgram === 'function') {
                    initializeExerciseProgram();
                }
            }
        });
    });
}

// Set up date navigation for the calendar
function setupDateNavigation() {
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const todayBtn = document.getElementById('today-button');
    
    prevDayBtn.addEventListener('click', () => {
        if (calendarData && calendarData.days) {
            if (currentDayIndex > 0) {
                currentDayIndex--;
                displayDay(currentDayIndex);
            } else {
                showMessage('You have reached the beginning of the calendar.', 'info');
            }
        }
    });
    
    nextDayBtn.addEventListener('click', () => {
        if (calendarData && calendarData.days) {
            if (currentDayIndex < calendarData.days.length - 1) {
                currentDayIndex++;
                displayDay(currentDayIndex);
            } else {
                showMessage('You have reached the end of the calendar.', 'info');
            }
        }
    });
    
    todayBtn.addEventListener('click', () => {
        initializeCurrentDayIndex();
        displayDay(currentDayIndex);
    });
}

// Initialize current day index based on today's actual date
function initializeCurrentDayIndex() {
    if (!calendarData || !calendarData.days || calendarData.days.length === 0) {
        console.error('Cannot initialize day index: missing calendar data');
        currentDayIndex = 0;
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    // Find the day in calendar data that matches today's date or is closest to it
    let closestIndex = 0;
    let smallestDiff = Number.MAX_SAFE_INTEGER;
    
    calendarData.days.forEach((day, index) => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        const timeDiff = Math.abs(dayDate.getTime() - today.getTime());
        
        if (timeDiff < smallestDiff) {
            smallestDiff = timeDiff;
            closestIndex = index;
            
            // If exact match, prioritize it
            if (timeDiff === 0) {
                return;
            }
        }
    });
    
    currentDayIndex = closestIndex;
    console.log(`Initialized to day index ${closestIndex} based on current date`);
}

// Display day data in the calendar view
function displayDay(dayIndex) {
    if (!calendarData || !calendarData.days || !calendarData.days[dayIndex]) {
        console.error('Cannot display day: invalid day index or missing data');
        return;
    }
    
    const day = calendarData.days[dayIndex];
    
    // Update current date display
    document.getElementById('current-date').textContent = formatDate(day.date);
    
    // Update meals
    document.getElementById('breakfast-text').textContent = day.meals.breakfast || 'No breakfast specified';
    document.getElementById('lunch-text').textContent = day.meals.lunch || 'No lunch specified';
    document.getElementById('dinner-text').textContent = day.meals.dinner || 'No dinner specified';
    document.getElementById('snacks-text').textContent = day.meals.snacks || 'No snacks specified';
    
    // Update meal checkboxes
    const dayKey = formatDateKey(day.date);
    document.getElementById('breakfast-check').checked = userProgress.meals[dayKey]?.breakfast || false;
    document.getElementById('lunch-check').checked = userProgress.meals[dayKey]?.lunch || false;
    document.getElementById('dinner-check').checked = userProgress.meals[dayKey]?.dinner || false;
    document.getElementById('snacks-check').checked = userProgress.meals[dayKey]?.snacks || false;
    
    // Update supplements
    updateSupplementsList('morning-supplements', day.supplements.morning);
    updateSupplementsList('evening-supplements', day.supplements.evening);
    
    // Update exercise
    document.getElementById('exercise-text').textContent = day.exercise.summary || 'Rest day';
    document.getElementById('exercise-check').checked = userProgress.exercise[dayKey] || false;
    
    // Update habits
    updateHabits(day.habits, dayKey);
    
    // Update quote
    document.getElementById('daily-quote').textContent = day.quote || 'No quote for today';
    
    // Update notes
    document.getElementById('daily-notes').value = userProgress.notes[dayKey] || '';
    
    // Set up event listeners for checkboxes and notes
    setupDayEventListeners(dayKey);
}

// Update supplements list
function updateSupplementsList(elementId, supplements) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    
    if (!supplements || supplements.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No supplements for this time';
        list.appendChild(li);
        return;
    }
    
    supplements.forEach(supplement => {
        const li = document.createElement('li');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `supplement-${elementId}-${supplement.replace(/\s+/g, '-')}`;
        checkbox.className = 'supplement-checkbox';
        checkbox.dataset.name = supplement;
        checkbox.dataset.time = elementId.includes('morning') ? 'morning' : 'evening';
        
        const dayKey = formatDateKey(calendarData.days[currentDayIndex].date);
        checkbox.checked = userProgress.supplements[dayKey]?.[checkbox.dataset.time]?.[supplement] || false;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = supplement;
        
        li.appendChild(checkbox);
        li.appendChild(label);
        list.appendChild(li);
        
        // Add event listener
        checkbox.addEventListener('change', function() {
            const dayKey = formatDateKey(calendarData.days[currentDayIndex].date);
            if (!userProgress.supplements[dayKey]) {
                userProgress.supplements[dayKey] = {};
            }
            if (!userProgress.supplements[dayKey][this.dataset.time]) {
                userProgress.supplements[dayKey][this.dataset.time] = {};
            }
            userProgress.supplements[dayKey][this.dataset.time][this.dataset.name] = this.checked;
        });
    });
}

// Update habits display
function updateHabits(habits, dayKey) {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    
    if (!habits || habits.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No habits for today';
        container.appendChild(message);
        return;
    }
    
    habits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `habit-${habit.replace(/\s+/g, '-')}`;
        checkbox.className = 'habit-checkbox';
        checkbox.dataset.name = habit;
        checkbox.checked = userProgress.habits[dayKey]?.[habit] || false;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = habit;
        
        habitItem.appendChild(checkbox);
        habitItem.appendChild(label);
        container.appendChild(habitItem);
        
        // Add event listener
        checkbox.addEventListener('change', function() {
            const dayKey = formatDateKey(calendarData.days[currentDayIndex].date);
            if (!userProgress.habits[dayKey]) {
                userProgress.habits[dayKey] = {};
            }
            userProgress.habits[dayKey][this.dataset.name] = this.checked;
        });
    });
}

// Set up event listeners for the current day
function setupDayEventListeners(dayKey) {
    // Meal checkboxes
    document.getElementById('breakfast-check').addEventListener('change', function() {
        if (!userProgress.meals[dayKey]) {
            userProgress.meals[dayKey] = {};
        }
        userProgress.meals[dayKey].breakfast = this.checked;
    });
    
    document.getElementById('lunch-check').addEventListener('change', function() {
        if (!userProgress.meals[dayKey]) {
            userProgress.meals[dayKey] = {};
        }
        userProgress.meals[dayKey].lunch = this.checked;
    });
    
    document.getElementById('dinner-check').addEventListener('change', function() {
        if (!userProgress.meals[dayKey]) {
            userProgress.meals[dayKey] = {};
        }
        userProgress.meals[dayKey].dinner = this.checked;
    });
    
    document.getElementById('snacks-check').addEventListener('change', function() {
        if (!userProgress.meals[dayKey]) {
            userProgress.meals[dayKey] = {};
        }
        userProgress.meals[dayKey].snacks = this.checked;
    });
    
    // Exercise checkbox
    document.getElementById('exercise-check').addEventListener('change', function() {
        userProgress.exercise[dayKey] = this.checked;
    });
    
    // Notes textarea
    document.getElementById('daily-notes').addEventListener('input', function() {
        userProgress.notes[dayKey] = this.value;
    });
    
    // Exercise details link
    document.getElementById('view-exercise-details').addEventListener('click', function(e) {
        e.preventDefault();
        // Switch to exercise view
        document.querySelector('.nav-link[data-view="exercise"]').click();
    });
}

// Set up theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check if dark mode was previously enabled
    darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply dark mode if enabled
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    // Add event listener
    themeToggle.addEventListener('change', function() {
        darkMode = this.checked;
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    });
}

// Update dashboard with analytics
function updateDashboard() {
    if (!calendarData) return;
    
    // Calculate habit adherence
    const habitData = calculateHabitAdherence();
    
    // Calculate exercise completion
    const exerciseData = calculateExerciseCompletion();
    
    // Update charts
    updateHabitsChart(habitData);
    updateExerciseChart(exerciseData);
}

// Calculate habit adherence
function calculateHabitAdherence() {
    const habitCounts = {
        completed: 0,
        missed: 0
    };
    
    // Count completed habits
    Object.keys(userProgress.habits).forEach(dayKey => {
        Object.values(userProgress.habits[dayKey]).forEach(completed => {
            if (completed) {
                habitCounts.completed++;
            } else {
                habitCounts.missed++;
            }
        });
    });
    
    return habitCounts;
}

// Calculate exercise completion
function calculateExerciseCompletion() {
    const exerciseCounts = {
        completed: 0,
        missed: 0
    };
    
    // Count completed exercises
    Object.values(userProgress.exercise).forEach(completed => {
        if (completed) {
            exerciseCounts.completed++;
        } else {
            exerciseCounts.missed++;
        }
    });
    
    return exerciseCounts;
}

// Update habits chart
function updateHabitsChart(habitData) {
    const ctx = document.getElementById('habits-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.habitsChart) {
        window.habitsChart.destroy();
    }
    
    window.habitsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Missed'],
            datasets: [{
                data: [habitData.completed, habitData.missed],
                backgroundColor: ['#4caf50', '#f44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Habit Adherence'
                }
            }
        }
    });
}

// Update exercise chart
function updateExerciseChart(exerciseData) {
    const ctx = document.getElementById('exercise-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.exerciseChart) {
        window.exerciseChart.destroy();
    }
    
    window.exerciseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Missed'],
            datasets: [{
                data: [exerciseData.completed, exerciseData.missed],
                backgroundColor: ['#4caf50', '#f44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Exercise Completion'
                }
            }
        }
    });
}

// Set up data import/export functionality
function setupDataHandling() {
    // Export data
    document.getElementById('export-data').addEventListener('click', function(e) {
        e.preventDefault();
        
        const dataStr = JSON.stringify(userProgress);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'wellness_calendar_data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    
    // Import data
    document.getElementById('import-data').addEventListener('click', function(e) {
        e.preventDefault();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    userProgress = importedData;
                    saveUserProgress();
                    displayDay(currentDayIndex);
                    showMessage('Data imported successfully!', 'success');
                } catch (error) {
                    console.error('Error importing data:', error);
                    showMessage('Failed to import data. Please check the file format.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    });
    
    // Reset data
    document.getElementById('reset-data').addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('Are you sure you want to reset all your progress data? This cannot be undone.')) {
            userProgress = {
                meals: {},
                supplements: {},
                exercise: {},
                habits: {},
                notes: {}
            };
            saveUserProgress();
            displayDay(currentDayIndex);
            showMessage('All progress data has been reset.', 'info');
        }
    });
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to format date key for storage
function formatDateKey(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Show message to user
function showMessage(message, type = 'info') {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('message-container');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'message-container';
        document.body.appendChild(messageElement);
        
        // Add styles
        messageElement.style.position = 'fixed';
        messageElement.style.bottom = '20px';
        messageElement.style.right = '20px';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.color = 'white';
        messageElement.style.fontWeight = '500';
        messageElement.style.zIndex = '1000';
        messageElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        messageElement.style.transition = 'opacity 0.3s ease';
    }
    
    // Set message type
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#4caf50';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            messageElement.style.backgroundColor = '#ff9800';
            break;
        default:
            messageElement.style.backgroundColor = '#2196f3';
    }
    
    // Set message text
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
    }, 3000);
}
