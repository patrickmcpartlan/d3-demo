//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

  //create global variables for the csv values
  var attrArray = ["CornNoTill", "Erosion", "SoyNoTill", "CornSyNoTill", "PercentCCResidue"]
  var expressed = attrArray[0]; //primary attribute
  
  //specify the chart dimensions
  var chartWidth = window.innerWidth * .300, 
  chartHeight = 473,
  leftPadding = 25, 
  rightPadding = 2, 
  topBottomPadding = 5,
  chartInnerWidth = chartWidth - leftPadding - rightPadding,
  chartInnerHeight = chartHeight - topBottomPadding * 2,
  translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
  
  //scale to size bars in regards to the frame and axis
  var yScale = d3.scaleLinear()
  .range([chartHeight -10, 0])
  .domain([0, 88*1.1]);
  
  //load script when window opens 
  window.onload = setMap();
  //create a function to set the map
  function setMap(){
    //give the dimensions of the map
    var width = window.innerWidth * .35,
      height = 960;
  
    //create new svg container for the map
    var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);
      //create a unique projection for this map and focus in on the AOI
      var projection = d3.geoAlbers()
        .center([0, 39.90])
        .rotate([89.25, 0])
        .parallels([40, 45])
        .scale(8775) //Scale to a good extent around illinois 
        .translate([width / 2, height / 2])
  
  
    //create a path and ultimatley link to data tied to projection    
    var path = d3.geoPath()
      .projection(projection);
    //load using the promises capabilites (d3 version 5)
    var promises = [];
    promises.push(d3.csv("data/ILAGDATA_.csv"));
    promises.push(d3.json("data/UsaStates_.topojson"));
    promises.push(d3.json("data/IllinoisCounties_.topojson"));
    Promise.all(promises).then(callback);
    //create a function to place all the data on the map
    function callback(data){
          //give each data set a spot in the data array
      csvData = data[0];
      backstates = data[1];
      ilcounties = data[2];
  
  
      //create graticule generator
      var graticule = d3.geoGraticule()
  
  
      //create graticule background for lake michigan
      var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path) //project graticule
        .attr('opacity', '.25')
  
  
      //create variables for the topojsons
      var usaStates = topojson.feature(backstates, backstates.objects.UsaStates_),
        illinoisCounties = topojson.feature(ilcounties, ilcounties.objects.IllinoisCounties_).features;
      //create variable for backgound states
      var usaStates = map.append("path")
        .datum(usaStates)
        .attr("class", "states")
        .attr("d", path);
      //call the datajoin function
    illinoisCounties = dataJoin(illinoisCounties, csvData);
      //match the color scale function with the csvdata
    var colorScale = makeColorScale(csvData);
      //add the counties to the webpage map
    setEnumerationUnits(illinoisCounties, map, path, colorScale);
      //add the chart to the webpage
    setChart(csvData, colorScale);
      //create a dropdown menu html element
    createDropdown(csvData)
  
  
  
    };
  
  
  };//Last line of set map
  

  //Join the counties and the csv data
  function dataJoin(illinoisCounties, csvData){
  //get the joing attribute for each value within csv
    for (var i=0; i<csvData.length; i++){
      var csvCounty = csvData[i]; //current county in loop
      var csvKey = csvCounty.NAME; //primary key
      
      //get the joing attribute for each value within csv
      for (var a=0; a<illinoisCounties.length; a++){
        var geojsonProps = illinoisCounties[a].properties;
        var geojsonKey = geojsonProps.NAME;
        //if linking attribute is valid
        if (geojsonKey == csvKey) {
  
          //assign attributes
          attrArray.forEach(function(attr){
            var value = parseFloat(csvCounty[attr]);
            geojsonProps[attr] = value;
          });
        };
      };
    };
    //return values from the join for ultimatley placing on the map
  return illinoisCounties;
  };


  //make a color scale and link it to a specified classification method
  function makeColorScale(data){
    var colorClasses = ['#a6611a','#dfc27d','#bae4b3','#a6d96a','#1a9641']; //Creidt:ColorBrewer2.org
  
  //color scale generator quantile // 
  
  var colorScale = d3.scaleQuantile()
    .range(colorClasses);
  
    var domainArray = [];
    for (var i=0; i<data.length; i++){
      var value = parseFloat(data[i][expressed]);
      domainArray.push(value);
    };
  
    colorScale.domain(domainArray);
  

    return colorScale;
  }
  
  //obtain the county data (path) for the map 
  
  function setEnumerationUnits(illinoisCounties, map, path, colorScale){
      var counties = map.selectAll(".counties")
      .data(illinoisCounties)
      .enter()
      .append("path")
      .attr("class", function(d){
        return "counties " + d.properties.NAME;
      })
      .attr("d", path)
      .style("fill", function(d){
        return colorScale(d.properties[expressed]); //style the enumeration units
      })
      .on("mouseover", function(d){
        console.log(d.properties)
        highlight(d.properties);
      })
      .on("mouseout", function(d){
        dehighlight(d.properties)
      })
      .on("mousemove", moveLabel);
  
      var desc = counties.append("desc")
      .text('{"stroke": "#000", "stroke-width": "0.5px"}');
  
  };
  //test for the datavalues
  function choropleth(props, colorScale){
    //verify value is a number
    var value = parseFloat(props[expressed]);
    //Assign gray if not a number
    if (typeof value == 'number' && !isNaN(value)){
      return colorScale(value);
    } else {
      return "#D3D3D3";
    };
  };
  
  ///Create a standalone bar chart
  function setChart(csvData, colorScale){
  
  //second svg onto the webpage for the chart
    var chart =  d3.select("body")
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("class", "chart");
    
  //scale to size bars in regards to the frame and axis

    //create the chartbackground fill
    var chartBackground = chart.append("rect")
      .attr("class", "chartBackground")
      .attr("width", chartInnerWidth)
      .attr("height", chartInnerHeight)
      .attr("transform", translate);
  //Asign a bar to each county
    var bars = chart.selectAll(".bar")
      .data(csvData)
      .enter()
      .append("rect")
      .sort(function(a,b){
        return b[expressed]-a[expressed]
      })
      .attr("class", function(d){
        return "bar " + d.NAME; //Assign the class to match the text 
      })
      .attr("width", chartInnerWidth / csvData.length - 1)
      .on("mouseover", highlight) //Implement user feedback on the bars to go with map
      .on("mouseout", dehighlight)
      .on("mousemove", moveLabel);
  //Create a desc of what to get the bars back to once no longer highlighted
      var desc = bars.append("desc")
      .text('{"stroke": "none", "stroke-width": "0.5px"}');
  
  //place an default chart title for the graph
      var chartTitle = chart.append("text")
          .attr("x", 30)
          .attr("y", 40)
          .attr("class", "chartTitle")
          .text("Percent of  " + expressed + " per county");
  
      //create a frame to surround the chart 
      var chartFrame = chart.append("g")
      .attr("class", "chartFrame")
      .attr("width", chartInnerWidth * topBottomPadding)
      .attr("height", chartInnerHeight + topBottomPadding)
      .attr("transform", translate);
  
      //Implement update Chart function
      updateChart(bars, csvData.length, colorScale);
    }; //End of Set Chart
  
  //create dropdown menu for attribute selection
  function createDropdown(csvData){
    //Container for the menu
    var dropdown = d3.select("body")
      .append("select")
      .attr("class", "dropdown")
      .on("change", function(){
        changeAttribute(this.value, csvData)
      });
  //Set a default text for the drop down box 
    var initialOption = dropdown.append("option")
      .attr("class", "initialOption")
      .attr("disabled", "true")
      .text("Select Attribute");
  //create one option element for each attribute
    var attrOptions = dropdown.selectAll("attrOptions")
      .data(attrArray)
      .enter()
      .append("option")
      .attr("value", function(d){ return d})
      .text(function(d){return d});
  }; //End Create Dropdown
  
  //
  function changeAttribute(attribute, csvData){
    //set the csv expressions equal to an attribute variable
    expressed = attribute;
  
    //Introuce the MakeColorScale and link to data
    var colorScale = makeColorScale(csvData);
  
    //apply the proper stly upon changing the attribute and include transitions
    var counties = d3.selectAll(".counties")
        .transition()
        .delay(function(d,i){
          return i / csvData.length * 1000
        })
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });
  
  
  
      /////change color of bars
      //Apply transitional updates and motions
      var bars = d3.selectAll(".bar")
      .sort(function(a,b){
        return b[expressed] - a[expressed];
      })
      .transition()
      .delay(function(d,i){
        return i / csvData.length * 1000
      })
      .duration(2000)
      .ease(d3.easeBounceOut)
      .style("fill", function(d){
        return choropleth(d, colorScale);
      });
      updateChart(bars, csvData.length, colorScale);
  
        
      
  };
  
  //adjust bars on the chart based off changed attribute
  function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d,i){
      return i * (chartInnerWidth / n) + leftPadding;
    })
        //change the size of the bars upon update
        .attr("height", function(d,i){
          return 473 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d,i){
          return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //Color the bars to fit the colorscale upon change
        .style("fill", function(d){
          return choropleth(d,colorScale);
        });
    //Update the title based on the new attribute depicted
    var chartTitle = d3.select(".chartTitle")
        .text("Percent of " + expressed + " per county")
  };
  //create the highlight function
  function highlight(props){
    //change outline when appropriate
    console.log(props)
    var selected = d3.selectAll("." + props.NAME) //select the joined element
    .style("stroke", "white").style("stroke-width", "5")
    .attr('opacity', '.6')
  //link the label with the highlight reaction
    setLabel(props)
  };
  //create a function to follow the highlight to return to normal
  function dehighlight(props){
    var selected = d3.selectAll("." + props.NAME)
    //give the charecteristics of how it looked initially
      .style("stroke", function(){
        return getStyle(this,"stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      })
      .attr('opacity', '1');
  //remove the label upon the mouseoff
      d3.select(".infolabel")
        .remove();
  //retrieve info stored in the desc element
      function getStyle(element,styleName){
        var styleText = d3.select(element)
          .select("desc")
          .text();
        var styleObject = JSON.parse(styleText);
  
        return styleObject[styleName];
      };
  }
  //create a dynamic label to display feature properties
  function setLabel(props){
    var labelAttribute = "<h1>" + props[expressed] +
      "</h1><b>" + expressed + "</b>";
    //create the page div
    var infolabel = d3.select("body")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", props.NAME + "_label")
      .html(labelAttribute)
  
    var countyName = infolabel.append("div")
      .attr("class", "labelname")
      .html(props.NAME)
  };
  
  //use current position of the mouse to place the label
  function moveLabel(){
    //determine width of label
    var labelWidth = d3.select(".infolabel")
      .node()
      .getBoundingClientRect()
      .width;
  
    //offset the label cordinates upon the mousemove
    var x1 = d3.event.clientX + 10, 
      y1 = d3.event.clientY - 75,
      x2 = d3.event.clientX - labelWidth - 10,
      y2 = d3.event.clientY + 25; 
  
    //test for overflow with comparrisons
    //horizontal
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical
    var y = d3.event.clientY < 75 ? y2 : y1; 
  
    //adjust label in relation to the comparrison operators
    d3.select(".infolabel")
      .style("left", x + "px")
      .style("top", y + "px");
  }
  
  })(); //last line of main.js
  