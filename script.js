// Function to check and clear old data
function clearOldData() {
    const lastSavedDate = localStorage.getItem('lastSavedDate');
    
    if (lastSavedDate) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        
        if (now - lastSavedDate > oneWeek) {
            localStorage.removeItem('plantLogData');
            console.log("Old data has been cleared.");
        }
    }
    
    localStorage.setItem('lastSavedDate', new Date().getTime());
}

// A list of all approved operators
const approvedOperators = [
    "Randall Haney",
    "Charles Reynolds",
    "Charlie Rutledge",
    "Danny Carlock"
];

// Function to check the operator's name and enable/disable the form
function checkOperatorName() {
    const operatorNameInput = document.getElementById("operator-name");
    const enteredName = operatorNameInput.value.trim();
    
    const isApproved = approvedOperators.includes(enteredName);
    
    const dataFields = document.querySelectorAll(".data-field");
    
    dataFields.forEach(field => {
        field.disabled = !isApproved;
    });
}

// Function to handle the calculations for a meter
function handleMeterCalculation(todayReadingId, yesterdayReadingId, totalDisplayId) {
    const todayReading = parseFloat(document.getElementById(todayReadingId).value) || 0;
    const yesterdayReading = parseFloat(document.getElementById(yesterdayReadingId).value) || 0;
    const totalDisplay = document.getElementById(totalDisplayId);

    const difference = todayReading - yesterdayReading;
    const gallons = difference * 1000000;

    totalDisplay.textContent = gallons.toLocaleString();
}

// Function to calculate IT data for a specific rack
function calculateITData(rackNumber) {
    const startPressure = parseFloat(document.getElementById(`it-rack${rackNumber}-start`).value) || 0;
    const endPressure = parseFloat(document.getElementById(`it-rack${rackNumber}-end`).value) || 0;
    const deltaSpan = document.getElementById(`it-rack${rackNumber}-delta`);
    const resultSpan = document.getElementById(`it-rack${rackNumber}-result`);

    const delta = endPressure - startPressure;
    deltaSpan.textContent = delta.toFixed(2);

    if (delta > 0.3) {
        resultSpan.textContent = "FAILED";
        resultSpan.style.color = "red";
    } else {
        resultSpan.textContent = "PASS";
        resultSpan.style.color = "green";
    }
}

// The total volume of your clearwells in gallons
const CLEARWELL_VOLUME_GALLONS = 4000000;

// CT Table for Giardia Inactivation (3-Log) based on pH and Temp
const giardiaCTTable = {
    0.5: { 7.0: 139, 7.5: 167, 8.0: 200, 8.5: 242, 9.0: 289 },
    5.0: { 7.0: 97, 7.5: 116, 8.0: 139, 8.5: 167, 9.0: 200 },
    10.0: { 7.0: 73, 7.5: 87, 8.0: 104, 8.5: 125, 9.0: 150 },
    15.0: { 7.0: 48, 7.5: 58, 8.0: 70, 8.5: 84, 9.0: 100 },
    20.0: { 7.0: 36, 7.5: 44, 8.0: 52, 8.5: 63, 9.0: 75 },
    25.0: { 7.0: 24, 7.5: 29, 8.0: 35, 8.5: 42, 9.0: 50 },
};

// Function to perform the Giardia log removal calculation
function calculateGiardiaLogRemoval() {
    const temp = parseFloat(document.getElementById('finished-water-temp').value);
    const ph = parseFloat(document.getElementById('finished-ph').value);
    const chlorineResidual = parseFloat(document.getElementById('finished-chlorine').value);
    const dailyFlowRate = parseFloat(document.getElementById('daily-flow-rate').value);

    if (isNaN(temp) || isNaN(ph) || isNaN(chlorineResidual) || isNaN(dailyFlowRate) || dailyFlowRate === 0) {
        document.getElementById('giardia-ct-required').textContent = 'N/A';
        document.getElementById('giardia-ct-actual').textContent = 'N/A';
        document.getElementById('giardia-log-removal').textContent = 'N/A';
        return;
    }

    const flowRateGPM = dailyFlowRate * 1000000 / 1440;
    const contactTimeMinutes = CLEARWELL_VOLUME_GALLONS / flowRateGPM;
    const actualCT = chlorineResidual * contactTimeMinutes;

    let requiredCT = 'N/A';
    if (giardiaCTTable[temp] && giardiaCTTable[temp][ph]) {
        requiredCT = giardiaCTTable[temp][ph];
    }

    document.getElementById('giardia-ct-actual').textContent = actualCT.toFixed(2);
    document.getElementById('giardia-ct-required').textContent = requiredCT;
    
    let logRemoval = 'N/A';
    if (requiredCT !== 'N/A') {
        logRemoval = (actualCT / requiredCT) * 3;
        document.getElementById('giardia-log-removal').textContent = logRemoval.toFixed(2);
    }
}

// Event listeners
document.getElementById("operator-name").addEventListener("change", checkOperatorName);
window.onload = function() {
    checkOperatorName();
    clearOldData();
};

document.getElementById('wcwsa-today-reading').addEventListener('input', () => {
    handleMeterCalculation('wcwsa-today-reading', 'wcwsa-yesterday-reading', 'wcwsa-total');
});
document.getElementById('lafayette-today-reading').addEventListener('input', () => {
    handleMeterCalculation('lafayette-today-reading', 'lafayette-yesterday-reading', 'lafayette-total');
});

// New IT data listeners
document.getElementById('it-rack1-start').addEventListener('input', () => calculateITData(1));
document.getElementById('it-rack1-end').addEventListener('input', () => calculateITData(1));
document.getElementById('it-rack2-start').addEventListener('input', () => calculateITData(2));
document.getElementById('it-rack2-end').addEventListener('input', () => calculateITData(2));
document.getElementById('it-rack3-start').addEventListener('input', () => calculateITData(3));
document.getElementById('it-rack3-end').addEventListener('input', () => calculateITData(3));
document.getElementById('it-rack4-start').addEventListener('input', () => calculateITData(4));
document.getElementById('it-rack4-end').addEventListener('input', () => calculateITData(4));

document.getElementById('bleach1-today').addEventListener('input', () => {
    handleMeterCalculation('bleach1-today', 'bleach1-yesterday', 'bleach1-total');
});
document.getElementById('bleach2-today').addEventListener('input', () => {
    handleMeterCalculation('bleach2-today', 'bleach2-yesterday', 'bleach2-total');
});
document.getElementById('fluoride-today').addEventListener('input', () => {
    handleMeterCalculation('fluoride-today', 'fluoride-yesterday', 'fluoride-total');
});
document.getElementById('finished-water-temp').addEventListener('input', calculateGiardiaLogRemoval);
document.getElementById('finished-ph').addEventListener('input', calculateGiardiaLogRemoval);
document.getElementById('finished-chlorine').addEventListener('input', calculateGiardiaLogRemoval);
document.getElementById('daily-flow-rate').addEventListener('input', calculateGiardiaLogRemoval);

document.getElementById('save-button').addEventListener('click', function(event) {
    event.preventDefault();

    const allInputs = document.querySelectorAll('input.data-field');
    allInputs.forEach(input => {
        input.classList.remove('required-field');
    });

    let hasErrors = false;

    const calculatedFieldIds = [
        'wcwsa-today-reading',
        'lafayette-today-reading',
        'it-rack1-end',
        'it-rack2-end',
        'it-rack3-end',
        'it-rack4-end',
        'bleach1-today',
        'bleach2-today',
        'fluoride-today',
        'daily-flow-rate'
    ];

    calculatedFieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input.value) {
            input.classList.add('required-field');
            hasErrors = true;
        }
    });

    if (hasErrors) {
        alert("Please complete all required fields before saving.");
        return;
    }

    alert("Data validation complete. The log is ready to be saved!");
});

document.getElementById('print-button').addEventListener('click', function() {
    const date = document.getElementById('date-input').value;
    const operatorName = document.getElementById('operator-name').value;
    
    const wcwsaYesterday = document.getElementById('wcwsa-yesterday-reading').value;
    const wcwsaToday = document.getElementById('wcwsa-today-reading').value;
    const wcwsaTotal = document.getElementById('wcwsa-total').textContent;
    const lafayetteYesterday = document.getElementById('lafayette-yesterday-reading').value;
    const lafayetteToday = document.getElementById('lafayette-today-reading').value;
    const lafayetteTotal = document.getElementById('lafayette-total').textContent;
    const yesterdaysCombinedFiltrate = document.getElementById('yesterdays-combined-filtrate').value;

    const finishedChlorine = document.getElementById('finished-chlorine').value;
    const finishedTurbidity = document.getElementById('finished-turbidity').value;
    const finishedPh = document.getElementById('finished-ph').value;
    const finishedAlkalinity = document.getElementById('finished-alkalinity').value;
    const finishedCaco3 = document.getElementById('finished-caco3').value;
    const finishedIron = document.getElementById('finished-iron').value;
    const finishedManganese = document.getElementById('finished-manganese').value;
    const rawChlorine = document.getElementById('raw-chlorine').value;
    const rawTurbidity = document.getElementById('raw-turbidity').value;
    const rawPh = document.getElementById('raw-ph').value;
    const rawAlkalinity = document.getElementById('raw-alkalinity').value;
    const rawCaco3 = document.getElementById('raw-caco3').value;
    const rawIron = document.getElementById('raw-iron').value;
    const rawManganese = document.getElementById('raw-manganese').value;
    const statePh = document.getElementById('state-ph').value;
    const stateNtu = document.getElementById('state-ntu').value;
    const stateMg = document.getElementById('state-mg').value;

    const filtrateRack1 = document.getElementById('filtrate-rack1').value;
    const filtrateRack2 = document.getElementById('filtrate-rack2').value;
    const filtrateRack3 = document.getElementById('filtrate-rack3').value;
    const filtrateRack4 = document.getElementById('filtrate-rack4').value;
    const ntuRack1Min = document.getElementById('ntu-rack1-min').value;
    const ntuRack1Max = document.getElementById('ntu-rack1-max').value;
    const ntuRack1Avg = document.getElementById('ntu-rack1-avg').value;
    const ntuRack2Min = document.getElementById('ntu-rack2-min').value;
    const ntuRack2Max = document.getElementById('ntu-rack2-max').value;
    const ntuRack2Avg = document.getElementById('ntu-rack2-avg').value;
    const ntuRack3Min = document.getElementById('ntu-rack3-min').value;
    const ntuRack3Max = document.getElementById('ntu-rack3-max').value;
    const ntuRack3Avg = document.getElementById('ntu-rack3-avg').value;
    const ntuRack4Min = document.getElementById('ntu-rack4-min').value;
    const ntuRack4Max = document.getElementById('ntu-rack4-max').value;
    const ntuRack4Avg = document.getElementById('ntu-rack4-avg').value;
    const itRack1Start = document.getElementById('it-rack1-start').value;
    const itRack1End = document.getElementById('it-rack1-end').value;
    const itRack1Delta = document.getElementById('it-rack1-delta').textContent;
    const itRack1Result = document.getElementById('it-rack1-result').textContent;