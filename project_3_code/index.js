function createCharts(selectedYear) {
    fetch('ufo_sightings.us_ufo_sightings.json')
        .then(response => response.json())
        .then(data => {
            // Filter data based on the selected year
            let filteredData = data.filter(entry => entry.Year == selectedYear);

            // Initialize an object to store counts for each hour in each month
            let countsByMonthAndHour = {};

            // Populate the object with each month and hour as properties and initial count set to 0
            for (let month = 1; month <= 12; month++) {
                countsByMonthAndHour[month] = Array.from({ length: 24 }, () => 0);
            }

            // Iterate through the filtered data
            for (let entry of filteredData) {
                // Increment the count for the corresponding month and hour
                countsByMonthAndHour[entry.Month][entry.Hour]++;
            }

            // Create data for Plotly chart
            let bubbleData = [];
            let maxCount = Math.max(...Object.values(countsByMonthAndHour).flat());

            for (let month = 1; month <= 12; month++) {
                for (let hour = 0; hour < 24; hour++) {
                    let size = countsByMonthAndHour[month][hour] / maxCount * 50; // Adjust the scaling factor as needed
                    bubbleData.push({
                        x: month,
                        y: hour + 1, // Shift hours to start from 1
                        size: size,
                        count: countsByMonthAndHour[month][hour] // Store count for hover text
                    });
                }
            }

            // Map numeric month values to month names
            let monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            // Create the Plotly chart
            let bubbleLayout = {
                title: "UFO Sightings by Hour & Month",
                xaxis: {
                    title: "Month",
                    tickmode: 'array',
                    tickvals: Array.from({ length: 12 }, (_, i) => i + 1),
                    ticktext: monthNames
                },
                yaxis: {
                    title: "Hour",
                    tickmode: 'linear',
                    tickvals: Array.from({ length: 24 }, (_, i) => i + 1),
                },
                height: 800,
                width: 1000
            };

            let bubbleDataPlotly = [
                {
                    type: "scatter",
                    mode: "markers",
                    x: bubbleData.map(entry => entry.x),
                    y: bubbleData.map(entry => entry.y),
                    marker: {
                        size: bubbleData.map(entry => entry.size),
                        color: bubbleData.map(entry => entry.x), // Assign different colors based on the month
                        colorscale: "Viridis", // You can choose a different colorscale
                        colorbar: {
                            title: "Month"
                        }
                    },
                    // Add text property for hover text
                    text: bubbleData.map(entry => `Count: ${entry.count}`)
                }
            ];
            console.log("bubble works")
            // Call Plotly.newPlot to render the chart
            Plotly.newPlot("bubble", bubbleDataPlotly, bubbleLayout);
        });
}

// Call the createCharts function to initiate the data fetching and chart creation
createCharts();

getData(); // Call without a parameter

// Function to fetch and plot data
async function getData(selectedYear) {
    let response = await fetch('ufo_sightings.us_ufo_sightings.json');
    let data = await response.json();

    // Filter data based on selected year
    if (selectedYear) {
        data = data.filter(entry => entry.Year == selectedYear);
    }
    console.log("data", data)
    console.log("selYear", selectedYear)
    // Count sightings for each UFO shape
    let shapeCounts = {};
    data.forEach(entry => {
        const shape = entry.UFO_shape;
        shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
    });

    // Create traces for the bar chart
    let trace1 = {
        x: Object.keys(shapeCounts),
        y: Object.values(shapeCounts),
        type: 'bar',
        marker: {
            color: getRandomColors(Object.keys(shapeCounts).length)
        }
    };

    // Create layout
    let layout = {
        title: 'UFO Sightings by Shape',
        xaxis: {
            title: 'UFO Shape'
        },
        yaxis: {
            title: 'Number of Sightings'
        },
        height: 400,
        width: 1000
    };

    console.log("bar works")
    // Plot the bar chart
    Plotly.newPlot('bar-chart', [trace1], layout);
}

// Function to generate an array of random colors
function getRandomColors(count) {
    let colors = [];
    for (let i = 0; i < count; i++) {
        colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }
    return colors;
}


function optionChanged() {
    // Get the selected year from the dropdown
    let selectedYear = d3.select("#selDataset").property("value");

    // Call createCharts with the selected year
    createCharts(selectedYear);
    getData(selectedYear)
}


function init() {
    let dropdown = d3.select("#selDataset");

    // Load the JSON data
    d3.json("ufo_sightings.us_ufo_sightings.json").then((data) => {
        let years = data.map(entry => entry.Year); // Assuming 'data' is an array of objects

        // Remove duplicate years
        let uniqueYears = Array.from(new Set(years));

        // Populate the dropdown with unique years
        uniqueYears.forEach(year => {
            dropdown.append("option").text(year).property("value", year);
        });

        // Create the chart with the first year
        createCharts(uniqueYears[0]);
        getData(uniqueYears[0]);
    });
}

// Call the init function to initiate the dropdown and chart creation
init();



