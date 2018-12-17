var app = angular.module('my-app', []);
app.controller('mainCtrl', ['$scope',
 function($scope) {

    /* Histogram */ 
    $scope.data = [
        {"id":"A1","number":10},
        {"id":"B2","number":25},
        {"id":"C3","number":25},
        {"id":"D4","number":18},
        {"id":"E5","number":13}]; 
     


    $scope.dim = [
        {"width":400,"height":360}];


    $scope.options = [300,350,400,450,500];
    $scope.selectedWidth = $scope.options[2];
    $scope.submit = function(data) {
        $scope.dim = [
            {"width":data,"height":360}
            ];
   };

   

}]);

app.directive('d3chart', ['$parse', '$window', function($parse, $window){
    return{
        restrict: "E", 
        replace: false,
        template: "<svg class='histogram-chart'></div>",
        link: function(scope, elem, attrs) {
            
            var exp = $parse(attrs.dim);
            var d3 = $window.d3;          
            var dim = scope[attrs.dim][0];
            var  width = dim['width'],
                height = dim['height'],
                barColor = "steelblue", 
                axisColor = "whitesmoke", 
                axisLabelColor = "grey",
                yText = "Number", 
                xText = "IDs";
    
            // Inputs to the d3 graph 
            var data = scope[attrs.data];
            
            // A formatter for counts.
            var formatCount = d3.format(",.0f");
            
           
            // Set the scale, separate the first bar by a bar width from y-axis
            var x = d3.scale.ordinal()
                            .rangeRoundBands([0, width], .1, 1);
                
            var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");
    
            var y = d3.scale.linear()
                .range([height, 0]);
    
    
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(formatCount);
    
            // Initialize histogram 
            var svg = d3.select(".histogram-chart")
                .attr("width", width + 100)
                .attr("height", height + 40)
              .append("g")
                .attr("transform", "translate(" + 50 + "," + 20 + ")");
            
            
            var tip = d3.tip().attr('class','d3-tip').html(function(d){
                return d['id'] + " , " + d['number'];
            });
            
            svg.call(tip);
           
            function drawAxis(width,x){
    
                data.forEach(function(d) {
                    d.number = +d.number;
                });
    
                x.domain(data.map(function(d) { return d.id; }));
                y.domain([0, d3.max(data, function(d) { return d.number; })]);
                   
                // Draw x-axis 
                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .append("text")
                    .attr("y", 6)
                    .attr("dy", "-0.71em")
                    .attr("x", width )
                    .style("text-anchor", "end")
                    .style("fill", axisLabelColor)
                    .text(xText);
    
                // Draw y-axis 
                svg.append("g")
                    .attr("class", "y-axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .style("fill", axisLabelColor)
                    .text(yText);
    
                // Change axis color 
                d3.selectAll("path").attr("fill", axisColor);
            }
            
            function updateWidth(){
                
                var newWidth = dim[0]['width'];
                svg.selectAll("g.x-axis").call(xAxis).remove("text");
                x = d3.scale.ordinal()
                            .rangeRoundBands([0, newWidth], .1, 1);  
                xAxis = d3.svg.axis()
                              .scale(x)
                              .orient("bottom"); 
                    
                drawAxis(newWidth,x);
    
            }
            
            function updateHistogram(){
                
                // Redefine scale and update width 
                if (!d3.select('g.y-axis').node()){
                    drawAxis(width,x);
                } else {        
                     updateWidth();
                }
                
                var bar = svg.selectAll(".barInfo").data(data);
                var bEnter = bar.enter().append("g")
                    .attr("class", "barInfo");
                
                bEnter.append("rect")
                    .attr("class", "bar");
                
                bar.select("rect")
                    .attr("x", function(d){ return x(d.id) })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d){ return y(d.number) })
                    .attr("height", function(d) { return height - y(d.number); })
                    .attr("fill", barColor)
                    .on('mouseover',function(d){
                        tip.show(d);
                        d3.select(this).attr("r", 10).style("fill", "green");
                        document.getElementById("footer").innerHTML = "Id: " + d['id'] + " , " + "Number: "+d['number'];                        
                    })
                    .on('mouseout',function(){
                        tip.hide();
                        d3.select(this).attr("r", 10).style("fill", barColor);
                        document.getElementById("footer").innerHTML = "";
                    });
                
                bar.select("text")
                    .attr("y", function(d){ return y(d.number) })
                    .attr("x", function(d){ return x(d.id) })
                    .attr("dy", "-1px")
                    .attr("dx", x.rangeBand()/2 )
                    .attr("text-anchor", "middle")
                    .attr("class", "numberLabel")
                    .text(function(d) { return formatCount(d.number); });               
                    
            }
             //for changes in dimensions
             scope.$watch(exp, function(newValue, oldValue, scope) {
                dim = newValue;
                updateHistogram();
             });
    
    
            }
    };
    }]);