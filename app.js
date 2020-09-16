'use strict';

//this is the base URL for the API - add parameters to this without editing this original const
const searchURL = 'https://api.fda.gov/drug/event.json';

//const apiKey = 'NqRn0Nrc09n3vgWsb3jxKI3rRFEtIn6EZKP81ZRG';
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
              </li>`
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
                console.log("response ok!");
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $(`#results-list`).empty();
            $('#js-error').text(`Error occurred during lookup: ${err.message}`);
        });
}

function isEmpty(str) {
    if (str == "Select...") return true; //this is considered an empty field 
    return (!str || 0 === str.length);
}

function watchForm() {
    //Default state upon load will be manufacturer Search
    $("#drug-panel").hide();

    $('#drug-menu').on('change', function(event) {
        let selected = $('#drug-menu').val(); //find('option:selected').value());
        $('#drug-name').val(selected);
    });

    $("#search-manufacturers-button").click(function() {
        $("#drug-panel").hide();
        $("#manufacturer-panel").show();
        clearFilters();
    });

    $("#search-drugs-button").click(function() {
        $("#drug-panel").show();
        $("#manufacturer-panel").hide();
        clearFilters();
    });

    $('form').submit(event => {

        event.preventDefault();
        const manufacturerName = $('#manufacturer-name').val();
        const drugName = $('#drug-name').val();
        const maxResults = 10;

        if (isEmpty(manufacturerName) & isEmpty(drugName)) {
            $(`#results-list`).empty();
            $('#js-error').text(`Please enter search criteria and try again!`);
            $('#js-error').removeClass("hidden");
        } else {
            getResults(manufacturerName, drugName, 10);
        }
    });
}

$(watchForm);