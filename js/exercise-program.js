// Exercise Program JavaScript

// Global variables
let exerciseProgram = {
    version: "1.0",
    name: "12-Week Progressive Fitness Program",
    description: "A comprehensive 12-week exercise program focusing on balanced fitness",
    weeks: []
};

// Initialize the exercise program
function initializeExerciseProgram() {
    console.log('Initializing exercise program...');
    
    // Load exercise data if not already loaded
    if (exerciseProgram.weeks.length === 0) {
        loadExerciseData();
    } else {
        // Display current week based on today's date
        displayCurrentWeek();
    }
    
    // Set up navigation controls
    setupExerciseProgramNavigation();
}

// Load exercise program data
async function loadExerciseData() {
    try {
        const response = await fetch('data/exercise_program.json');
        if (!response.ok) {
            throw new Error('Failed to load exercise program data');
        }
        
        const data = await response.json();
        exerciseProgram = data;
        
        console.log('Exercise program data loaded successfully');
        
        // Display current week
        displayCurrentWeek();
    } catch (error) {
        console.error('Error loading exercise program data:', error);
        document.getElementById('exercise-program-content').innerHTML = 
            '<div class="error-message">Failed to load exercise program. Please refresh the page.</div>';
    }
}

// Set up exercise program navigation
function setupExerciseProgramNavigation() {
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    const locationToggle = document.getElementById('location-toggle');
    
    prevWeekBtn.addEventListener('click', () => {
        const currentWeekIndex = getCurrentWeekIndex();
        if (currentWeekIndex > 0) {
            displayWeek(currentWeekIndex - 1);
        } else {
            showMessage('You are already at the first week of the program.', 'info');
        }
    });
    
    nextWeekBtn.addEventListener('click', () => {
        const currentWeekIndex = getCurrentWeekIndex();
        if (currentWeekIndex < exerciseProgram.weeks.length - 1) {
            displayWeek(currentWeekIndex + 1);
        } else {
            showMessage('You have reached the end of the program.', 'info');
        }
    });
    
    locationToggle.addEventListener('change', () => {
        // Redisplay current week with new location setting
        displayWeek(getCurrentWeekIndex());
    });
}

// Get current week index from the DOM
function getCurrentWeekIndex() {
    const currentWeekElement = document.getElementById('current-week');
    return parseInt(currentWeekElement.getAttribute('data-week-index') || 0);
}

// Display current week based on today's date
function displayCurrentWeek() {
    // Get the current date to determine which week to display
    const startDate = new Date(2025, 0, 1); // January 1, 2025 as the start date
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    const currentWeekIndex = Math.min(Math.floor(daysDifference / 7), exerciseProgram.weeks.length - 1);
    
    // Display the current week's exercise program
    displayWeek(currentWeekIndex);
}

// Display a specific week of the exercise program
function displayWeek(weekIndex) {
    if (!exerciseProgram.weeks || weekIndex >= exerciseProgram.weeks.length) {
        console.error('Cannot display week: invalid week index or missing data');
        return;
    }
    
    const week = exerciseProgram.weeks[weekIndex];
    const workoutLocation = document.getElementById('location-toggle').checked ? 'gymWorkout' : 'homeWorkout';
    
    // Update current week display
    const currentWeekElement = document.getElementById('current-week');
    currentWeekElement.textContent = `Week ${week.weekNumber}: ${week.phase} Phase`;
    currentWeekElement.setAttribute('data-week-index', weekIndex);
    
    // Clear previous content
    const contentContainer = document.getElementById('exercise-program-content');
    contentContainer.innerHTML = '';
    
    // Create container for days
    const daysContainer = document.createElement('div');
    daysContainer.className = 'exercise-week';
    
    // Display each day's exercises
    week.days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'exercise-day';
        
        // Create day header
        const dayHeader = document.createElement('h3');
        dayHeader.textContent = `Day ${day.dayNumber}: ${day.focus}`;
        dayElement.appendChild(dayHeader);
        
        // If it's a rest day, display rest day message
        if (day.focus.toLowerCase().includes('rest')) {
            const restDayMsg = document.createElement('div');
            restDayMsg.className = 'rest-day-info';
            restDayMsg.textContent = day.description || 'Rest and recovery day. Focus on stretching and mobility.';
            dayElement.appendChild(restDayMsg);
        } else {
            // Create workout sections
            const workout = day[workoutLocation];
            
            if (workout) {
                // Warm-up section
                if (workout.warmup) {
                    const warmupSection = createWorkoutSection('Warm-up (5-10 minutes)', workout.warmup);
                    dayElement.appendChild(warmupSection);
                }
                
                // Main workout section
                if (workout.mainWorkout) {
                    const mainWorkoutSection = createWorkoutSection('Main Workout (20-30 minutes)', workout.mainWorkout);
                    dayElement.appendChild(mainWorkoutSection);
                }
                
                // Cool-down section
                if (workout.cooldown) {
                    const cooldownSection = createWorkoutSection('Cool-down (5-10 minutes)', workout.cooldown);
                    dayElement.appendChild(cooldownSection);
                }
                
                // Equipment needed
                if (workout.equipment && workout.equipment.length > 0) {
                    const equipmentSection = document.createElement('div');
                    equipmentSection.className = 'equipment-needed';
                    
                    const equipmentTitle = document.createElement('h4');
                    equipmentTitle.textContent = 'Equipment Needed:';
                    equipmentSection.appendChild(equipmentTitle);
                    
                    const equipmentList = document.createElement('ul');
                    workout.equipment.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        equipmentList.appendChild(li);
                    });
                    
                    equipmentSection.appendChild(equipmentList);
                    dayElement.appendChild(equipmentSection);
                }
            } else {
                // Fallback if workout data is missing
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Workout details not available for this location.';
                dayElement.appendChild(errorMsg);
            }
        }
        
        // Add completion tracking
        if (!day.focus.toLowerCase().includes('rest')) {
            const completionTracking = document.createElement('div');
            completionTracking.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `week${week.weekNumber}-day${day.dayNumber}`;
            checkbox.className = 'workout-completion';
            checkbox.dataset.week = week.weekNumber;
            checkbox.dataset.day = day.dayNumber;
            
            // Check if this workout has been completed
            const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '{}');
            const weekKey = `week${week.weekNumber}`;
            const dayKey = `day${day.dayNumber}`;
            
            if (completedWorkouts[weekKey] && completedWorkouts[weekKey][dayKey]) {
                checkbox.checked = true;
            }
            
            // Add event listener to save completion status
            checkbox.addEventListener('change', function() {
                const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '{}');
                const weekKey = `week${this.dataset.week}`;
                const dayKey = `day${this.dataset.day}`;
                
                if (!completedWorkouts[weekKey]) {
                    completedWorkouts[weekKey] = {};
                }
                
                completedWorkouts[weekKey][dayKey] = this.checked;
                localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
                
                // Update dashboard if it exists
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
            });
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = 'Mark as completed';
            
            completionTracking.appendChild(checkbox);
            completionTracking.appendChild(label);
            dayElement.appendChild(completionTracking);
        }
        
        daysContainer.appendChild(dayElement);
    });
    
    contentContainer.appendChild(daysContainer);
}

// Create a workout section (warm-up, main workout, or cool-down)
function createWorkoutSection(title, exercises) {
    const section = document.createElement('div');
    section.className = 'workout-section';
    
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);
    
    const exerciseList = document.createElement('ul');
    exerciseList.className = 'exercise-list';
    
    // Check if exercises is an array or contains a circuit
    if (Array.isArray(exercises)) {
        exercises.forEach(exercise => {
            const exerciseItem = createExerciseItem(exercise);
            exerciseList.appendChild(exerciseItem);
        });
    } else if (exercises.circuit) {
        // Handle circuit format
        const circuitItem = document.createElement('li');
        circuitItem.className = 'circuit-item';
        
        const circuitTitle = document.createElement('strong');
        circuitTitle.textContent = exercises.circuit;
        circuitItem.appendChild(circuitTitle);
        
        const circuitExercises = document.createElement('ul');
        exercises.exercises.forEach(exercise => {
            const circuitExerciseItem = document.createElement('li');
            circuitExerciseItem.textContent = exercise.exercise;
            
            // Add details if available
            if (exercise.sets || exercise.reps || exercise.duration) {
                const details = [];
                if (exercise.sets) details.push(`${exercise.sets} sets`);
                if (exercise.reps) details.push(`${exercise.reps} reps`);
                if (exercise.duration) details.push(exercise.duration);
                
                const detailsSpan = document.createElement('span');
                detailsSpan.textContent = ` (${details.join(', ')})`;
                circuitExerciseItem.appendChild(detailsSpan);
            }
            
            circuitExercises.appendChild(circuitExerciseItem);
        });
        
        circuitItem.appendChild(circuitExercises);
        exerciseList.appendChild(circuitItem);
    }
    
    section.appendChild(exerciseList);
    return section;
}

// Create an exercise list item
function createExerciseItem(exercise) {
    const item = document.createElement('li');
    
    // Exercise name
    const exerciseName = document.createElement('strong');
    exerciseName.textContent = exercise.exercise;
    item.appendChild(exerciseName);
    
    // Exercise details
    const details = [];
    
    if (exercise.sets) details.push(`${exercise.sets} sets`);
    if (exercise.reps) details.push(`${exercise.reps} reps`);
    if (exercise.duration) details.push(`${exercise.duration}`);
    if (exercise.distance) details.push(`${exercise.distance}`);
    if (exercise.intensity) details.push(`${exercise.intensity}`);
    if (exercise.rest) details.push(`Rest: ${exercise.rest}`);
    
    if (details.length > 0) {
        const detailsText = document.createElement('span');
        detailsText.textContent = ` - ${details.join(', ')}`;
        item.appendChild(detailsText);
    }
    
    return item;
}
