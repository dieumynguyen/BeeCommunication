function initBeeLayer(backend_results) {
    var init_bee_positions = backend_results["bees_position_history"];

    var init_bee_data = [];
    var x_values = [];
    var y_values = [];
    for (var bee_key in init_bee_positions) {
        bee_i = init_bee_positions[bee_key];
        init_bee_data.push({
            "bee_id"    : bee_key,
            "x"         : bee_i.x,
            "y"         : bee_i.y,
        });
        x_values.push(bee_i.x);
        y_values.push(bee_i.y);

        BEE_DISTANCES[bee_key] = Math.sqrt((bee_i.x)**2 + (bee_i.y)**2)
    }

    // Init bee distance vis
    initBeeDistanceVis();


    // Init tooltip
    d3.select('body').append("div").attr("id", "bee_name_tooltip_div");
    d3.select('body').append("div").attr("id", "distance_tooltip_div");


    // Create SVG overlay
    var bee_svg = d3.select("#concentration_div").append("svg")
        .attr("id", "bee_svg")
        .attr("height", heatmap_size)
        .attr("width", heatmap_size);

    beeXScale = d3.scaleLinear()
        .domain([-3.0, 3.0])
        .range([0, heatmap_size]);

    beeYScale = d3.scaleLinear()
        .domain([-3.0, 3.0])
        .range([0, heatmap_size]);

    bee_ids = [];
    for (var j=0; j < init_bee_data.length; j++) {
        bee_ids.push(init_bee_data[j].bee_id);
    }

    bee_svg.selectAll('image.bees')
        .data(init_bee_data).enter()
        .append('image')
        .attr("class", "bees")
        .attr("id", function(d) {
            return d.bee_id;
        })
        .attr('xlink:href', function(d) {
            return (d.bee_id.split("_")[0] === "worker") ? worker_img_path_1 : queen_img_path_1;
        })
        .attr("x", function(d) {
            var icon_size = (d.bee_id.split("_")[0] === "worker") ? worker_bee_icon_size : queen_bee_icon_size;
            return beeXScale(d.x) - icon_size/2.0;
        })
        .attr("y", function(d) {
            var icon_size = (d.bee_id.split("_")[0] === "worker") ? worker_bee_icon_size : queen_bee_icon_size;
            return beeYScale(d.y) - icon_size/2.0;
        })
        .attr("width", function(d) {
            var icon_size = (d.bee_id.split("_")[0] === "worker") ? worker_bee_icon_size : queen_bee_icon_size;
            return icon_size;
        })
        .attr("height", function(d) {
            var icon_size = (d.bee_id.split("_")[0] === "worker") ? worker_bee_icon_size : queen_bee_icon_size;
            return icon_size;
        })
        .on("mouseover", function(d) {
            var distance_to_queen = BEE_DISTANCES[d.bee_id];

            var bee_name_tooltip_div = d3.select("#bee_name_tooltip_div");

            bee_name_tooltip_div.transition()
                .duration(200)
                .style("opacity", .9);

            bee_name_tooltip_div.html(function() {
                    return d.bee_id.replace("_", " ");
                })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");


            var distance_tooltip_div = d3.select("#distance_tooltip_div");
            distance_tooltip_div.transition()
                .duration(200)
                .style("opacity", .9);

            distance_tooltip_div.html(function() {
                    return distance_to_queen.toFixed(4);
                })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");

            d3.select("#"+d.bee_id+"_line").transition().style("opacity", 1.0);
            d3.select("#"+d.bee_id+"_bar").transition().style("fill", BEE_BAR_SELECT_COLOR);

            d3.select(this).moveToFront();
        })
        .on("mouseout", function(d) {
            d3.select("#bee_name_tooltip_div").transition()
                .duration(500)
                .style("opacity", 0);

            d3.select("#distance_tooltip_div").transition()
                .duration(500)
                .style("opacity", 0);

            for (var j=0; j < bee_ids.length; j++) {
                d3.select("#"+bee_ids[j]+"_line").transition().style("opacity", 0.0);
            }

            d3.select("#"+d.bee_id+"_bar").transition().style("fill", DEFAULT_BAR_COLOR);
        });


    var lines_g = bee_svg.selectAll("g.bee_to_queen")
        .data(init_bee_data).enter()
        .append("g")
        .attr("class", "bee_to_queen_g");

    lines_g.append("line")
        .attr("class", "bee_line")
        .attr("id", function(d) {
            return d.bee_id + "_line";
        })
        .attr("x1", function(d) {
            return beeXScale(0);
        })
        .attr("x2", function(d) {
            return beeXScale(d.x);
        })
        .attr("y1", function(d) {
            return beeYScale(0);
        })
        .attr("y2", function(d) {
            return beeYScale(d.y);
        })
        .style("fill", "black")
        .style("stroke", "black")
        .style("opacity", 0.0);
}

function updateBeeLayer(backend_results) {
    var updated_bee_positions = backend_results["bees_position_history"];

    var updated_bee_data = [];
    for (var bee_key in updated_bee_positions) {
        bee_i = updated_bee_positions[bee_key];
        updated_bee_data.push({
            "bee_id"    : bee_key,
            "x"         : bee_i.x,
            "y"         : bee_i.y,
        });

        BEE_DISTANCES[bee_key] = Math.sqrt((bee_i.x)**2 + (bee_i.y)**2)
    }

    // update bee distance vis
    updateBeeDistanceVis();

    d3.selectAll(".bees")
        .data(updated_bee_data)  // Update with new data
        .transition()  // Transition from old to new
        .attr("x", function(d) {
            var icon_size = (d.bee_id.split("_")[0] === "worker") ? worker_bee_icon_size : queen_bee_icon_size;
            return beeXScale(d.x) - icon_size/2.0;
        })
        .attr("y", function(d) {
            var icon_size = (d.bee_id.split("_")[0] === "worker") ? worker_bee_icon_size : queen_bee_icon_size;
            return beeYScale(d.y) - icon_size/2.0;
        });

    d3.selectAll(".bee_to_queen_g").select("line")
        .data(updated_bee_data) .transition()
        .attr("x2", function(d) {
            return beeXScale(d.x);
        })
        .attr("y2", function(d) {
            return beeYScale(d.y);
        });
}

function initBeeDistanceVis() {

    d3.select("#bee_distance_svg").remove();

    var margin = {top: 50, right: 100, bottom: 50, left: 100};
    var width = bee_bar_graph_width - margin.left - margin.right;
    var height = bee_bar_graph_height - margin.top - margin.bottom;

    // prep data
    var bee_data = [];
    for (var bee_key in BEE_DISTANCES) {
        if (bee_key === "queen") {
            continue;
        }
        bee_data.push({
            "distance"  : BEE_DISTANCES[bee_key],
            "bee_key"   : bee_key
        });
    }

    beeBarXScale = d3.scaleBand()
        .domain(bee_data.map(function(d) { return d.bee_key; }))
        .range([0, width])
        .padding(0.1);

    beeBarYScale = d3.scaleLinear()
        .domain([0, 3])
        .range([height, 0]);

    var bee_distance_svg = d3.select("#bee_distance_div").append("svg")
        .attr("id", "bee_distance_svg")
        .attr("height", bee_bar_graph_height)
        .attr("width", bee_bar_graph_width);

    var bee_distance_g = bee_distance_svg.append("g")
        .attr("id", "bee_distance_g")
        .attr("transform", "translate(70, -20)");

    // Add barchart bars
    bee_distance_g.selectAll("rect.bee_bar")
        .data(bee_data).enter()
        .append("rect")
        .attr("class", "bee_bar")
        .attr('id', function(d) {
            return d.bee_key + "_bar";
        })
        .attr("x", function(d) {
            return beeBarXScale(d.bee_key);
        })
        .attr("width", beeBarXScale.bandwidth())
        .attr("y", function(d) {
            return beeBarYScale(d.distance);
        })
        .attr("height", function(d) {
            return height - beeBarYScale(d.distance);
        })
        .style("fill", DEFAULT_BAR_COLOR);

    // add the x Axis
    bee_distance_g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(beeBarXScale))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-45)"
            });

    // add the y Axis
    bee_distance_g.append("g")
        .call(d3.axisLeft(beeBarYScale));

    // y axis text
    bee_distance_g.append("text")
        .attr("transform", "rotate(-90)")
        .attr('x', 0 - margin.left*1.1)
        .attr('y', 0 - 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Distance from Queen");

    d3.select("#bee_distance_div").transition(1000).style("opacity", 1.0);
}

function updateBeeDistanceVis() {
    // prep data
    var bee_data = [];
    for (var bee_key in BEE_DISTANCES) {
        if (bee_key === "queen") {
            continue;
        }
        bee_data.push({
            "distance"  : BEE_DISTANCES[bee_key],
            "bee_key"   : bee_key
        });
    }

    d3.selectAll("rect.bee_bar").data(bee_data)
        .transition()
        .attr("y", function(d) {
            return beeBarYScale(d.distance);
        })
        .attr("height", function(d) {
            return height - beeBarYScale(d.distance);
        });
}
