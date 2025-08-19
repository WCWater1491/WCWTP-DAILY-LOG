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

    // **CORRECTED:** The subtraction is now `startPressure - endPressure`
    const delta = startPressure - endPressure;
    deltaSpan.textContent = delta.toFixed(2);

    // **CORRECTED:** The logic now uses `>=` for FAILED and `<` for PASSED
    if (delta >= 0.30) {
        resultSpan.textContent = "FAILED";
        resultSpan.style.color = "red";
    } else {
        resultSpan.textContent = "PASSED";
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
    const itRack2Start = document.getElementById('it-rack2-start').value;
    const itRack2End = document.getElementById('it-rack2-end').value;
    const itRack2Delta = document.getElementById('it-rack2-delta').textContent;
    const itRack2Result = document.getElementById('it-rack2-result').textContent;
    const itRack3Start = document.getElementById('it-rack3-start').value;
    const itRack3End = document.getElementById('it-rack3-end').value;
    const itRack3Delta = document.getElementById('it-rack3-delta').textContent;
    const itRack3Result = document.getElementById('it-rack3-result').textContent;
    const itRack4Start = document.getElementById('it-rack4-start').value;
    const itRack4End = document.getElementById('it-rack4-end').value;
    const itRack4Delta = document.getElementById('it-rack4-delta').textContent;
    const itRack4Result = document.getElementById('it-rack4-result').textContent;
    const combinedNtuMin = document.getElementById('combined-ntu-min').value;
    const combinedNtuMax = document.getElementById('combined-ntu-max').value;
    const combinedNtuAvg = document.getElementById('combined-ntu-avg').value;

    const bleach1Yesterday = document.getElementById('bleach1-yesterday').value;
    const bleach1Today = document.getElementById('bleach1-today').value;
    const bleach1Total = document.getElementById('bleach1-total').textContent;
    const bleach2Yesterday = document.getElementById('bleach2-yesterday').value;
    const bleach2Today = document.getElementById('bleach2-today').value;
    const bleach2Total = document.getElementById('bleach2-total').textContent;
    const fluorideYesterday = document.getElementById('fluoride-yesterday').value;
    const fluorideToday = document.getElementById('fluoride-today').value;
    const fluorideTotal = document.getElementById('fluoride-total').textContent;
    const sodiumHydroxide = document.getElementById('sodium-hydroxide-ft').value;
    const bisulfite = document.getElementById('bisulfite-ft').value;
    const phosphate = document.getElementById('phosphate-ft').value;
    const citricAcid = document.getElementById('citric-acid-ft').value;
    const hcl = document.getElementById('hcl-ft').value;

    const clearWellsLevel = document.getElementById('clear-wells-level').value;
    const missionRidge8am = document.getElementById('mission-ridge-8am').value;
    const missionRidge12pm = document.getElementById('mission-ridge-12pm').value;
    const missionRidge4pm = document.getElementById('mission-ridge-4pm').value;
    const mountainView8am = document.getElementById('mountain-view-8am').value;
    const mountainView12pm = document.getElementById('mountain-view-12pm').value;
    const mountainView4pm = document.getElementById('mountain-view-4pm').value;
    const hwy136_8am = document.getElementById('hwy136-8am').value;
    const hwy136_12pm = document.getElementById('hwy136-12pm').value;
    const hwy136_4pm = document.getElementById('hwy136-4pm').value;

    const finishedTemp = document.getElementById('finished-water-temp').value;
    const contactTime = document.getElementById('contact-time').value;
    const dailyFlowRate = document.getElementById('daily-flow-rate').value;
    const giardiaCTActual = document.getElementById('giardia-ct-actual').textContent;
    const giardiaCTRequired = document.getElementById('giardia-ct-required').textContent;
    const giardiaLogRemoval = document.getElementById('giardia-log-removal').textContent;

    const reportContent = `
        <html>
        <head>
            <title>Daily Log Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1, h2, h3 { text-align: center; }
                .report-section { margin-bottom: 20px; }
                .data-field { margin-bottom: 5px; }
                .data-field strong { display: inline-block; width: 250px; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>Walker County Drinking Water Treatment Facility GA2950003</h1>
            <h2>Daily Log Report</h2>
            <h3>Date: ${date}</h3>
            <h3>Operator Name: ${operatorName}</h3>
            <hr>
            <div class="report-section">
                <h3>Meters and Totals</h3>
                <div class="data-field"><strong>Yesterday's Combined Filtrate:</strong> ${yesterdaysCombinedFiltrate} MG</div>
                <div class="data-field"><strong>WCWSA Yesterday's Reading:</strong> ${wcwsaYesterday} MG</div>
                <div class="data-field"><strong>WCWSA Today's Reading:</strong> ${wcwsaToday} MG</div>
                <div class="data-field"><strong>WCWSA Total:</strong> ${wcwsaTotal} gallons</div>
                <div class="data-field"><strong>Lafayette Yesterday's Reading:</strong> ${lafayetteYesterday} MG</div>
                <div class="data-field"><strong>Lafayette Today's Reading:</strong> ${lafayetteToday} MG</div>
                <div class="data-field"><strong>Lafayette Total:</strong> ${lafayetteTotal} gallons</div>
            </div>
            <div class="report-section">
                <h3>QC Finished Water Sample Tap</h3>
                <div class="data-field"><strong>Chlorine Residual:</strong> ${finishedChlorine}</div>
                <div class="data-field"><strong>Turbidity:</strong> ${finishedTurbidity}</div>
                <div class="data-field"><strong>pH:</strong> ${finishedPh}</div>
                <div class="data-field"><strong>Alkalinity:</strong> ${finishedAlkalinity}</div>
                <div class="data-field"><strong>CaCo3 (Hardness):</strong> ${finishedCaco3}</div>
                <div class="data-field"><strong>Iron:</strong> ${finishedIron}</div>
                <div class="data-field"><strong>Manganese:</strong> ${finishedManganese}</div>
            </div>
            <div class="report-section">
                <h3>QC Raw Water Sample Tap</h3>
                <div class="data-field"><strong>Chlorine Residual:</strong> ${rawChlorine}</div>
                <div class="data-field"><strong>Turbidity:</strong> ${rawTurbidity}</div>
                <div class="data-field"><strong>pH:</strong> ${rawPh}</div>
                <div class="data-field"><strong>Alkalinity:</strong> ${rawAlkalinity}</div>
                <div class="data-field"><strong>CaCo3 (Hardness):</strong> ${rawCaco3}</div>
                <div class="data-field"><strong>Iron:</strong> ${rawIron}</div>
                <div class="data-field"><strong>Manganese:</strong> ${rawManganese}</div>
            </div>
            <div class="report-section">
                <h3>Entry to State Waters</h3>
                <div class="data-field"><strong>pH:</strong> ${statePh}</div>
                <div class="data-field"><strong>NTU:</strong> ${stateNtu}</div>
                <div class="data-field"><strong>Total MG:</strong> ${stateMg}</div>
            </div>
            <div class="report-section">
                <h3>Yesterday's Total Filtrate</h3>
                <div class="data-field"><strong>Rack 1:</strong> ${filtrateRack1} MG</div>
                <div class="data-field"><strong>Rack 2:</strong> ${filtrateRack2} MG</div>
                <div class="data-field"><strong>Rack 3:</strong> ${filtrateRack3} MG</div>
                <div class="data-field"><strong>Rack 4:</strong> ${filtrateRack4} MG</div>
            </div>
            <div class="report-section">
                <h3>Yesterday's NTU</h3>
                <div class="data-field"><strong>Rack 1 MIN:</strong> ${ntuRack1Min}</div>
                <div class="data-field"><strong>Rack 1 MAX:</strong> ${ntuRack1Max}</div>
                <div class="data-field"><strong>Rack 1 Average:</strong> ${ntuRack1Avg}</div>
                <div class="data-field"><strong>Rack 2 MIN:</strong> ${ntuRack2Min}</div>
                <div class="data-field"><strong>Rack 2 MAX:</strong> ${ntuRack2Max}</div>
                <div class="data-field"><strong>Rack 2 Average:</strong> ${ntuRack2Avg}</div>
                <div class="data-field"><strong>Rack 3 MIN:</strong> ${ntuRack3Min}</div>
                <div class="data-field"><strong>Rack 3 MAX:</strong> ${ntuRack3Max}</div>
                <div class="data-field"><strong>Rack 3 Average:</strong> ${ntuRack3Avg}</div>
                <div class="data-field"><strong>Rack 4 MIN:</strong> ${ntuRack4Min}</div>
                <div class="data-field"><strong>Rack 4 MAX:</strong> ${ntuRack4Max}</div>
                <div class="data-field"><strong>Rack 4 Average:</strong> ${ntuRack4Avg}</div>
            </div>
            <div class="report-section">
                <h3>Yesterday's IT Data</h3>
                <div class="data-field"><strong>Rack 1 Start Pressure:</strong> ${itRack1Start}</div>
                <div class="data-field"><strong>Rack 1 End Pressure:</strong> ${itRack1End}</div>
                <div class="data-field"><strong>Rack 1 Delta psi:</strong> ${itRack1Delta}</div>
                <div class="data-field"><strong>Rack 1 Result:</strong> ${itRack1Result}</div>
                <div class="data-field"><strong>Rack 2 Start Pressure:</strong> ${itRack2Start}</div>
                <div class="data-field"><strong>Rack 2 End Pressure:</strong> ${itRack2End}</div>
                <div class="data-field"><strong>Rack 2 Delta psi:</strong> ${itRack2Delta}</div>
                <div class="data-field"><strong>Rack 2 Result:</strong> ${itRack2Result}</div>
                <div class="data-field"><strong>Rack 3 Start Pressure:</strong> ${itRack3Start}</div>
                <div class="data-field"><strong>Rack 3 End Pressure:</strong> ${itRack3End}</div>
                <div class="data-field"><strong>Rack 3 Delta psi:</strong> ${itRack3Delta}</div>
                <div class="data-field"><strong>Rack 3 Result:</strong> ${itRack3Result}</div>
                <div class="data-field"><strong>Rack 4 Start Pressure:</strong> ${itRack4Start}</div>
                <div class="data-field"><strong>Rack 4 End Pressure:</strong> ${itRack4End}</div>
                <div class="data-field"><strong>Rack 4 Delta psi:</strong> ${itRack4Delta}</div>
                <div class="data-field"><strong>Rack 4 Result:</strong> ${itRack4Result}</div>
            </div>
            <div class="report-section">
                <h3>Yesterday's Combined Filtrate NTU</h3>
                <div class="data-field"><strong>MIN:</strong> ${combinedNtuMin}</div>
                <div class="data-field"><strong>MAX:</strong> ${combinedNtuMax}</div>
                <div class="data-field"><strong>Average:</strong> ${combinedNtuAvg}</div>
            </div>
            <div class="report-section">
                <h3>Chemical Tanks</h3>
                <div class="data-field"><strong>Bleach Day Tank 1 Yesterday:</strong> ${bleach1Yesterday} gallons</div>
                <div class="data-field"><strong>Bleach Day Tank 1 Today:</strong> ${bleach1Today} gallons</div>
                <div class="data-field"><strong>Bleach Day Tank 1 Total Used:</strong> ${bleach1Total} gallons</div>
                <div class="data-field"><strong>Bleach Day Tank 2 Yesterday:</strong> ${bleach2Yesterday} gallons</div>
                <div class="data-field"><strong>Bleach Day Tank 2 Today:</strong> ${bleach2Today} gallons</div>
                <div class="data-field"><strong>Bleach Day Tank 2 Total Used:</strong> ${bleach2Total} gallons</div>
                <div class="data-field"><strong>Fluoride Day Tank Yesterday:</strong> ${fluorideYesterday} gallons</div>
                <div class="data-field"><strong>Fluoride Day Tank Today:</strong> ${fluorideToday} gallons</div>
                <div class="data-field"><strong>Fluoride Day Tank Total Used:</strong> ${fluorideTotal} gallons</div>
            </div>
            <div class="report-section">
                <h3>Chemical Tank Levels</h3>
                <div class="data-field"><strong>Sodium Hydroxide (Caustic) Tank:</strong> ${sodiumHydroxide} ft.</div>
                <div class="data-field"><strong>Bisulfite (For Neutralization) Tank:</strong> ${bisulfite} ft.</div>
                <div class="data-field"><strong>Phosphate Tank:</strong> ${phosphate} ft.</div>
                <div class="data-field"><strong>Citric Acid Tank:</strong> ${citricAcid} ft.</div>
                <div class="data-field"><strong>Hydrochloric Acid (HCL) Tank:</strong> ${hcl} ft.</div>
            </div>
            <div class="report-section">
                <h3>Plant Clear Wells & Distribution Tanks</h3>
                <div class="data-field"><strong>Clear Wells Level:</strong> ${clearWellsLevel} %</div>
                <div class="data-field"><strong>South Mission Ridge 8AM:</strong> ${missionRidge8am} %</div>
                <div class="data-field"><strong>South Mission Ridge 12PM:</strong> ${missionRidge12pm} %</div>
                <div class="data-field"><strong>South Mission Ridge 4PM:</strong> ${missionRidge4pm} %</div>
                <div class="data-field"><strong>Mountain View 8AM:</strong> ${mountainView8am} %</div>
                <div class="data-field"><strong>Mountain View 12PM:</strong> ${mountainView12pm} %</div>
                <div class="data-field"><strong>Mountain View 4PM:</strong> ${mountainView4pm} %</div>
                <div class="data-field"><strong>HWY. 136 8AM:</strong> ${hwy136_8am} %</div>
                <div class="data-field"><strong>HWY. 136 12PM:</strong> ${hwy136_12pm} %</div>
                <div class="data-field"><strong>HWY. 136 4PM:</strong> ${hwy136_4pm} %</div>
            </div>
            <div class="report-section">
                <h3>Giardia Inactivation Data</h3>
                <div class="data-field"><strong>Finished Water Temperature:</strong> ${finishedTemp} °C</div>
                <div class="data-field"><strong>Contact Time (T):</strong> ${contactTime} minutes</div>
                <div class="data-field"><strong>Daily Flow Rate:</strong> ${dailyFlowRate} MGD</div>
                <div class="data-field"><strong>Actual CT:</strong> ${giardiaCTActual}</div>
                <div class="data-field"><strong>Required CT:</strong> ${giardiaCTRequired}</div>
                <div class="data-field"><strong>Final Log Removal:</strong> ${giardiaLogRemoval}</div>
            </div>
            <hr>
            <p style="text-align: right;">Report Generated: ${new Date().toLocaleString()}</p>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
});

document.getElementById('export-button').addEventListener('click', function() {
    const date = document.getElementById('date-input').value;
    const operatorName = document.getElementById('operator-name').value;
    
    const data = {
        'Date': date,
        'Operator Name': operatorName,
        'WCWSA Yesterday Reading (MG)': document.getElementById('wcwsa-yesterday-reading').value,
        'WCWSA Today Reading (MG)': document.getElementById('wcwsa-today-reading').value,
        'WCWSA Total (gallons)': document.getElementById('wcwsa-total').textContent.replace(/,/g, ''),
        'Lafayette Yesterday Reading (MG)': document.getElementById('lafayette-yesterday-reading').value,
        'Lafayette Today Reading (MG)': document.getElementById('lafayette-today-reading').value,
        'Lafayette Total (gallons)': document.getElementById('lafayette-total').textContent.replace(/,/g, ''),
        'Yesterday Combined Filtrate (MG)': document.getElementById('yesterdays-combined-filtrate').value,
        'Finished Water Chlorine Residual': document.getElementById('finished-chlorine').value,
        'Finished Water Turbidity': document.getElementById('finished-turbidity').value,
        'Finished Water pH': document.getElementById('finished-ph').value,
        'Finished Water Alkalinity': document.getElementById('finished-alkalinity').value,
        'Finished Water CaCo3': document.getElementById('finished-caco3').value,
        'Finished Water Iron': document.getElementById('finished-iron').value,
        'Finished Water Manganese': document.getElementById('finished-manganese').value,
        'Raw Water Chlorine Residual': document.getElementById('raw-chlorine').value,
        'Raw Water Turbidity': document.getElementById('raw-turbidity').value,
        'Raw Water pH': document.getElementById('raw-ph').value,
        'Raw Water Alkalinity': document.getElementById('raw-alkalinity').value,
        'Raw Water CaCo3': document.getElementById('raw-caco3').value,
        'Raw Water Iron': document.getElementById('raw-iron').value,
        'Raw Water Manganese': document.getElementById('raw-manganese').value,
        'State Waters pH': document.getElementById('state-ph').value,
        'State Waters NTU': document.getElementById('state-ntu').value,
        'State Waters Total MG': document.getElementById('state-mg').value,
        'Yesterday Filtrate Rack 1 (MG)': document.getElementById('filtrate-rack1').value,
        'Yesterday Filtrate Rack 2 (MG)': document.getElementById('filtrate-rack2').value,
        'Yesterday Filtrate Rack 3 (MG)': document.getElementById('filtrate-rack3').value,
        'Yesterday Filtrate Rack 4 (MG)': document.getElementById('filtrate-rack4').value,
        'Yesterday NTU Rack 1 MIN': document.getElementById('ntu-rack1-min').value,
        'Yesterday NTU Rack 1 MAX': document.getElementById('ntu-rack1-max').value,
        'Yesterday NTU Rack 1 AVG': document.getElementById('ntu-rack1-avg').value,
        'Yesterday NTU Rack 2 MIN': document.getElementById('ntu-rack2-min').value,
        'Yesterday NTU Rack 2 MAX': document.getElementById('ntu-rack2-max').value,
        'Yesterday NTU Rack 2 AVG': document.getElementById('ntu-rack2-avg').value,
        'Yesterday NTU Rack 3 MIN': document.getElementById('ntu-rack3-min').value,
        'Yesterday NTU Rack 3 MAX': document.getElementById('ntu-rack3-max').value,
        'Yesterday NTU Rack 3 AVG': document.getElementById('ntu-rack3-avg').value,
        'Yesterday NTU Rack 4 MIN': document.getElementById('ntu-rack4-min').value,
        'Yesterday NTU Rack 4 MAX': document.getElementById('ntu-rack4-max').value,
        'Yesterday NTU Rack 4 AVG': document.getElementById('ntu-rack4-avg').value,
        'Yesterday IT Rack 1 Start Pressure': document.getElementById('it-rack1-start').value,
        'Yesterday IT Rack 1 End Pressure': document.getElementById('it-rack1-end').value,
        'Yesterday IT Rack 1 Delta psi': document.getElementById('it-rack1-delta').textContent,
        'Yesterday IT Rack 1 Result': document.getElementById('it-rack1-result').textContent,
        'Yesterday IT Rack 2 Start Pressure': document.getElementById('it-rack2-start').value,
        'Yesterday IT Rack 2 End Pressure': document.getElementById('it-rack2-end').value,
        'Yesterday IT Rack 2 Delta psi': document.getElementById('it-rack2-delta').textContent,
        'Yesterday IT Rack 2 Result': document.getElementById('it-rack2-result').textContent,
        'Yesterday IT Rack 3 Start Pressure': document.getElementById('it-rack3-start').value,
        'Yesterday IT Rack 3 End Pressure': document.getElementById('it-rack3-end').value,
        'Yesterday IT Rack 3 Delta psi': document.getElementById('it-rack3-delta').textContent,
        'Yesterday IT Rack 3 Result': document.getElementById('it-rack3-result').textContent,
        'Yesterday IT Rack 4 Start Pressure': document.getElementById('it-rack4-start').value,
        'Yesterday IT Rack 4 End Pressure': document.getElementById('it-rack4-end').value,
        'Yesterday IT Rack 4 Delta psi': document.getElementById('it-rack4-delta').textContent,
        'Yesterday IT Rack 4 Result': document.getElementById('it-rack4-result').textContent,
        'Yesterday Combined Filtrate NTU MIN': document.getElementById('combined-ntu-min').value,
        'Yesterday Combined Filtrate NTU MAX': document.getElementById('combined-ntu-max').value,
        'Yesterday Combined Filtrate NTU AVG': document.getElementById('combined-ntu-avg').value,
        'Bleach Day Tank 1 Yesterday (gal)': document.getElementById('bleach1-yesterday').value,
        'Bleach Day Tank 1 Today (gal)': document.getElementById('bleach1-today').value,
        'Bleach Day Tank 1 Total Used (gal)': document.getElementById('bleach1-total').textContent,
        'Bleach Day Tank 2 Yesterday (gal)': document.getElementById('bleach2-yesterday').value,
        'Bleach Day Tank 2 Today (gal)': document.getElementById('bleach2-today').value,
        'Bleach Day Tank 2 Total Used (gal)': document.getElementById('bleach2-total').textContent,
        'Fluoride Day Tank Yesterday (gal)': document.getElementById('fluoride-yesterday').value,
        'Fluoride Day Tank Today (gal)': document.getElementById('fluoride-today').value,
        'Fluoride Day Tank Total Used (gal)': document.getElementById('fluoride-total').textContent,
        'Sodium Hydroxide Tank (ft)': document.getElementById('sodium-hydroxide-ft').value,
        'Bisulfite Tank (ft)': document.getElementById('bisulfite-ft').value,
        'Phosphate Tank (ft)': document.getElementById('phosphate-ft').value,
        'Citric Acid Tank (ft)': document.getElementById('citric-acid-ft').value,
        'HCL Tank (ft)': document.getElementById('hcl-ft').value,
        'Plant Clear Wells Level (%)': document.getElementById('clear-wells-level').value,
        'South Mission Ridge Tank 8AM (%)': document.getElementById('mission-ridge-8am').value,
        'South Mission Ridge Tank 12PM (%)': document.getElementById('mission-ridge-12pm').value,
        'South Mission Ridge Tank 4PM (%)': document.getElementById('mission-ridge-4pm').value,
        'Mountain View Tank 8AM (%)': document.getElementById('mountain-view-8am').value,
        'Mountain View Tank 12PM (%)': document.getElementById('mountain-view-12pm').value,
        'Mountain View Tank 4PM (%)': document.getElementById('mountain-view-4pm').value,
        'HWY. 136 Tanks 8AM (%)': document.getElementById('hwy136-8am').value,
        'HWY. 136 Tanks 12PM (%)': document.getElementById('hwy136-12pm').value,
        'HWY. 136 Tanks 4PM (%)': document.getElementById('hwy136-4pm').value,
        'Finished Water Temp (°C)': document.getElementById('finished-water-temp').value,
        'Contact Time (min)': document.getElementById('contact-time').value,
        'Daily Flow Rate (MGD)': document.getElementById('daily-flow-rate').value,
        'Giardia CT Actual': document.getElementById('giardia-ct-actual').textContent,
        'Giardia CT Required': document.getElementById('giardia-ct-required').textContent,
        'Giardia Log Removal': document.getElementById('giardia-log-removal').textContent
    };

    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(value => {
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
        }
        return value;
    }).join(',');
    const csvContent = headers + '\n' + values;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Plant_Log_Record_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});