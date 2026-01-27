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
    // Separate text-based filters into their own section
    var textSearchFilters = {};
    
    for (var groupName in parsedFilters) {
      if (parsedFilters.hasOwnProperty(groupName)) {
        var groupFilters = parsedFilters[groupName];
        var processedFilters = {};
        
        // Process each filter to detect text input patterns
        for (var filterKey in groupFilters) {
          if (groupFilters.hasOwnProperty(filterKey)) {
            var isTextInput = filterKey.indexOf('*text*') !== -1;
            
            if (isTextInput) {
              // Add text input filters to the Text Search section
              textSearchFilters[filterKey] = {
                label: groupFilters[filterKey],
                isTextInput: true
              };
            } else {
              // Add button filters to their original group
              processedFilters[filterKey] = {
                label: groupFilters[filterKey],
                isTextInput: false
              };
            }
          }
        }
        
        // Only add the group if it has button filters
        if (Object.keys(processedFilters).length > 0) {
          filterGroups.push({
            name: groupName,
            filters: processedFilters
          });
        }
      }
    }
    
    // Add Text Search section if there are any text input filters
    if (Object.keys(textSearchFilters).length > 0) {
      filterGroups.push({
        name: 'Text Search',
        filters: textSearchFilters,
        isTextSearchGroup: true
      });
    }
    
    data.filterGroups = filterGroups;
    data.isGrouped = true;
  } else {
    // For backward compatibility, keep flat structure but separate text inputs
    var processedFlatFilters = {};
    var flatTextSearchFilters = {};
    
    for (var flatFilterKey in parsedFilters) {
      if (parsedFilters.hasOwnProperty(flatFilterKey)) {
        var isFlatTextInput = flatFilterKey.indexOf('*text*') !== -1;
        
        if (isFlatTextInput) {
          flatTextSearchFilters[flatFilterKey] = {
            label: parsedFilters[flatFilterKey],
            isTextInput: true
          };
        } else {
          processedFlatFilters[flatFilterKey] = {
            label: parsedFilters[flatFilterKey],
            isTextInput: false
          };
        }
      }
    }
    
    // If there are text inputs, convert to grouped structure with two groups
    if (Object.keys(flatTextSearchFilters).length > 0) {
      data.isGrouped = true;
      data.filterGroups = [];
      
      // Add button filters group if any exist
      if (Object.keys(processedFlatFilters).length > 0) {
        data.filterGroups.push({
          name: 'Filters',
          filters: processedFlatFilters
        });
      }
      
      // Add text search group
      data.filterGroups.push({
        name: 'Text Search',
        filters: flatTextSearchFilters,
        isTextSearchGroup: true
      });
    } else {
      // No text inputs, keep original flat structure
      data.filters = processedFlatFilters;
      data.isGrouped = false;
    }
  }
  
  data.title = title;
})();
