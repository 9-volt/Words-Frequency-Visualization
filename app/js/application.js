$(function () {
  var $cuvinte = $('#cuvinte')
    , app_width = $cuvinte.width()
    , app_height = $cuvinte.height()
    , appSVG = d3.select("#cuvinte")
      .append("svg")
      .attr("width", app_width)
      .attr("height", app_height)
    , color_red = "#ef4b48"
    , color_green = "#3bbdb5"
    , stroke_width = 10

  appSVG
    .append("defs")
      .append("pattern")
        .attr("id", "pattern-diagonal")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("preserveAspectRatio", "slice")
        .attr("width", 2)
        .attr("height", 2)
        .append("image")
          .attr("width", 2)
          .attr("height", 2)
          .attr("opacity", 0.8)
          .attr("xlink:href", "images/texture.png")

  /*
   * Data section start
   */
  var data = [];
  var names = ["V. PLAHOTNIUC", "V. FILAT", "V. VORONIN", "M. LUPU"]

  // Add some random data
  for (var i = 0; i < 15; i++) {
    data.push({
      name: names[~~(Math.random() * names.length)]
    , value: ~~(1.0 * Math.random() * ~~(app_height / 3.5) * ~~(app_height / 3.5))
    , image: "images/image.png"
    })
  }

  var date_start_month = 1
    , date_start_year = 2008
    , date_end_month = 5
    , date_end_year = 2013

  /*
   * Data section end
   */

  function addSortedAttributeBy(data, attribute, sort_by) {
    // create sorted array
    _data_sorted = data.slice(0)
    _data_sorted.sort(function (a, b) {
      return (b.value - a.value);
    })

    _data_keys = []
    for(var i in _data_sorted) {
      _data_keys[_data_sorted[i].value] = i
    }

    data.map(function (a) {
      a.index_sorted = +_data_keys[a.value]
      return a;
    })

    return data;
  }

  data = addSortedAttributeBy(data)

  // sort by size (descending)
  data.sort(function (a, b) {
    return (b.value - a.value);
  })

  var section_horizontal = ~~(app_width / 5.5) // 5 elements per row = 6 spaces
    , section_vertical = ~~(app_height / 3.43) // 3 rows of circles, 1 row for time
    , data_max = Math.sqrt(data[0].value)
    , data_min = Math.sqrt(data[data.length - 1].value)
    , size_max = ~~(section_horizontal / 1.8) // maximal size of circle
    , size_min = ~~(section_horizontal / 4) // minimal size of circle
    , scale_data_to_size = (data_max - data_min) / (size_max - size_min) // scale real data to our screen

  var appCircleGroups = appSVG
      .selectAll("g")
        .data(data)
      .enter().append("g")
        .attr("transform", function (d, i) {
          var x = section_horizontal * ((d.index_sorted % 5) + 0.25)
            , y = section_vertical * (~~(d.index_sorted / 5) - 0.23);
          return "translate(" + x + ", " + y + ")"
        })

  var appCircleValues = appCircleGroups
    .append("text")
      .text(function (d) {
        return d.value
      })
      .attr("dx", function (d, i) {
        return ~~(section_horizontal / 2)
      })
      .attr("dy", function (d, i) {
        return ~~(section_vertical / 1.55)
      })
      .attr("text-anchor", "middle")
      .attr("font-size", '25px')
      .attr("fill", color_red)
      .attr("opacity", 0)

  // Circle
  var appCircles = appCircleGroups
      .append("circle")
        .attr("cx", function (d, i) {
          return section_horizontal * 0.5;
        })
        .attr("cy", function (d, i) {
          return section_vertical * 0.6;
        })
        .attr("r", function (d, i) {
          return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2
        })
        .style("stroke", color_red)
        .style("fill", "none")
        .attr("stroke-width", 0)
        .attr("id", function (d, i) {
          return "circle-" + i;
        })

  // Add images
  var appCircleImages = appCircleGroups
      .append("image")
        .attr("x", function (d, i) {
          return section_horizontal * 0.5;
        })
        .attr("y", function (d, i) {
          return section_vertical * 0.6;
        })
        .attr("width", function (d, i) {
          return 1
        })
        .attr("height", function (d, i) {
          return 1
        })
        .attr("opacity", 1)
        .attr("xlink:href", function (d, i) {
          return d.image;
        })

  appCircleImages
    .transition()
      .delay(500)
      .duration(500)
      .attr("x", function (d, i) {
        return section_horizontal * 0.5 - ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2;
      })
      .attr("y", function (d, i) {
        return section_vertical * 0.6 - ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2;
      })
      .attr("width", function (d, i) {
        return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min)
      })
      .attr("height", function (d, i) {
        return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min)
      })

  var appCirclesMask = appCircleGroups
      .append("circle")
        .attr("fill", "url(#pattern-diagonal)")
        .attr("cx", function (d, i) {
          return section_horizontal * 0.5;
        })
        .attr("cy", function (d, i) {
          return section_vertical * 0.6;
        })
        .attr("r", function (d, i) {
          return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2 + 1
        })
        .attr("opacity", 1)
    // Events
        .on("mouseover", function (d, i) {
          d3.select(this)
            .transition()
            .duration(500)
              .attr("opacity", 0)

          // Show only necessary number
          appCircleImages.each(function (d, _i) {
            if (i == _i) {
              d3.select(this)
                .transition()
                .duration(500)
                .attr("opacity", 0)
            }
          })

          // Show only necessary number
          appCircles.each(function (d, _i) {
            if (i == _i) {
              d3.select(this)
                .transition()
                .duration(700)
                .attr("stroke-width", stroke_width)
                .attr("r", ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2 - stroke_width / 2)
            }
          })

          // Show only necessary number
          appCircleValues.each(function (d, _i) {
            if (i == _i) {
              d3.select(this)
                .attr("opacity", 1)
            }
          })

        })
        .on("mouseout", function (d, i) {
          d3.select(this)
            .transition()
            .duration(500)
              .attr("opacity", 1)

          // Show back images
          appCircleImages
            .transition()
            .duration(1000)
            .attr("opacity", 1)

          // Hide circle stroke
          appCircles.each(function (d, _i) {
            if (i == _i) {
              d3.select(this)
                .transition()
                .duration(300)
                .attr("stroke-width", 0)
                .attr("r", ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2)
            }
          })

          // Hide all numbers
          appCircleValues
            .attr("opacity", 0)
        })

  var appCircleTitles = appCircleGroups
    .append("text")
      .text(function (d) {
        return d.name
      })
      .attr("dx", function (d, i) {
        return ~~(section_horizontal / 2)
      })
      .attr("dy", function (d, i) {
        return ~~(section_vertical * 1.1)
      })
      .attr("text-anchor", "middle")
      .attr("font-size", '23px')
      .attr("fill", "black")


  var date_section_space = 0.2 // space between years is of the same width as width of 2 months
    , date_section_margin = 3 // space between years and svg border
    , date_years = date_end_year - date_start_year + 1
    , date_months = (13 - date_start_month) + date_end_month + Math.max(0, (date_end_year - date_start_year - 1) * 12)
    , date_sections = date_months + (date_section_margin * 2) + (date_section_space * (date_years - 1))
    , date_section_width = (app_width / date_sections) // size of one section
    , years = []
    , months = []

    console.log(date_months, date_sections)

  var month_start
    , month_end
    , month_last = 0

  for (var year = date_start_year; year <= date_end_year; year++) {
    month_start = year === date_start_year ? date_start_month : 1
    month_end = year === date_end_year ? date_end_month : 12

    years.push({
      "months": month_end - month_start + 1
    , "year": year
    , "month_start": month_start
    , "month_end": month_end
    , "date_month_start": month_last
    })

    month_last += years[years.length - 1].months

    for (var month = month_start;month <= month_end; month++) {
      months.push({
        "month": month
      , "year": year
      })
    }
  }

  console.log(date_months)

  var appYears = appSVG
      .selectAll("rect")
        .data(years)
      .enter().append("rect")
        .attr("x", function (d, i) {
          return ~~((date_section_margin + d.date_month_start + i * date_section_space) * date_section_width) + 0.5
        })
        .attr("y", function (d, i) {
          return ~~(app_height - section_vertical / 2) + 0.5
        })
        .attr("height", function (d, i) {
          return section_vertical / 6
        })
        .attr("width", function (d, i) {
          return ~~(d.months * date_section_width)
        })
        .style("stroke", "gray")
        .style("fill", "white")
        .on("click", function(d, i) {
          // == Reorder circles ==
          // reset data
          for (var i = 0; i < 15; i++) {
            data[i].value = ~~(1.0 * Math.random() * ~~(app_height / 3.5) * ~~(app_height / 3.5))
          }

          // add sorted indexes
          data = addSortedAttributeBy(data);

          // push data
          appCircleGroups
            .data(data)
          // resize circles
            .select("image")
            .transition()
              .duration(500)
              .attr("x", function (d, i) {
                return section_horizontal * 0.5 - ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2;
              })
              .attr("y", function (d, i) {
                return section_vertical * 0.6 - ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2;
              })
              .attr("width", function (d, i) {
                return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min)
              })
              .attr("height", function (d, i) {
                return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min)
              })

          appCircles
            .attr("r", function (d, i) {
              return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2
            })

          appCirclesMask
            .transition()
              .duration(500)
            .attr("cx", function (d, i) {
              return section_horizontal * 0.5;
            })
            .attr("cy", function (d, i) {
              return section_vertical * 0.6;
            })
            .attr("r", function (d, i) {
              return ((Math.sqrt(d.value) - data_min) / scale_data_to_size + size_min) / 2 + 1
            })

          // move groups
          appCircleGroups
            .transition()
              .delay(1000)
              .duration(1000)
              .attr("transform", function (d, i) {
                var x = section_horizontal * ((d.index_sorted % 5) + 0.25)
                  , y = section_vertical * (~~(d.index_sorted / 5) - 0.23);
                return "translate(" + x + ", " + y + ")"
              })

          appCircleValues
            .text(function (d) {
              return d.value
            })

        })

});
