//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

	//map frame dimensions
	var width = 960,
		height = 460;

	//create new svg container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height);

	//create Albers equal area conic projection centered on France
	var projection = d3.geoAlbers()
		.center([-89, 41])
		.rotate([-2, 0])
		.parallels([43, 62])
		.scale(50)
		.translate([width / 2, height / 2]);

	var path = d3.geoPath()
		.projection(projection);

	//use Promise.all to parallelize asynchronous data loading
	var promises = [];
	promises.push(d3.csv("data/AgData.csv")); //load attributes from csv
	promises.push(d3.json("data/States.topojson")); //load background spatial data
	promises.push(d3.json("data/Counties.topojson")); //load choropleth spatial data
	Promise.all(promises).then(callback);

	function callback(data){

		csvData = data[0];
		europe = data[1];
		france = data[2];

		//create graticule generator
		var graticule = d3.geoGraticule()
			.step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

		//create graticule background
		var gratBackground = map.append("path")
			.datum(graticule.outline()) //bind graticule background
			.attr("class", "gratBackground") //assign class for styling
			.attr("d", path) //project graticule

		//create graticule lines
		var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
			.data(graticule.lines()) //bind graticule lines to each element to be created
		  	.enter() //create an element for each datum
			.append("path") //append each element to the svg as a path element
			.attr("class", "gratLines") //assign class for styling
			.attr("d", path); //project graticule lines

		//translate europe TopoJSON
		var states = topojson.feature(europe, europe.objects.States),
			counties = topojson.feature(france, france.objects.Counties).features;

		//add Europe countries to map
		var countries = map.append("path")
			.datum(europeCountries)
			.attr("class", "countries")
			.attr("d", path);

		//add France regions to map
		var regions = map.selectAll(".regions")
			.data(franceRegions)
			.enter()
			.append("path")
			.attr("class", function(d){
				return d.properties.adm1_code;
			})
			.attr("d", path);
	};
};
