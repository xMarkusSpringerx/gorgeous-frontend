const ELIPSE_WIDTH_FACTOR = 5,
    RECT_WIDTH_FACTOR = 3,
    EXPANDED_TOP_PADDING = -10,
    TYPE_COLORS = [
      ['Integer', 'blue'],
      ['Boolean', 'darkGreen'],
      ['Float', 'darkBlue'],
      ['String', 'brown'],
      ['Json', 'green'],
      ['Datetime', 'darkOrange']
    ];



function generate_model_diagram_svg(model_diagram_json) {

  var nodes = {};

  var width = 780,
      height = 400;

  var linkDistance = 300,
      padding = 1000,
      charge = -8000,
      gravity = .3,
      friction = .6,
      linkStrength = 1,
      chargeDistance = 1000;


  var savedGraph = localStorage.getItem('savedGraph');

  if(savedGraph) {
    console.log("Graph schon vorhanden");
    console.log(savedGraph);
  } else {
    console.log("Neu initialisieren");

    var zoom =
        d3.behavior.zoom()
            .scaleExtent([0, 1])
            .on("zoom", zoomed);

    // Compute the distinct nodes from the links.
    var links = model_diagram_json["models"].links;

    model_diagram_json["models"].nodes.forEach(function (node) {
      var nodeShape = "";
      var shapeType = "";
      var nodeNameLength = node.name.length;

      if (node.shape == "Mrecord") {
        nodeShape = drawNodeElipse(nodeNameLength);
        shapeType = "Mrecord";
      } else if (node.shape == "record") {
        nodeShape = drawNodeRect(nodeNameLength);
        shapeType = "record";
      } else {
        nodeShape = drawNodeRect(nodeNameLength);
        shapeType = "other";
      }

      // SET DEFAULT VALUE
      var expanded;
      if (node.expanded) {
        expanded = node.expanded;
      } else {
        expanded = false;
      }

      nodes[node.name] = {
        name: node.name.replace(/::/g, '_'),
        description: node.description,
        attributes: node.attributes,
        expanded: expanded,
        fillcolor: node.fillcolor,
        fontcolor: node.fontcolor,
        shape: nodeShape,
        shapetype: shapeType
      };

      if (node.attributes == node.fillcolor == node.fontcolor == null) {
        nodes[node.name].fillcolor = "#FFF";
        nodes[node.name].fontcolor = "#000";
      } else if (node.fillcolor == null) {
        nodes[node.name].fillcolor = "#DDD";
        nodes[node.name].fontcolor = "#000";
      }
    });

    links.forEach(function (link) {
      link.source = nodes[link.source] ||
          (nodes[link.source] = {
            name: link.source,
            fillcolor: "#FFF",
            fontcolor: "#000",
            attributes: null,
            shape: drawNodeRect(link.source.length)
          });
      link.target = nodes[link.target] ||
          (nodes[link.target] = {
            name: link.target,
            fillcolor: "#FFF",
            fontcolor: "#000",
            attributes: null,
            shape: drawNodeRect(link.target.length)
          });
    });

  }

  function linkDoubleClicked(link) {
    linkPath = d3.select(this)[0][0];
    linkText = $("#text" + linkPath.id);
    if (linkText.is(":visible")) {
      linkText.css("display", "none");
    } else {
      linkText.css("display", "inline");
    }
  }

  function clickGitSource(node) {
    var github_path = "http://github.com/freeletics/core-user-rails";
    var names = node.name.split(/_/g);
    console.log(names);
    names.forEach((name) => {
          github_path += "/" + name.toLowerCase();
        }
    )

    //window.open('http://www.sapo.pt');
  }

  function drawEntireNodeExpanded(nodePathShape, maxLengthAttribute, node) {

    var expWidth = expandedWidth(maxLengthAttribute),

        numberOfAttributes = node.attributes.length;
    // inside node
    d3.select(nodePathShape)

        .attr('d', function (d) {
          switch (d.shapetype) {
            case 'Mrecord':
              return drawNodeExpandedRoundedRect(numberOfAttributes, expWidth, 10);
              break;
            case 'record':
              return drawNodeExpandedRect(numberOfAttributes, expWidth);
              break;
            default:
              return drawNodeExpandedRect(numberOfAttributes, expWidth);
              break;
          }
        });

    /* TABS START */
    showAttributes();
    // ATTRIBUTES

    d3.select(nodePathShape.parentNode)
        .classed('tab-1', true)

        .append('svg')
        .classed('tab', true)
        .classed(node.name + 'Tabs', true)
        .on('click', function () {
          setTabActive(this);
          showAttributes();
        })
        .attr('x', 4 - expWidth)
        .attr("y", 5)
        .append('use')
        .attr('xlink:href', '#tab-shape')
        .attr('transform', 'scale(0.55, 0.4)');


    d3.select(nodePathShape.parentNode)
        .append('text')
        .attr('class', node.name + 'Tabs')
        .attr("y", 16)
        .attr('text-anchor', 'left')
        .attr('x', 4 - expWidth + 5)
        .attr('font-size', 8)
        .attr('font-family', 'sans-serif')
        .attr('fill', "white")
        .text(function (d) {
          return "Attribute";
        })

    d3.select(nodePathShape.parentNode)
        .classed('tab-2', true)
        .append('svg')
        .classed('tab', true)
        .classed(node.name + 'Tabs', true)
        .on('click', function () {
          setTabActive(this);
          showDescription();
        })
        .attr('x', -expWidth + 63)
        .attr("y", 5)
        .append('use')
        .attr('xlink:href', '#tab-shape')
        .attr('transform', 'scale(0.65, 0.4)');


    d3.select(nodePathShape.parentNode)
        .append('text')
        .attr('class', node.name + 'Tabs')
        .attr("y", 16)
        .attr('text-anchor', 'left')
        .attr('x', -expWidth + 63 + 5)
        .attr('font-size', 8)
        .attr('font-family', 'sans-serif')
        .attr('fill', "white")
        .text(function (d) {
          return "Description";
        })


    d3.select(nodePathShape.parentNode)
        .classed('tab-2', true)
        .append('svg')
        .classed('tab', true)
        .classed(node.name + 'Tabs', true)
        .on('click', function () {
          setTabActive(this);
          showDescription();
        })
        .attr('x', -expWidth + 63 + 70)
        .attr("y", 5)
        .append('use')
        .attr('xlink:href', '#tab-shape')
        .attr('transform', 'scale(0.45, 0.4)');


    d3.select(nodePathShape.parentNode)
        .append('text')
        .attr('class', node.name + 'Tabs')
        .attr("y", 16)
        .attr('text-anchor', 'left')
        .attr('x', -expWidth + 63 + 70 + 5)
        .attr('font-size', 8)
        .attr('font-family', 'sans-serif')
        .attr('fill', "white")
        .text(function (d) {
          return "Methods";
        })


    function setTabActive(d) {
      console.log("alles zurücksetzen");
      d3.select(d.parentNode).selectAll('.tab').style("fill", 'url(#tab-2-bg)');
      d3.select(d).style("fill", 'url(#tab-4-bg)');
    }

    function removeAttributeText() {
      d3.select(nodePathShape.parentNode).selectAll("." + node.name + 'AttributeText').remove();
    }

    function removeDescriptionText() {
      d3.select(nodePathShape.parentNode).selectAll("." + node.name + 'DescriptionText').remove();
    }

    /* TABS END */

    function showAttributes() {

      removeDescriptionText();

      maxLengthAttributeTypes = getMaxLengthAttributeTypes(node);

      for (i = 0; i < numberOfAttributes; i++) {
        d3.select(nodePathShape.parentNode)
            .append('text')
            .attr('class', node.name + 'AttributeText')
            .attr("dy", (i + 1) * 20 + 10)
            .attr('text-anchor', 'left')
            .attr('x', 5 - expWidth)
            .attr('font-size', 8)
            .attr('font-family', 'sans-serif')
            .attr('fill', node.fontcolor)
            .text(function (d) {
              return d.attributes[i][0];
            });

        d3.select(nodePathShape.parentNode)
            .append("text")
            .attr("class", node.name + "AttributeText")
            .attr("dy", (i + 1) * 20 + 10)
            .attr("text-anchor", "right")
            .attr('fill', function (d) {

              for (var it = 0, l = TYPE_COLORS.length; it < l; it++) {
                if (d.attributes[i][1] == TYPE_COLORS[it][0]) {
                  return TYPE_COLORS[it][1];
                }
              }
            })
            .attr("font-size", 8)
            .attr("font-family", "sans-serif")

            .text(function (d) {
              return " :: " + d.attributes[i][1];
            })
            .attr("x", function (d) {
              return expWidth - (maxLengthAttributeTypes * 6);
            });

      }
    }


    function showDescription() {

      removeAttributeText();

      d3.select(nodePathShape.parentNode)
          .append('text')
          .attr('class', node.name + 'DescriptionText')
          .attr("dy", 30)
          .attr('text-anchor', 'left')
          .attr('x', 5 - expWidth)
          .attr('font-size', 8)
          .attr('font-family', 'sans-serif')
          .attr('fill', node.fontcolor)
          .text(function (d) {
            console.log(d);
            if (d.description.length > 0) {
              return d.description;
            }
            return "Keine Beschreibung vorhanden";
          });

    }
  }


  function getShapeHeight(nodePathShape) {
    var element = d3.select(nodePathShape)[0][0],
        elementPath = element.getAttribute('d');

    return parseFloat(/[0-9]+\sZ/.exec(elementPath)[0].replace(' Z', ''));
  }


  function getMaxLengthAttribute(node) {

    var numberOfAttributes = node.attributes.length,
        maxNameLength = getMaxLengthAttributeNames(node),
        maxAttributeLength = getMaxLengthAttributeTypes(node);

    var lengthTogether = maxNameLength + maxAttributeLength;

    if (node.name.length > lengthTogether) {
      return node.name.length;
    } else {
      return lengthTogether;
    }

  }


  function getMaxLengthAttributeNames(node) {

    var numberOfAttributes = node.attributes.length,
        maxLengthAttribute = 0;

    for (i = 0; i < numberOfAttributes; i++) {

      var currentNodeLength = node.attributes[i][0].length;

      if (currentNodeLength > maxLengthAttribute) {
        maxLengthAttribute = currentNodeLength;
      }
    }

    if (node.name.length > maxLengthAttribute) {
      return node.name.length;
    } else {
      return maxLengthAttribute;
    }
  }


  function getMaxLengthAttributeTypes(node) {

    var numberOfAttributes = node.attributes.length,
        maxLengthAttribute = 0;


    for (i = 0; i < numberOfAttributes; i++) {

      var currentNodeLength = node.attributes[i][1].length;

      if (currentNodeLength > maxLengthAttribute) {
        maxLengthAttribute = currentNodeLength;
      }
    }


    if (node.name.length > maxLengthAttribute) {
      return node.name.length;
    } else {
      return maxLengthAttribute;
    }
  }


  function minimizeNode(node, nodePathShape) {
    d3.select(nodePathShape).attr('d', node.shape);
    $("div#model-diagram-info").empty().append("<p style='display: inline-block; padding-right: 5px;' class='text-muted'>Model information</p>");
    $('text.' + node.name + "AttributeText").remove();
    $('text.' + node.name + "DescriptionText").remove();
    $('.' + node.name + 'Tabs').remove();
    $("rect.node-git-link").remove();
    $("rect." + node.name + "AttributeBackground").remove();

    node.expanded = false;
  }

  function nodeDoubleClicked(node) {
    // node refers node object
    // this refers to node path shape
    if (d3.event.defaultPrevented) return; // dragged

    if (node.attributes !== null) {

      var numberOfAttributes = node.attributes.length
      var maxLengthAttribute = getMaxLengthAttribute(node)

      $("div#model-diagram-info").empty();

      node.expanded = true;

      if ($("text." + node.name + "AttributeText").length < 1) {
        console.log("ausklappen");

        var n = $(this).parent();
        n.parent().append(n.detach());

        drawEntireNodeExpanded(this, maxLengthAttribute, node);

        shapeHeight = getShapeHeight(this);

      } else {

        console.log("einklappen");

        minimizeNode(node, this);
      }
    } else {
      $("div#model-diagram-info").empty().append("<p style='display: inline-block; padding-right: 5px;'>No attributes for " + node.name.replace(/_/g, '::') + "</p>");
    }
  }

  function tickEnd() {
    savedgraph = nodes;
  }

  var force =
      d3.layout.force()
          .size([width, height])
          .charge(charge)
          .gravity(gravity)
          .friction(friction)
          .linkDistance(linkDistance)
          .linkStrength(linkStrength)
          .nodes(d3.values(nodes))
          .links(links)
          .chargeDistance(chargeDistance)
          .on('tick', tick)
          .on('end', tickEnd)
          .start();
  //.chargeDistance(chargeDistance)

  var n = 100;

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.selectAll('.node').classed("fixed", d.fixed = true);
  }

  var drag = force.drag()
      .origin(function (d) {
        return d;
      })
      .on("dragstart", dragstarted);

  var svg =
      d3.select("div#svg-model-diagram")
          .append("div")
          .classed("svg-container", true)
          .append("svg")
          .call(zoom)
          .on("dblclick.zoom", null)
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 600 400")
          //class to make it responsive
          .classed("svg-content-responsive", true);

  var viz =
      svg.append('g')
          .attr('id', 'viz');

  function zoomed() {
    viz.attr("transform",
        "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
  };

  function helpToggle() {
    $('svg > image.help-image').toggleClass('no-opacity');
    $('svg > g > rect.help-btn').toggleClass('inactive-help-btn');
  }

  path = 'assets/images/gc-help.png'
  var gcHelpImg = svg.selectAll('image').data([0]);
  gcHelpImg.enter()
      .append('svg:image')
      .attr('xlink:href', path)
      .classed('help-image', true)
      .attr('x', '0')
      .attr('y', '30')
      .attr('width', '170')
      .attr('height', '170')

  var helpBtn =
      svg.append('g')
          .attr('id', 'help-btn-group')
          .attr('transform', 'translate(45,10)');

  helpBtn.append('rect')
      .classed('help-btn', true)
      .attr('width', '31')
      .attr('height', '7')
      .style('fill', 'lightGray')
      .style('stroke-width', 0.3)
      .style('stroke', 'darkGreen')
      .attr("float", "left")
      .on("dblclick", helpToggle);

  helpBtn.append('text')
      .classed('help-btn-text', true)
      .attr('x', 3)
      .attr('y', 5)
      .style('fill', 'black')
      .style('font-size', '5px')
      .attr("font-family", "Verdana, Helvetica, sans-serif")
      .text('Help toggle');

  // build the stub
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["stub"]) // Different link/path types can be defined here
      .enter().append("viz:marker") // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "-1 -5 2 10")
      .attr("refX", 17)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawStub);

  // build the diamond (ex-crow)
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["crow"]) // Different link/path types can be defined here
      .enter().append("viz:marker") // This section adds in the marker
      .attr("id", String)
      .attr("viewBox", "-10 -6 20 12")
      .attr("refX", 30)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .attr('fill', '#7B0000')
      .append("viz:path")
      .attr("d", drawDiamond);

  // build the light gray single_arrow
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["single_arrow_light_gray"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 20 30")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawSingleArrow)
      .attr("fill", "#BBB");

  // build the blue double_arrow
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["double_arrow_blue"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 20 30")
      .attr("refX", 35)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawDoubleArrow)
      .attr("fill", "#1c7a9b");

  // build the green double_arrow
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["double_arrow_green"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 20 30")
      .attr("refX", 35)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawDoubleArrow)
      .attr("fill", "#789e2d");

  // build the green double_arrow_backwards
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["double_arrow_backwards_green"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 20 30")
      .attr("refX", -20)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawDoubleArrowBackwards)
      .attr("fill", "#789e2d");

  // build the blue triple_arrow
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["triple_arrow_blue"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 20 45")
      .attr("refX", 43)
      .attr("refY", 0)
      .attr("markerWidth", 17)
      .attr("markerHeight", 17)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawTripleArrow)
      .attr("fill", "#1c7a9b");

  // build the light gray dot
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["dot_light_gray"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 10 10")
      .attr("refX", -13)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawDot)
      .attr("fill", "#BBB");

  // build the blue dot
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["dot_blue"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 10 10")
      .attr("refX", -13)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawDot)
      .attr("fill", "#1c7a9b");

  // build the dark gray dot
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["dot_dark_gray"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 10 10")
      .attr("refX", -13)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawDot)
      .attr("fill", "#383838");

  // build the light gray odot
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["odot_light_gray"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 10 10")
      .attr("refX", -20)
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawOdot)
      .attr("fill", "#F9F9F9")
      .attr("stroke", "#BBB")
      .attr('stroke-width', 2);

  // build the blue odot
  viz.append("viz:defs")
      .selectAll("marker")
      .data(["odot_blue"])
      .enter().append("viz:marker")
      .attr("id", String)
      .attr("viewBox", "-5 -5 10 10")
      .attr("refX", -20)
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("viz:path")
      .attr("d", drawOdot)
      .attr("fill", "#F9F9F9")
      .attr("stroke", "#1c7a9b")
      .attr('stroke-width', 2);

  // add the links and the arrows
  var path =
      viz.append("viz:g")
          .selectAll("path")
          .data(force.links())
          .enter()
          .append("viz:path")
          .attr("class", "link")
          .attr('id', function (d, i) {
            return "linkPathId" + i;
          })
          .style("stroke", function (d) {
            return d.color;
          })
          .style("stroke-width", 2)
          .attr("marker-start", function (d) {
            return "url(#" + d.arrowtail + ")";
          })
          .attr("marker-end", function (d) {
            return "url(#" + d.arrowhead + ")";
          })
          .on("dblclick", linkDoubleClicked);

  var linktext =
      viz.append("viz:g")
          .selectAll("g.linklabelholder")
          .data(force.links())
          .enter()
          .append("g")
          .attr("class", "linklabelholder")
          .append("text")
          .attr("class", "linklabel")
          .style("font-size", "6px")
          .attr("font-family", "sans-serif")
          .attr("dy", -5)
          .attr("dx", 25)
          .attr("text-anchor", "start")
          .style("fill", "#000")
          .append("textPath")
          .attr("id", function (d, i) {
            return "textlinkPathId" + i;
          })
          .attr("xlink:href", function (d, i) {
            return "#linkPathId" + i;
          })
          .style("display", "none")
          .text(function (d) {
            linkText = d.source.name + " # " + d.target.name
            return linkText.replace(/_/g, '::');
          });

  // define the nodes
  var viz_nodes =
      viz.selectAll(".node")
          .data(force.nodes())
          .enter().append("g")
          .attr("class", "node")
          .call(
              force.drag().origin(function (d) {
                return d;
              })
          );
  // add the nodes
  viz_nodes.append("path")
      .attr("d", function (d) {
        return d.shape;
      })
      .attr("fill", function (d) {
        return d.fillcolor;
      })
      .on("click", nodeDoubleClicked)
      .on('contextmenu', function (d) {
        d3.event.preventDefault();
        //d3.select(this).classed("fixed", d.fixed = false);
      });

  // add the text
  viz_nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-size", 8)
      .attr("font-family", "sans-serif")
      .attr("fill", function (d) {
        return d.fontcolor;
      })
      .text(function (d) {
        return d.name.replace(/_/g, '::');
      });

  function tick() {

    path.attr("d", function (d) {
      var dr = 0;
      var heightSource = calculateHeight(d.source);
      var heightTarget = calculateHeight(d.target);
      var widthSource = calculateWidth(d.source);
      var widthTarget = calculateWidth(d.target);


      var sourceCenter = {};
      sourceCenter.y = d.source.y + (heightSource / 2);
      sourceCenter.x = d.source.x;

      var targetCenter = {};
      targetCenter.y = d.target.y + (heightTarget / 2);
      targetCenter.x = d.target.x;

      var newSource = calculateLine(sourceCenter, targetCenter, widthSource, heightSource);

      var newTarget = calculateLine(targetCenter, sourceCenter, widthTarget, heightTarget);

      return "M " +
          newSource.x + "," +
          (newSource.y - 5) + "A" +
          dr + "," + dr + " 0 0,1 " +
          newTarget.x + "," +
          (newTarget.y - 5);
    });
    viz_nodes.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    viz_nodes.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    savedGraph = nodes;
    localStorage.setItem('savedGraph',d3.selectAll('.node'));
    //console.log(savedGraph);
  }

  function calculateHeight(node) {
    if (node.expanded) {
      return (node.attributes.length * 21 + 20);
    } else {
      return 10;
    }
  }

  function calculateWidth(node) {
    if (node.expanded) {

      if (node.attributes) {
        var maxLengthAttributeSource = getMaxLengthAttribute(node);
        return expandedWidth(maxLengthAttributeSource) + 110;
      } else {
        return expandedWidth(node.name.length);
      }
    } else {
      return expandedWidth(node.name.length) + 30;
    }
  }

  function calculateLine(source, target, width, height) {
    // NEEDS CENTER OF SOURCE AND TARGET
    halfWidth = width / 2;
    halfHeight = height / 2;

    if (source.x > target.x) {
      halfWidth *= -1
    }

    if (source.y > target.y) {
      halfHeight *= -1
    }

    var distance_x = target.x - source.x;
    var distance_y = target.y - source.y;

    var fxd = distance_x * halfHeight / distance_y;
    var fyd = distance_y * halfWidth / distance_x;

    var x = source.x + fxd;
    var y = source.y + fyd;

    var result = {}
    if (Math.abs(fxd) < Math.abs(halfWidth)) {
      result.x = x;
      result.y = source.y + halfHeight;
      return result;
    } else {
      result.x = source.x + halfWidth;
      result.y = y;
      return result;
    }
  }

};

var model_diagram_json = {
  "models": {
    "nodes": [{
      "name": "Auth::RefreshToken",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["updated_at", "Timestamp without time zone"], ["user_id", "Integer"], ["token", "Character varying"], ["ip_address", "Inet"], ["user_agent", "Character varying"], ["last_used_at", "Timestamp without time zone"], ["created_at", "Timestamp without time zone"], ["id", "Integer"]],
      "description": []
    }, {
      "name": "DeletedUser",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["location", "Character varying"], ["origin_id", "Integer"], ["origin_created_at", "Timestamp without time zone"], ["origin_updated_at", "Timestamp without time zone"], ["email", "Character varying"], ["password_digest", "Character varying"], ["first_name", "Character varying"], ["last_name", "Character varying"], ["gender", "Integer"], ["avatar_file_name", "Character varying"], ["avatar_content_type", "Character varying"], ["avatar_file_size", "Integer"], ["avatar_updated_at", "Timestamp without time zone"], ["height", "Numeric"], ["weight", "Numeric"], ["weight_unit", "Integer"], ["height_unit", "Integer"], ["birthday", "Date"], ["email_confirmed_at", "Timestamp without time zone"], ["locale", "Character varying"], ["registration_country", "Character varying"], ["application_source", "Integer"], ["platform_source", "Integer"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"], ["emails_allowed", "Boolean"], ["about", "Text"], ["measurement_system", "Integer"], ["sanitized_email", "Character varying"], ["time_zone", "Character varying"], ["id", "Integer"]],
      "description": ["Desch isch a tescht", "ischisch"]
    }, {
      "name": "Event",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["updated_at", "Timestamp without time zone"], ["done_at", "Timestamp without time zone"], ["done_by", "Character varying(255)"], ["fl_uid", "Integer"], ["source", "Character varying(255)"], ["message", "Character varying"], ["type", "Character varying(255)"], ["data", "Jsonb"], ["metadata", "Jsonb"], ["created_at", "Timestamp without time zone"], ["id", "Integer"]],
      "description": []
    }, {
      "name": "Facebook::Account",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["id", "Integer"], ["user_id", "Integer"], ["access_token", "Text"], ["uid", "Bigint"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"]],
      "description": []
    }, {
      "name": "Facebook::MobileAppInstall",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["id", "Integer"], ["advertiser_id", "Character varying(100)"], ["application_id", "Character varying(100)"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"]],
      "description": []
    }, {
      "name": "Marketing::AppBanner",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["platform", "Integer"], ["title", "Character varying"], ["action_url", "Character varying"], ["coach", "Integer"], ["gender", "Integer"], ["starts_at", "Timestamp without time zone"], ["ends_at", "Timestamp without time zone"], ["image_file_name", "Character varying"], ["image_content_type", "Character varying"], ["image_file_size", "Integer"], ["image_updated_at", "Timestamp without time zone"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"], ["locales", "Character varying"], ["translations", "Jsonb"], ["id", "Integer"]],
      "description": []
    }, {
      "name": "Marketing::Campaign",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["translations", "Jsonb"], ["title", "Character varying"], ["text", "Character varying"], ["whats_new_text", "Character varying"], ["link_text", "Character varying"], ["link_url", "Character varying"], ["uses_button_for_link", "Boolean"], ["uses_action_button", "Boolean"], ["link_button_tracking", "Character varying"], ["close_button_tracking", "Character varying"], ["platform", "Integer"], ["gender", "Integer"], ["coach", "Integer"], ["impressions", "Integer"], ["start_date", "Timestamp without time zone"], ["end_date", "Timestamp without time zone"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"], ["image_file_name", "Character varying"], ["image_content_type", "Character varying"], ["image_file_size", "Integer"], ["image_updated_at", "Timestamp without time zone"], ["theme", "Integer"], ["locales", "Character varying"], ["id", "Integer"]],
      "description": []
    }, {
      "name": "Marketing::EmailConfirmation",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["sent_at", "Timestamp without time zone"], ["user_id", "Integer"], ["token", "Character varying"], ["id", "Integer"], ["confirmed_at", "Timestamp without time zone"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"]],
      "description": []
    }, {
      "name": "Marketing::UserProfile",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["id", "Integer"], ["marketing_campaign_id", "Integer"], ["user_id", "Integer"], ["clicked", "Integer"], ["closed", "Integer"]],
      "description": []
    }, {
      "name": "Marketing::WebCampaign",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["updated_at", "Timestamp without time zone"], ["voucher_token", "Character varying"], ["target", "Integer"], ["starts_at", "Timestamp without time zone"], ["ends_at", "Timestamp without time zone"], ["headline", "Character varying"], ["subline", "Character varying"], ["translations", "Jsonb"], ["created_at", "Timestamp without time zone"], ["id", "Bigint"]],
      "description": []
    }, {
      "name": "NotificationInfo",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["confirmation_delivered_by_aws_at", "Timestamp without time zone"], ["user_id", "Integer"], ["aws_bounced", "Boolean"], ["aws_bounce_info", "Character varying"], ["optivo_bounced", "Boolean"], ["optivo_bounce_info", "Character varying"], ["optivo_blacklisted", "Boolean"], ["optivo_blacklist_info", "Character varying"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"], ["confirmation_sent_to_aws_at", "Timestamp without time zone"], ["id", "Integer"]],
      "description": []
    }, {
      "name": "Referral::Gift",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["type", "Integer"], ["user_id", "Integer"], ["referral_reference_id", "Integer"], ["id", "Integer"], ["details", "Json"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"]],
      "description": []
    }, {
      "name": "Referral::Reference",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["rejected_at", "Timestamp without time zone"], ["inviter_id", "Integer"], ["invitee_id", "Integer"], ["registered_at", "Timestamp without time zone"], ["activated_at", "Timestamp without time zone"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"], ["brand_type", "Character varying"], ["approved_at", "Timestamp without time zone"], ["id", "Integer"]],
      "description": []
    }, {
      "name": "Status",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["id", "Integer"], ["user_id", "Integer"], ["values", "Json"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"]],
      "description": []
    }, {
      "name": "TemporaryPassword",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["id", "Integer"], ["user_id", "Integer"], ["password", "Character varying"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"]],
      "description": []
    }, {
      "name": "User",
      "shape": "Mrecord",
      "fillcolor": null,
      "fontcolor": null,
      "attributes": [["location", "Character varying"], ["email", "Character varying"], ["password_digest", "Character varying"], ["first_name", "Character varying"], ["last_name", "Character varying"], ["gender", "Integer"], ["avatar_file_name", "Character varying"], ["avatar_content_type", "Character varying"], ["avatar_file_size", "Integer"], ["avatar_updated_at", "Timestamp without time zone"], ["height", "Numeric"], ["weight", "Numeric"], ["weight_unit", "Integer"], ["height_unit", "Integer"], ["birthday", "Date"], ["email_confirmed_at", "Timestamp without time zone"], ["locale", "Character varying"], ["registration_country", "Character varying"], ["application_source", "Integer"], ["platform_source", "Integer"], ["created_at", "Timestamp without time zone"], ["updated_at", "Timestamp without time zone"], ["emails_allowed", "Boolean"], ["about", "Text"], ["measurement_system", "Integer"], ["sanitized_email", "Character varying"], ["time_zone", "Character varying"], ["id", "Integer"]],
      "description": []
    }],
    "links": [{
      "source": "Marketing::UserProfile",
      "target": "Marketing::Campaign",
      "arrowtail": "dot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Audited::Audit",
      "target": "NotificationInfo",
      "arrowtail": "odot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Referral::Reference",
      "target": "User",
      "arrowtail": "dot_dark_gray",
      "arrowhead": "none",
      "color": "#383838"
    }, {
      "source": "Audited::Audit",
      "target": "User",
      "arrowtail": "odot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Audited::Audit",
      "target": "User",
      "arrowtail": "odot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Facebook::Account",
      "target": "User",
      "arrowtail": "dot_light_gray",
      "arrowhead": "single_arrow_light_gray",
      "color": "#BBB"
    }, {
      "source": "NotificationInfo",
      "target": "User",
      "arrowtail": "dot_light_gray",
      "arrowhead": "single_arrow_light_gray",
      "color": "#BBB"
    }, {
      "source": "TemporaryPassword",
      "target": "User",
      "arrowtail": "dot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Auth::RefreshToken",
      "target": "User",
      "arrowtail": "dot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Marketing::UserProfile",
      "target": "User",
      "arrowtail": "dot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }, {
      "source": "Marketing::EmailConfirmation",
      "target": "User",
      "arrowtail": "dot_blue",
      "arrowhead": "double_arrow_blue",
      "color": "#1c7a9b"
    }]
  }
};

model_diagram_json["models"].links
if (typeof model_diagram_json !== "undefined") {

  generate_model_diagram_svg(model_diagram_json);

}
