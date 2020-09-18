'use strict';

//this is the base URL for the API - add parameters to this without editing this original const
const searchURL = 'https://api.fda.gov/drug/event.json';
//retrieve latest 20 recalled med devices
const searchRecallURL = 'https://api.fda.gov/device/enforcement.json?sort=report_date:desc&limit=20';

function addSearchParam(url, paramName, paramValue) {
    //replace spaces and characters w proper %20 and encoding
    paramValue = encodeURIComponent(paramValue);
    //add the special syntax used by openFDA for search query
    return url + '?search=' + paramName + `:"` + paramValue + `"`;
}

function displayResults(responseJson) {
    //clear the results so we can repopulate substance_name
    $(`#results-list`).empty();

    for (let i = 0; i < responseJson.results.length; i++) {
        $(`#results-list`).append(
            `<li>
            <p class="list-entry-header">Patient Onset Age:</p>
            <p class="list-entry-data"> ${responseJson.results[i].patient.patientonsetage}</p>`
        );

        //Add a header for Med Product area
        $(`#results-list`).append(
            `<p class="list-entry-header">Medicinal Product(s) Taken:</p>`
        );

        for (let d = 0; d < responseJson.results[i].patient.drug.length; d++) {
            $(`#results-list`).append(
                `<p class="list-entry-data">${responseJson.results[i].patient.drug[d].medicinalproduct}</p>
              `
            );
        }

        //Add a header for Reaction area
        $(`#results-list`).append(
            `<p class="list-entry-header">Reaction(s):</p>`
        );

        for (let r = 0; r < responseJson.results[i].patient.reaction.length; r++) {
            $(`#results-list`).append(
                `<p class="list-entry-data">${responseJson.results[i].patient.reaction[r].reactionmeddrapt}</p>
              </li>`
            );
        }
    }

    $('#results').removeClass('hidden');
}

function displayRecallResults(responseJson) {
    //clear the results so we can repopulate substance_name
    $(`#recalls-panel`).empty();
    $(`#recalls-panel`).append(`<b>View Recent Device Recall Events Below...</b>`);


    for (let i = 0; i < responseJson.results.length; i++) {
        //friendly date
        let dateraw = "20200207";
        let year = dateraw.substring(0, 4);
        let month = dateraw.substring(4, 6);
        let day = dateraw.substring(6, 8);
        let friendlyDate = month + "/" + day + "/" + year;

        $(`#recalls-panel`).append(
            ` <p class="list-entry-header">Product Description:</p>
            <p class="list-entry-data"> ${responseJson.results[i].product_description}</p>
            <p class="list-entry-header">Reason For Recall:</p>
            <p class="list-entry-data"> ${responseJson.results[i].reason_for_recall}</p>
            <p class="list-entry-header">Report Date:</p>
            <p class="list-entry-data"> ${friendlyDate}</p><br/>`
        );
        $('#recalls-panel').removeClass('hidden');
    }
}

function formatFriendlyDate(dateraw) {
    console.log("formatFriendlyDate ran");
    // let year = dateraw.substring(0, 4);
    // let month = dateraw.substring(4, 6);
    // let day = dateraw.substring(6, 8);
    // return day + "/" + month + "/" + year;
}

//Clearing the dropdown menus to their default state is useful to avoid poor application states
function clearFilters() {
    $('#manufacturer-name').val("Select...");
    $('#drug-name').val("");
    $('#drug-menu').val("Select...");
    //console.log("clearFilter");
}

function getResults(manufacturerName, drugName, maxResults) {
    //clear error warning text
    $('#js-error').empty();
    //console.log(manufacturerName + " " + drugName);
    let url = searchURL;

    if (!isEmpty(manufacturerName)) {
        url = addSearchParam(url, 'patient.drug.openfda.manufacturer_name', manufacturerName);
    }

    if (!isEmpty(drugName)) {
        url = addSearchParam(url, 'patient.drug.medicinalproduct', drugName);
    }

    //add another parameter if needed
    // console.log(url);
    fetch(url)
        .then(response => {
            if (response.ok) {
                //console.log("response ok!");
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $(`#
                results - list `).empty();
            $('#js-error').text(`
                Error occurred during lookup: $ { err.message }
                `);
        });
}


function getRecalls() {
    //clear error warning text
    $('#js-error').empty();
    //console.log(manufacturerName + " " + drugName);
    let url = searchRecallURL;


    //add another parameter if needed
    // console.log(url);
    fetch(url)
        .then(response => {
            if (response.ok) {
                console.log("response ok!");
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayRecallResults(responseJson))
        .catch(err => {
            $(`#
                results - list `).empty();
            $('#js-error').text(`
                Error occurred during lookup: $ { err.message }
                `);
        });
}

function isEmpty(str) {
    if (str == "Select...") return true; //this is considered an empty field 
    return (!str || 0 === str.length);
}

function watchForm() {
    //Default state upon load will be manufacturer Search
    $("#drug-panel").hide();
    $("#recalls-panel").hide();

    $('#drug-menu').on('change', function(event) {
        let selected = $('#drug-menu').val(); //find('option:selected').value());
        $('#drug-name').val(selected);
    });

    $("#search-manufacturers-button").click(function() {
        $("#drug-panel").hide();
        $("#manufacturer-panel").show();
        $("#recalls-panel").hide();

        clearFilters();
    });

    $("#search-drugs-button").click(function() {
        $("#drug-panel").show();
        $("#manufacturer-panel").hide();
        $("#recalls-panel").hide();
        clearFilters();
    });

    $("#search-recalls-button").click(function() {
        $("#drug-panel").hide();
        $("#manufacturer-panel").hide();
        $("#recalls-panel").show();
        clearFilters();
        getRecalls();
    });

    $('form').submit(event => {

        event.preventDefault();
        const manufacturerName = $('#manufacturer-name').val();
        const drugName = $('#drug-name').val();
        const maxResults = 10;

        if (isEmpty(manufacturerName) & isEmpty(drugName)) {
            $(`#
                results - list `).empty();
            $('#js-error').text(`
                Please enter search criteria and
                try again!`);
            $('#js-error').removeClass("hidden");
        } else {
            getResults(manufacturerName, drugName, 10);
        }
    });
}

$(watchForm);