const API_KEY = 'DEMO_KEY';
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;

const currentSolElement = document.querySelector('[data-current-sol]');
const currentDate = document.querySelector('[data-current-date]');
const currentTempHigh = document.querySelector('[data-current-temp-high]');
const currentTempLow = document.querySelector('[data-current-temp-low]');
const currentWindSpeed = document.querySelector('[data-current-wind-speed]');
const currentWindDirectionText = document.querySelector('[data-wind-direction-text]');
const currentWindDirectionArrow = document.querySelector('[data-wind-direction-arrow]');

let selectedSolIndex;

getWeather().then(sols => {
    selectedSolIndex = sols.length - 1;
    displaySelectedSol(sols);
});

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

function displayTemperature(temperature) {
    return Math.round(temperature);
}

function displaySpeed(speed) {
    return Math.round(speed);
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