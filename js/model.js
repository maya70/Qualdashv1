// Define the namespace if it's not already defined
var QUALDASH = QUALDASH || {};
var $Q = QUALDASH; 


/**
 * ajax wrapper to read and write JSON data from/to file
 * @param {Object} url - the file path
 * @param {!Function} callback - the callback function once read/write finsihes
 * @param {Object} params - ajax call parameters
 */

$Q.handleJSON = function(url, callback, params) {
    var call, config, count = 0;
    config = {
        dataType: 'json',
        url: url,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            if ('timeout' === textStatus) {
                call();}
            else {
                console.error(errorThrown);
                console.error(textStatus);}},
        timeout: 120000,
        success: callback};
    if (params) {config = $.extend(config, params);}
    call = function call() {
                    ++count;
                    if (count < 5) {
                        $.ajax(config);}};
    call();};


$Q.Model_readMinapDummy = function(){
    d3.csv("./data/minap_dummy.csv", function(data){
        console.log(Object.keys(data[0])); 
        var displayVar = $Q.Control_getDisplayVariable();

        console.log(displayVar);
        
        var months = [];
        var dateVar = "3.06 Date/time arrival at hospital";
         console.log(data[0][dateVar]);

        for(var i=0; i< data.length; i++){
            // get the month of this entry
            var date = data[i][dateVar];
            var parts = date.split("-");
            var month = parts[1]; 
            var year = parts[0]; 
            console.log("Year = "+ year); 
        }

    }); 
};