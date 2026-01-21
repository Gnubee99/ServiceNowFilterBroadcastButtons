function($scope, $rootScope) {
  var c = this;
  
  // Initialize the widget
  c.$onInit = function() {
    // Track active filters by group: {groupName: {filter: label}}
    c.data.activeFiltersByGroup = {};
  };
  
  // Check if a filter is currently active
  c.isFilterActive = function(filter, groupName) {
    if (c.data.isGrouped && groupName) {
      return c.data.activeFiltersByGroup[groupName] && 
             Object.prototype.hasOwnProperty.call(c.data.activeFiltersByGroup[groupName], filter);
    } else {
      // Backward compatibility for flat structure
      return c.data.activeFiltersByGroup['default'] && 
             Object.prototype.hasOwnProperty.call(c.data.activeFiltersByGroup['default'], filter);
    }
  };
  
  // Check if any filters are active
  c.hasActiveFilters = function() {
    for (var groupName in c.data.activeFiltersByGroup) {
      if (c.data.activeFiltersByGroup.hasOwnProperty(groupName)) {
        if (Object.keys(c.data.activeFiltersByGroup[groupName]).length > 0) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Apply a filter and broadcast it to list widgets
  c.applyFilter = function(filter, label, groupName) {
    groupName = groupName || 'default';
    
    // Initialize group if it doesn't exist
    if (!c.data.activeFiltersByGroup[groupName]) {
      c.data.activeFiltersByGroup[groupName] = {};
    }
    
    // Toggle behavior: if filter is already active, remove it
    if (c.isFilterActive(filter, groupName)) {
      delete c.data.activeFiltersByGroup[groupName][filter];
      // Clean up empty groups
      if (Object.keys(c.data.activeFiltersByGroup[groupName]).length === 0) {
        delete c.data.activeFiltersByGroup[groupName];
      }
    } else {
      // Add filter to active filters in this group
      c.data.activeFiltersByGroup[groupName][filter] = label;
    }
    
    // Build combined filter with group logic:
    // - Within a group: use OR (^OR)
    // - Between groups: use AND (^)
    var groupFilters = [];
    
    for (var gName in c.data.activeFiltersByGroup) {
      if (c.data.activeFiltersByGroup.hasOwnProperty(gName)) {
        var filtersInGroup = Object.keys(c.data.activeFiltersByGroup[gName]);
        if (filtersInGroup.length > 0) {
          if (filtersInGroup.length === 1) {
            // Single filter in group, no need for parentheses
            groupFilters.push(filtersInGroup[0]);
          } else {
            // Multiple filters in group, join with ^OR
            groupFilters.push(filtersInGroup.join('^OR'));
          }
        }
      }
    }
    
    var combinedFilter = groupFilters.join('^');
    
    // Parse the combined filter string to extract field and value
    var field = '';
    var value = '';
    
    // Try to parse simple field=value pattern from first filter
    if (groupFilters.length > 0) {
      var firstFilter = groupFilters[0];
      // Extract the first field=value from potentially complex filter
      var simpleMatch = firstFilter.match(/^([^=<>!]+)=(.+?)(?:\^OR|$)/);
      if (simpleMatch) {
        field = simpleMatch[1];
        value = simpleMatch[2];
      }
    }
    
    // Broadcast the filter to list widgets
    $rootScope.$broadcast('sp.list.filter.add', {
      field: field,
      value: value,
      filter: combinedFilter,
      label: label,
      activeFiltersByGroup: c.data.activeFiltersByGroup
    });
    
    // Also broadcast with a custom event name if specified in options
    if (c.options.broadcast_event) {
      $rootScope.$broadcast(c.options.broadcast_event, {
        field: field,
        value: value,
        filter: combinedFilter,
        label: label,
        activeFiltersByGroup: c.data.activeFiltersByGroup
      });
    }
  };
  
  // Clear the active filter
  c.clearFilter = function() {
    c.data.activeFiltersByGroup = {};
    
    // Broadcast clear filter event
    $rootScope.$broadcast('sp.list.filter.clear', {
      clearAll: false
    });
    
    // Also broadcast with a custom event name if specified in options
    if (c.options.broadcast_event) {
      $rootScope.$broadcast(c.options.broadcast_event + '.clear', {});
    }
  };
}
