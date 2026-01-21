(function() {
  // Get widget options
  var filters = options.filters || '{}';
  var title = options.title || '';
  
  // Parse the filters JSON if it's a string
  var parsedFilters = {};
  try {
    if (typeof filters === 'string') {
      parsedFilters = JSON.parse(filters);
    } else {
      parsedFilters = filters;
    }
  } catch (e) {
    gs.error('Filter Broadcast Buttons Widget: Invalid JSON in filters option - ' + e.message + '. Filters value: ' + filters);
  }
  
  // Detect if filters are grouped or flat
  // Grouped: {"Group1": {"filter1": "label1"}, "Group2": {"filter2": "label2"}}
  // Flat: {"filter1": "label1", "filter2": "label2"}
  var isGrouped = false;
  var filterGroups = [];
  
  for (var key in parsedFilters) {
    if (parsedFilters.hasOwnProperty(key)) {
      var value = parsedFilters[key];
      // Check if value is an object (group) rather than a string (label)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        isGrouped = true;
        break;
      }
    }
  }
  
  if (isGrouped) {
    // Convert grouped structure to array for easier template iteration
    for (var groupName in parsedFilters) {
      if (parsedFilters.hasOwnProperty(groupName)) {
        filterGroups.push({
          name: groupName,
          filters: parsedFilters[groupName]
        });
      }
    }
    data.filterGroups = filterGroups;
    data.isGrouped = true;
  } else {
    // For backward compatibility, keep flat structure
    data.filters = parsedFilters;
    data.isGrouped = false;
  }
  
  data.title = title;
})();
