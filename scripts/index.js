const API_KEY = 'AVBHY28pVRatkjVD6sGNG6TbcOv4LBPi1S3EOWoj';
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;

const currentSolElement = document.querySelector('[data-current-sol]');
const currentDate = document.querySelector('[data-current-date]');
const currentTempHigh = document.querySelector('[data-current-temp-high]');
const currentTempLow = document.querySelector('[data-current-temp-low]');
const currentWindSpeed = document.querySelector('[data-current-wind-speed]');
const currentWindDirectionText = document.querySelector('[data-wind-direction-text]');
const currentWindDirectionArrow = document.querySelector('[data-wind-direction-arrow]');
const metricRadio = document.getElementsByName('unit');
const toggleUnitsButton = document.querySelector('[data-unit-toggle]');
const metricUnitRadio = document.getElementById('cel');
const imperialUnitRadio = document.getElementById('fah');
const temperatureUnits = document.querySelectorAll('[data-temp-unit]');
const speedUnits = document.querySelectorAll('[data-speed-unit]');
const previousWeather = document.querySelector('.previous-weather');
const showPreviousWeatherButton = document.querySelector('.show-previous-weather');

const previousSolTemplate = document.querySelector('[data-previous-sol-template]')
const previousSolContainer = document.querySelector('[data-previous-sols]')

let selectedSolIndex;

getWeather().then(sols => {
    selectedSolIndex = sols.length - 1;
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits(metricUnitRadio.checked);

    toggleUnitsButton.addEventListener('click', () => {
        let isCurrentlyMetric = metricUnitRadio.checked;
        metricUnitRadio.checked = !isCurrentlyMetric;
        imperialUnitRadio.checked = isCurrentlyMetric;
        unitChangeHandler(sols);
    });

    metricUnitRadio.addEventListener('change', () => {
        unitChangeHandler(sols);
    });

    imperialUnitRadio.addEventListener('change', () => {
        unitChangeHandler(sols);
    });

    showPreviousWeatherButton.addEventListener('click', ()=> {
        previousWeather.classList.toggle('show-weather');
        if (previousWeather.classList.contains('show-weather')) {
            displayPreviousSols(sols);
        }
    });
});

function unitChangeHandler(sols) {
    displaySelectedSol(sols);
    updateUnits(metricUnitRadio.checked);
    displayPreviousSols(sols);
}

function displaySelectedSol(sols) {
    const selectedSol = sols[selectedSolIndex];
    currentSolElement.innerText = selectedSol.sol;
    currentDate.innerText = displayDate(selectedSol.date);
    currentTempHigh.innerText = displayTemperature(selectedSol.maxTemp);
    currentTempLow.innerText = displayTemperature(selectedSol.minTemp);
    currentWindSpeed.innerText = displaySpeed(selectedSol.windSpeed);
    currentWindDirectionArrow.style.setProperty('--direction',
        `${selectedSol.windDirectionInDegress}deg`
    );
    currentWindDirectionText.innerText = selectedSol.windDirectionCardinal;
}

function displayDate(date) {
    return date.toLocaleDateString(
        undefined,
        { day: 'numeric', month: 'long'}
    );
}

function displayPreviousSols(sols) {
    previousSolContainer.innerHTML = '';
    const isMetric = metricUnitRadio.checked;

    sols.forEach((solData, index) => {
        const container = previousSolTemplate.content.cloneNode(true);
        container.querySelector('[data-sol').innerText = solData.sol;
        container.querySelector('[data-date').innerText = displayDate(solData.date);
        container.querySelector('[data-temp-high]').innerText = displayTemperature(solData.maxTemp);
        container.querySelector('[data-temp-low]').innerText = displayTemperature(solData.minTemp);
        const allTempUnits = container.querySelectorAll('[data-temp-unit]');
        allTempUnits.forEach(tempUnit => {
            updateTempUnits(isMetric, tempUnit);
        });
        container.querySelector('[data-select-button]').addEventListener('click', () => {
            selectedSolIndex = index;
            displaySelectedSol(sols);
        })
        previousSolContainer.appendChild(container);
    })
}

function displayTemperature(temperature) {
    const isMetric = metricUnitRadio.checked;
    return isMetric ? Math.round(temperature) : Math.round((temperature * (9/5)) + 32);
}

function displaySpeed(speed) {
    const isMetric = metricUnitRadio.checked;
    return isMetric ? Math.round(speed) : Math.round(speed / 1.609);
}

function getWeather() {
    return fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const {
                sol_keys,
                validity_checks,
                ...solData
            } = data;
        
            return Object.entries(solData).map(([sol, data]) => {
                return {
                    sol: sol,
                    maxTemp: data.AT.mx,
                    minTemp: data.AT.mn,
                    windSpeed: data.HWS.av,
                    windDirectionInDegress: data.WD.most_common.compass_degrees,
                    windDirectionCardinal: data.WD.most_common.compass_point,
                    date: new Date(data.First_UTC)
                }
            });
    });
}

function updateUnits(isMetric) {
    for (speedUnit of speedUnits) {
        speedUnit.innerText = isMetric ? 'kph' : 'mph';
    }
    
    for (tempUnit of temperatureUnits) {
        updateTempUnits(isMetric, tempUnit);
    }
}

function updateTempUnits(isMetric, element) {
    element.innerText = isMetric ? 'C' : 'F';
}