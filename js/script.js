document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    const unitBtns = document.querySelectorAll('.unit-btn');
    const metricUnits = document.querySelectorAll('.metric-unit');
    const imperialUnits = document.querySelectorAll('.imperial-unit');
    const bioForm = document.getElementById('biometrics-form');
    
    // Initialize Theme
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    // Theme Switch Handler
    function handleThemeSwitch() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }
    
    // Update Theme Icon
    function updateThemeIcon(theme) {
        themeSwitch.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
    
    // Unit Conversion Handler
    function handleUnitConversion(unit) {
        unitBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const showMetric = this.dataset.unit === 'metric';
        metricUnits.forEach(u => u.style.display = showMetric ? 'block' : 'none');
        imperialUnits.forEach(u => u.style.display = showMetric ? 'none' : 'block');
    }
    
    // Form Submission Handler
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const { height, weight, age, gender, activityLevel, goal } = getFormValues();
        
        if (!validateInputs(height, weight, age)) {
            alert('Please enter valid numeric values');
            return;
        }
        
        const metrics = calculateAllMetrics(height, weight, age, gender, activityLevel, goal);
        updateUI(metrics);
    }
    
    // Get Form Values
    function getFormValues() {
        const currentUnit = document.querySelector('.unit-btn.active').dataset.unit;
        let height, weight;
        
        if (currentUnit === 'metric') {
            height = parseFloat(document.getElementById('height-cm').value);
            weight = parseFloat(document.getElementById('weight-kg').value);
        } else {
            const feet = parseFloat(document.getElementById('height-ft').value) || 0;
            const inches = parseFloat(document.getElementById('height-in').value) || 0;
            height = (feet * 30.48) + (inches * 2.54);
            weight = parseFloat(document.getElementById('weight-lbs').value) * 0.453592;
        }
        
        return {
            height,
            weight,
            age: parseFloat(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            activityLevel: parseFloat(document.getElementById('activity-level').value),
            goal: document.getElementById('goal').value
        };
    }
    
    // Validate Inputs
    function validateInputs(height, weight, age) {
        return !isNaN(height) && !isNaN(weight) && !isNaN(age) && 
               height > 0 && weight > 0 && age > 0;
    }
    
    // Calculate All Metrics
    function calculateAllMetrics(height, weight, age, gender, activityLevel, goal) {
        const bmi = calculateBMI(height, weight);
        const bmr = calculateBMR(weight, height, age, gender);
        const tdee = calculateTDEE(bmr, activityLevel);
        
        return {
            bmi,
            bmr,
            tdee,
            calories: adjustCaloriesForGoal(tdee, goal),
            bodyFat: calculateBodyFat(bmi, age, gender),
            water: calculateWaterIntake(weight),
            bmiCategory: getBMICategory(bmi)
        };
    }
    
    // Calculation Functions
    function calculateBMI(height, weight) {
        const heightInM = height / 100;
        return weight / (heightInM * heightInM);
    }
    
    function calculateBMR(weight, height, age, gender) {
        return gender === 'male'
            ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    function calculateTDEE(bmr, activityLevel) {
        return bmr * activityLevel;
    }
    
    function adjustCaloriesForGoal(tdee, goal) {
        const adjustment = {
            'lose': -500,
            'maintain': 0,
            'gain': 500
        };
        return tdee + (adjustment[goal] || 0);
    }
    
    function calculateBodyFat(bmi, age, gender) {
        return gender === 'male'
            ? (1.20 * bmi) + (0.23 * age) - 16.2
            : (1.20 * bmi) + (0.23 * age) - 5.4;
    }
    
    function calculateWaterIntake(weight) {
        return (weight * 0.035).toFixed(1);
    }
    
    // Update UI
    function updateUI({ bmi, calories, bodyFat, water, bmiCategory }) {
        document.getElementById('bmi-result').textContent = bmi.toFixed(1);
        document.getElementById('bmi-category').textContent = bmiCategory;
        document.getElementById('calories-result').textContent = Math.round(calories);
        document.getElementById('body-fat-value').textContent = `${bodyFat.toFixed(1)}%`;
        document.getElementById('water-intake').textContent = `${water} L`;
        
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('charts-container').style.display = 'grid';
        document.getElementById('chart-placeholder').style.display = 'none';
        
        updateCharts(bmi, bodyFat, calories);
    }
    
    // BMI Category
    function getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }
    
    // Event Listeners
    themeSwitch.addEventListener('click', handleThemeSwitch);
    unitBtns.forEach(btn => btn.addEventListener('click', handleUnitConversion));
    bioForm.addEventListener('submit', handleFormSubmit);
    
    // Initialize
    initTheme();
});
