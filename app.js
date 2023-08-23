// 1. Read in the json sample data from the given url
// const url = "https://raw.githubusercontent.com/elliszimmer/Project3_Group2/javascript-branch-A/final_dataset.json"    

const url = "http://127.0.0.1:5000/api/v1.0/fetch_data"
//const filepath = "final_dataset.json"
let jsonData;
dataPromise = d3.json(url);
dataPromise.then(data => {
    console.log("JSON data: ", data);  // Logs the JSON data to the console
    // Here we are going to execute our sequence of routines
    jsonData = data;
    
    // Populate menu1 with tickers acquired from json dataset     
    let tickers = data.tickers;
    let firstAsALL = "Select All";//tickers[0];    
    tickers.splice(0,1);
    tickers.sort();
    tickers.unshift(firstAsALL);
    let dropdown1 = d3.select("#Menu_1"); // Select the dropdown element using D3
    // Append the default option
    dropdown1.append("option").text("Select a ticker symbol").attr("value", "").property("selected", true);
    // Populate the dropdown using D3's data join
    dropdown1.selectAll("option:not(:first-child)").data(tickers).enter().append("option").text(d => d).attr("value", d => d);

    // Populate menu2 with years acquired from json dataset
    let years = menu2dateList();
    // Select an option from Dropdown_menu_2 "year"
    let dropdown2 = d3.select("#Menu_2");
    dropdown2.append("option").text("Select an inspection year").attr("value", "").property("selected", true);
    dropdown2.selectAll("option:not(:first-child)").data(years).enter().append("option").text(d => d).attr("value", d => d);

    document.getElementById('applyButton').addEventListener('click', function() {
        // Retrieve values from dropdowns
        var menu1Value = document.getElementById('Menu_1').value;
        var menu2Value = document.getElementById('Menu_2').value;
    
        // Check if both values are selected
        if (menu1Value && menu2Value) {
            // Call your function with the values
            btnClicked(menu1Value, menu2Value);
        } else {
            alert('Please select values from both dropdowns before applying.');
        }
    });

}).catch(error => {
    console.error("Error fetching or parsing the data:", error);
});

// Execute the following function when the apply button is clicked
function btnClicked(ticker, year) {
    // Do something with the input parameters to test it works
    console.log("Selected values:", ticker, year);    
    // Obtain the data from the dataset
    const filteredData = retrieveStockHistory(ticker, year);

    // Test cases:
    // console.log(retrieveStockHistory(ticker, year)); //("Select All", "Select All"));
    // console.log(retrieveStockHistory("AAPL", "Select All"));
    // console.log(retrieveStockHistory("Select All", "2018"));

    // 1. Execute the line graphs
    // Rita: (main contributor) 
    // Arefin: consolidator, editor,
    plotLineChart(filteredData);    
    
    // 2. Execute the candle-light plot
    // Rita: (main contributor) 
    // Arefin: consolidator, editor,
    drawCandleStick(filteredData);

    // 3. Execute a function for bubble chart using plotly 
    // Arefin: (main contributor), consolidator, editor,
    plotBubbleChart(filteredData);

    // 4. Execute the bar plot
    drawBarChart(filteredData);

    // 5. Show the data with Jquery , that was not taught in class
    displayDataInTable(filteredData, ticker, year);
    
    // Function Barchart
    //--------------
    // Function 3
    //----------------
}

// Populate company info when an option is selected from menu 1
function option1Changed(selectedTicker) {    
    // // Do something with the selectedValue
    // console.log("Selected Value from menu 1:", selectedTicker);
    
    // // Just testing if the data is accessible
    // if (jsonData) {
    //     console.log("tickers length: ", jsonData.tickers.length);
    //     console.log("company_info length", jsonData.company_info.length);
    //     console.log("stock_history length",jsonData.stock_history.length);
    // }
    
    // First acquire the sample data from the selected ID
    if(selectedTicker == "Select a ticker symbol"){   //// <<------------ this case is not working
        let panel = d3.select("#company-metadata");        
        panel.html(""); // Clear any existing metadata
        console.log("Default setting");
    }
    else if(selectedTicker === "Select All"){
        console.log("All Company info is shown");
        displayAllLogos();
    }
    else{
        let sampleObject = {}; // Declare an empty object to hold the filtered content
        let companyMetaObject;
        let lengthCheck = 0;
        for(let i = 0; i < jsonData.company_info.length; i++){
            lengthCheck = i;
            // Filtering out the specific data        
            if((jsonData.company_info)[i].Ticker == selectedTicker){
                // Obtain a sample from the list
                // sampleObject.sample_values = (jsonData.samples)[i].sample_values;
                // sampleObject.otu_ids = (jsonData.samples)[i].otu_ids;
                // sampleObject.otu_labels = (jsonData.samples)[i].otu_labels;
                // Obtain the metadata
                companyMetaObject = (jsonData.company_info)[i];            
                // console.log("selected sample: ", sampleObject);
                break;            
            }
        }
        // We now check if the entire company_info list has been searched and nothing was found case
        if (lengthCheck === jsonData.company_info.length){
            console.log("Company info is not available");
        }
        else{
            // Update the "Company Info panel"
            let panel = d3.select("#company-metadata");
            panel.html(""); // Clear any existing metadata
            // Display company logo first
            if (companyMetaObject.LogoPath) {
                panel.append("img")
                    .attr("src", companyMetaObject.LogoPath)
                    .attr("alt", "Company Logo")
                    .attr("width", "50px") // set appropriate width
                    .attr("height", "50px"); // set appropriate height
            }
            // Loop through each data entry in the object and append to panel
            Object.entries(companyMetaObject).forEach(([key, value]) => {
                if(key !== "LogoPath"){
                    panel.append("h6").text(`${key.toUpperCase()}: ${value}`);
                }
            });
            console.log("companyMetaObject: ", companyMetaObject);
        }
    }    
    // console.log("sampleObject: ", sampleObject);    
}

// Populate Dropdown menu 2 
function menu2dateList(){
    // Extract the years and make sure they are unique using a Set
    let years = [...new Set((jsonData.stock_history)[0].dates.map(date => date.split("-")[0]))];
    years.unshift("Select All"); // add a string as another option at the begining of the list.
    console.log(years);
    return years;
}

// Populate all company info
function displayAllLogos() {
    company_list = [];
    // Obtaining the selected companies
    for(let i = 1; i < jsonData.tickers.length; i++){
        for(let j = 0; j < jsonData.company_info.length; j++){
            if((jsonData.tickers)[i] === (jsonData.company_info)[j].Ticker){
                //companyMetaObject.ticker = (jsonData.company_info[j]).Ticker;
                //companyMetaObject.company = (jsonData.company_info[j]).Company;
                //companyMetaObject.subsector = (jsonData.company_info[j]).Sub_sector;
                //companyMetaObject.headquarter = (jsonData.company_info[j]).Headquarters;
                companyMetaObject = (jsonData.company_info)[j];    
                break;
            }
        }
        company_list.push(companyMetaObject);
    }
    // List of ticker logo paths
    // const tickerLogoPaths = ['./Resources/AAPL.png',
    //                          './Resources/AMZN.png',
    //                          './Resources/ANSS.png',
    //                          './Resources/DXC.png',
    //                          './Resources/FFIV.png',
    //                          './Resources/GE.png',
    //                          './Resources/GOOGL.png',
    //                          './Resources/JNPR.png',
    //                          './Resources/KEYS.png',
    //                          './Resources/META.png',
    //                          './Resources/MSFT.png',
    //                          './Resources/MTD.png',
    //                          './Resources/NVDA.png',
    //                          './Resources/QRVO.png',
    //                          './Resources/SEDG.png',
    //                          './Resources/TSLA.png',
    //                          './Resources/ZBH.png'];

    // Update the "Company Info panel"
    let panel = d3.select("#company-metadata");
    panel.html(""); // Clear any existing metadata

    console.log("company_list: ", company_list);
    
    const scatterData = company_list.map((Ticker, idx) => {
        // Generate formatted info string for hover
        const hoverInfo = Object.entries(Ticker)
            .filter(([key]) => key !== 'LogoPath')
            .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
            .join('<br>');

        return {
            x: [idx % 3],  // Assuming 5 logos per row, change accordingly
            y: [Math.floor(idx / 3)],
            hovertext: hoverInfo,
            //hoverinfo: 'text',
            mode: 'markers',
            marker: {
                size: 50, // Adjust size as needed
                symbol: `url(${encodePath(Ticker.LogoPath)})`
            }
        };
    });

    const layout = {
        margin: {
            l: 0,  // left margin
            r: 0,  // right margin
            b: 0,  // bottom margin
            t: 0   // top margin
        },
        autosize: true,
        xaxis: { 
            type: 'linear',
            visible: false,
            dtick: 0.5,
            range: [-0.5, 3-0.5]
        },
        yaxis: { 
            visible: false,
            dtick: 1,
            range: [-0.5, 6-0.5] 
        },
        showlegend: false,
        hovermode: 'closest'
    };

    Plotly.newPlot('company-metadata', scatterData, layout);
    console.log(scatterData);

}
function encodePath(path) {
    return encodeURIComponent(path);
}

// Create a bubble chart that displays each sample.
function plotBubbleChart(filteredData) {
    
    let traces = [];

    const metrics = ['open', 'close', 'high', 'low'];
    //console.log("filteredData.dates: ",filteredData.dates);
    for (let metric of metrics) {
        for (let data of filteredData) {
            const trace = {
                name: data.ticker+ '-' + metric,
                x: data.dates,
                y: data[metric], //data.open, // default y-axis data to 'open'
                text: data.dates, // show date info when hovering over a bubble
                mode: 'markers',
                marker: {
                    size: data.volume.map(v => Math.cbrt(v) * 0.1), // We use the cube root to scale down the volume, and a multiplier to adjust size
                    sizemode: 'diameter'
                },
                yaxis: 'y1',
                visible: metric === 'open'  // Only show 'open' data series by default
            };
            traces.push(trace);
        }
    }

    let layout = {
        title: 'Stock Data Bubble Chart',
        xaxis: { title: 'Dates',
            showline: true,
            linewidth: 1,
            linecolor: 'blue',
            mirror: true
        },
        yaxis: { title: 'Value (in USD $)',
            showline: true,
            linewidth: 1,
            linecolor: 'blue',
            mirror: true
        },
        updatemenus: [{
            x: 1.1,
            y: 1.15,
            yanchor: 'top',
            buttons: [
                {
                    //args: ['y', [filteredData.map(d => d.open)]],
                    args: ['visible', [true, false, false, false, false, false, false, false]],
                    label: 'Open',
                    method: 'restyle'
                },
                {
                    //args: ['y', [filteredData.map(d => d.close)]],
                    args: ['visible', [false, true, false, false, false, false, false, false]],
                    label: 'Close',
                    method: 'restyle'
                },
                {
                    //args: ['y', [filteredData.map(d => d.high)]],
                    args: ['visible', [false, false, true, false, false, false, false, false]],
                    label: 'High',
                    method: 'restyle'
                },
                {
                    //args: ['y', [filteredData.map(d => d.low)]],
                    args: ['visible', [false, false, false, true, false, false, false, false]],
                    label: 'Low',
                    method: 'restyle'
                }
            ],
            //paper_bgcolor: '#96aaf7',  // Light gray color for the border
            plot_bgcolor: '#ffa000',   // White color for the inner chart
            // margin: {
            //             l: 55,   // Left margin (increase as needed)
            //             r: 50,   // Right margin (increase as needed)
            //             b: 50,   // Bottom margin (increase as needed)
            //             t: 70,   // Top margin (increase as needed)
            //             pad: 4
            // }
        }],
        showlegend: true
    };


    Plotly.newPlot("bubble_Arefin", traces, layout);
}

// Create the line chart function
function plotLineChart(filteredData){

    let dates = [];
    let openPrices = [];
    let closePrices = [];
    let highPrices = [];
    let lowPrices = [];
    
    for (let sdata of filteredData) {
        if (sdata.ticker) {
            dates.push(...sdata.dates);
            openPrices.push(...sdata.open);
            closePrices.push(...sdata.close);
            highPrices.push(...sdata.high);
            lowPrices.push(...sdata.low);
        }
    }

    data = {
        x: dates,
        open: openPrices,
        close: closePrices,
        high: highPrices,
        low: lowPrices
    }

    // Calculate the differences
    //let highLowDifference = data.high.map((value, index) => value - data.low[index]);
    let openCloseDifference = data.open.map((value, index) => value - data.close[index]);
    let openCloseDifferenceColors = openCloseDifference.map(diff => diff >= 0 ? 'green' : 'red');

    // Create traces for each of the values and differences
    let openTrace = {
        type: 'scatter',
        mode: 'lines',
        x: data.x,
        y: data.open,
        name: 'Open'
    };

    let closeTrace = {
        type: 'scatter',
        mode: 'lines',
        x: data.x,
        y: data.close,
        name: 'Close'
    };

    // let highTrace = {
    //     type: 'scatter',
    //     mode: 'lines',
    //     x: data.x,
    //     y: data.high,
    //     name: 'High'
    // };

    // let lowTrace = {
    //     type: 'scatter',
    //     mode: 'lines',
    //     x: data.x,
    //     y: data.low,
    //     name: 'Low'
    // };

    // let highLowBarTrace = {
    //     type: 'bar',
    //     x: data.x,
    //     y: highLowDifference,
    //     name: 'High-Low Diff',
    //     marker: {
    //         color: 'rgba(204,204,204,1)'
    //     }
    // };

    let openCloseBarTrace = {
        type: 'bar',
        x: data.x,
        y: openCloseDifference,
        name: 'Open-Close Diff',
        marker: {
            color: openCloseDifferenceColors//'rgba(222,45,38,0.8)'
        }
    };

    // Combine the traces
    let layout = {
        title: 'Stock Prices and Their Differences',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Price (USD $)'
        },
        barmode: 'relative'
    };
    tracedata = [openTrace, closeTrace, openCloseBarTrace]; //highTrace, lowTrace]; //, highLowBarTrace, openCloseBarTrace];
    Plotly.newPlot('line', tracedata, layout);
}

// Create the candle-light plot
function drawCandleStick(filteredData){

    // Unpacking the data
    let dates = [];
    let openPrices = [];
    let closePrices = [];
    let highPrices = [];
    let lowPrices = [];
    
    for (let sdata of filteredData) {
        if (sdata.ticker) {
            dates.push(...sdata.dates);
            openPrices.push(...sdata.open);
            closePrices.push(...sdata.close);
            highPrices.push(...sdata.high);
            lowPrices.push(...sdata.low);
        }
    }

    data = {
        x: dates,
        open: openPrices,
        close: closePrices,
        high: highPrices,
        low: lowPrices
    }

    let tracedata = [{
        x: data.x, // this is the date
        close: data.close,
        decreasing: {line: {color: 'red'}},
        high: data.high,
        increasing: {line: {color: 'green'}},
        line: {color: 'rgba(31,119,180,1)'},
        low: data.low,
        open: data.open,
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
    }];

    let layout = {
        dragmode: 'zoom',
        margin: {
            r: 10,
            t: 25,
            b: 40,
            l: 60
        },
        showlegend: false,
        xaxis: {
            autorange: true,
            domain: [0, 1],
            title: 'Date',
            type: 'date',
            // rangeslider: {
            //     visible: false
            // }
        },
        yaxis:{
            autorange: true,
            domain: [0, 1],
            type: 'linear',
            title: 'Price (USD $)'
        },
        title: `Stock Prices Candlestick Representation`
    }
    Plotly.newPlot('candlestick', tracedata, layout)
}

// Create the bar graph
function drawBarChart(filteredData){
    // Obtain the data traces
    let traces = [];
    
    for (let data of filteredData) {
        if (data.ticker) {
            let trace = {
                x: data.dates,
                y: data.volume,
                name: data.ticker,
                type: 'bar',
                hoverinfo: 'x+y+name', // Show date, volume, and ticker name on hover
                hovertemplate: `<b>${data.ticker}</b><br>Date: %{x}<br>Volume: %{y}<extra></extra>` // Custom hover template
            };
            traces.push(trace);
        }
    }

    let layout = {
        title: 'Volume Over Time',
        barmode: 'stack', // This will stack the bars
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Volume'
        }
    };

    Plotly.newPlot('bar', traces, layout);
}

// Obtain the selected data
function retrieveStockHistory(ticker, year) {
    let result = [];

    if (ticker === "Select All" && year === "Select All") {
        // Return all the data from stock_history
        result = jsonData.stock_history;
    } else if (ticker !== "Select All" && year === "Select All") {
        // Return all years of data for a specific ticker
        for (let stock of jsonData.stock_history) {
            if (stock.ticker === ticker) {
                result.push(stock);
                break;
            }
        }
    } else if (ticker === "Select All" && year !== "Select All") {
        // Return all tickers' data for a specific year
        for (let stock of jsonData.stock_history) {
            let dates = stock.dates;
            if (dates.some(date => date.startsWith(year))) {
                result.push(stock);
            }
        }
    } else {
        // Return specific ticker's data for a specific year
        for (let stock of jsonData.stock_history) {
            if (stock.ticker === ticker) {
                let filteredDates = stock.dates.filter(date => date.startsWith(year));
                if (filteredDates.length) {
                    let filteredStock = {...stock}; // shallow copy
                    filteredStock.dates = filteredDates;
                    let endIndex = filteredDates.length;
                    filteredStock.open = stock.open.slice(0, endIndex);
                    filteredStock.high = stock.high.slice(0, endIndex);
                    filteredStock.low = stock.low.slice(0, endIndex);
                    filteredStock.close = stock.close.slice(0, endIndex);
                    filteredStock["adj close"] = stock["adj close"].slice(0, endIndex);
                    filteredStock.volume = stock.volume.slice(0, endIndex);
                    result.push(filteredStock);
                    break;
                }
            }
        }
    }
    return result;
}

// The following is a working code... go back to it if the modification doesnt work
// function displayDataInTable(stockData, selectedTicker, selectedYears) {
//     let dataToDisplay = [];
//     let columnNames = ['Date', 'Open', 'Close', 'High', 'Low'];

//     if (selectedTicker === "Select All") {
//         $('#dataDisplay').empty(); // Clear the container

//         for (let sdata of stockData) {
//             let tableId = sdata.ticker + "_table";
//             $('#dataDisplay').append('<h2>' + sdata.ticker + '</h2><table id="' + tableId + '" class="display"></table>');

//             for (let i = 0; i < sdata.dates.length; i++) {
//                 let year = new Date(sdata.dates[i]).getFullYear();
//                 if (selectedYears.includes(year) || selectedYears === "Select All") {
//                     dataToDisplay.push([sdata.dates[i], sdata.open[i], sdata.close[i], sdata.high[i], sdata.low[i]]);
//                 }
//             }

//             $('#' + tableId).DataTable({
//                 data: dataToDisplay,
//                 columns: columnNames.map(name => ({ title: name })),
//                 destroy: true
//             });

//             dataToDisplay = []; // Reset for the next ticker
//         }
//     } else {
//         for (let sdata of stockData) {
//             if (sdata.ticker === selectedTicker) {
//                 for (let i = 0; i < sdata.dates.length; i++) {
//                     let year = new Date(sdata.dates[i]).getFullYear();
//                     if (selectedYears.includes(year) || selectedYears === "All") {
//                         dataToDisplay.push([sdata.dates[i], sdata.open[i], sdata.close[i], sdata.high[i], sdata.low[i]]);
//                     }
//                 }
//                 break;
//             }
//         }

//         $('#dataTable').DataTable({
//             data: dataToDisplay,
//             columns: columnNames.map(name => ({ title: name })),
//             destroy: true // This allows you to reinitialize the table
//         });
//     }
// }

function displayDataInTable(stockData, selectedTicker, selectedYears) {
    if (selectedTicker === "Select All") {
        // Clear existing tabs and contents
        $('#tickerTabs').empty();
        $('#tickerTabsContent').empty();

        stockData.forEach((sdata, index) => {
            let ticker = sdata.ticker;
            let isActive = index === 0 ? 'active' : '';  // Make the first tab active

            // Create tab navigation for each ticker
            $('#tickerTabs').append(`
                <li class="nav-item">
                    <a class="nav-link ${isActive}" id="tab_${ticker}" data-toggle="tab" href="#content_${ticker}" role="tab">${ticker}</a>
                </li>
            `);

            // Create content container for each tab
            $('#tickerTabsContent').append(`
                <div class="tab-pane fade show ${isActive}" id="content_${ticker}" role="tabpanel">
                    <table id="table_${ticker}" class="display"></table>
                </div>
            `);

            let dataToDisplay = [];
            for (let i = 0; i < sdata.dates.length; i++) {
                let year = new Date(sdata.dates[i]).getFullYear();
                if (selectedYears.includes(year.toString()) || selectedYears === "Select All") {
                    dataToDisplay.push([sdata.dates[i], sdata.open[i], sdata.close[i], sdata.high[i], sdata.low[i]]);
                }
            }

            // Initialize DataTable for this ticker
            $(`#table_${ticker}`).DataTable({
                data: dataToDisplay,
                columns: ['Date', 'Open', 'Close', 'High', 'Low'].map(name => ({ title: name })),
                destroy: true
            });
        });
    } else {
        // Single ticker logic remains mostly unchanged
        let sdata = stockData.find(data => data.ticker === selectedTicker);
        let dataToDisplay = [];
        for (let i = 0; i < sdata.dates.length; i++) {
            let year = new Date(sdata.dates[i]).getFullYear();
            if (selectedYears.includes(year.toString()) || selectedYears === "Select All") {
                dataToDisplay.push([sdata.dates[i], sdata.open[i], sdata.close[i], sdata.high[i], sdata.low[i]]);
            }
        }

        $('#tickerTabs').empty(); // Remove tab navigation for single ticker display
        $('#tickerTabsContent').empty().append(`<table id="single_ticker_table" class="display"></table>`); // Clear previous content and append table for single ticker

        $('#single_ticker_table').DataTable({
            data: dataToDisplay,
            columns: ['Date', 'Open', 'Close', 'High', 'Low'].map(name => ({ title: name })),
            destroy: true
        });
    }
}