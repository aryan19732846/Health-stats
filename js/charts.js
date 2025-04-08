let bmiChart, bodyFatChart, macroChart, calorieChart;

function updateCharts(bmi, bodyFat, calories) {
    // Destroy existing charts
    if(bmiChart) bmiChart.destroy();
    if(bodyFatChart) bodyFatChart.destroy();
    if(macroChart) macroChart.destroy();
    if(calorieChart) calorieChart.destroy();
    
    // Get current theme colors
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ecf0f1' : '#2c3e50';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Common compact options for all charts
    const compactOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 10
                    },
                    color: textColor
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        }
    };

    // BMI Chart (Gauge with value)
    bmiChart = new Chart(document.getElementById('bmi-chart'), {
        type: 'doughnut',
        data: {
            labels: ['BMI', ''],
            datasets: [{
                data: [bmi, 40 - bmi],
                backgroundColor: [
                    getBMIColor(bmi),
                    isDark ? '#2d3748' : '#edf2f7'
                ],
                borderWidth: 0
            }]
        },
        options: {
            ...compactOptions,
            circumference: 180,
            rotation: -90,
            cutout: '75%',
            plugins: {
                ...compactOptions.plugins,
                legend: { display: false },
                tooltip: { enabled: false },
                doughnutlabel: {
                    labels: [
                        {
                            text: bmi.toFixed(1),
                            font: {
                                size: '18',
                                weight: 'bold'
                            },
                            color: textColor
                        },
                        {
                            text: 'BMI',
                            font: {
                                size: '12'
                            },
                            color: textColor
                        }
                    ]
                }
            }
        },
        plugins: [{
            id: 'doughnutlabel',
            beforeDraw: function(chart) {
                if (chart.config.options.plugins.doughnutlabel) {
                    const width = chart.width,
                          height = chart.height,
                          ctx = chart.ctx;

                    ctx.restore();
                    ctx.font = chart.config.options.plugins.doughnutlabel.labels[0].font.size + "px sans-serif";
                    ctx.textBaseline = "middle";

                    const text = chart.config.options.plugins.doughnutlabel.labels[0].text,
                          textX = Math.round((width - ctx.measureText(text).width) / 2),
                          textY = height / 2 - 10; // Adjusted vertical position

                    ctx.fillStyle = chart.config.options.plugins.doughnutlabel.labels[0].color;
                    ctx.fillText(text, textX, textY);

                    // Second label (BMI text)
                    ctx.font = chart.config.options.plugins.doughnutlabel.labels[1].font.size + "px sans-serif";
                    const text2 = chart.config.options.plugins.doughnutlabel.labels[1].text,
                          textX2 = Math.round((width - ctx.measureText(text2).width) / 2),
                          textY2 = height / 2 + 10; // Adjusted vertical position

                    ctx.fillStyle = chart.config.options.plugins.doughnutlabel.labels[1].color;
                    ctx.fillText(text2, textX2, textY2);
                    ctx.save();
                }
            }
        }]
    });
    
    // Body Fat Chart
    bodyFatChart = new Chart(document.getElementById('body-fat-chart'), {
        type: 'bar',
        data: {
            labels: ['Your Body Fat', 'Healthy Range'],
            datasets: [{
                data: [bodyFat, 25],
                backgroundColor: [
                    '#3498db',
                    isDark ? '#4a5568' : '#e2e8f0'
                ]
            }]
        },
        options: {
            ...compactOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor,
                        font: { size: 10 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: textColor,
                        font: { size: 10 }
                    }
                }
            },
            plugins: {
                ...compactOptions.plugins,
                legend: { display: false }
            }
        }
    });
    
    // Macronutrient Chart
    const proteinGrams = Math.round((calories * 0.3) / 4);
    const carbsGrams = Math.round((calories * 0.4) / 4);
    const fatsGrams = Math.round((calories * 0.3) / 9);

    macroChart = new Chart(document.getElementById('macro-chart'), {
        type: 'pie',
        data: {
            labels: [
                `Protein (${proteinGrams}g)`, 
                `Carbs (${carbsGrams}g)`, 
                `Fats (${fatsGrams}g)`
            ],
            datasets: [{
                data: [30, 40, 30],
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            ...compactOptions,
            plugins: {
                ...compactOptions.plugins,
                legend: {
                    position: 'right',
                    labels: { 
                        color: textColor,
                        font: { size: 10 },
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    });
    
    // Calorie Chart
    calorieChart = new Chart(document.getElementById('calorie-chart'), {
        type: 'line',
        data: {
            labels: ['Basal', 'Activity', 'Total'],
            datasets: [{
                label: 'Calories',
                data: [calories/1.5, calories/3, calories],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            ...compactOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor,
                        font: { size: 10 }
                    }
                },
                x: {
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor,
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

function getBMIColor(bmi) {
    if(bmi < 18.5) return '#3498db';  // Underweight (blue)
    if(bmi < 25) return '#2ecc71';    // Normal (green)
    if(bmi < 30) return '#f39c12';    // Overweight (yellow)
    return '#e74c3c';                 // Obese (red)
}
