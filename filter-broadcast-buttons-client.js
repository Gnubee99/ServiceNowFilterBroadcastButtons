function($scope, $rootScope) {
  var c = this;
  
  // Initialize the widget
  c.$onInit = function() {
    c.data.activeFilters = {};
  };
  
  // Check if a filter is currently active
  c.isFilterActive = function(filter) {
    return Object.prototype.hasOwnProperty.call(c.data.activeFilters, filter);
  };
  
  // Check if any filters are active
  c.hasActiveFilters = function() {
    return Object.keys(c.data.activeFilters).length > 0;
  };
  
  // Apply a filter and broadcast it to list widgets
  c.applyFilter = function(filter, label) {
    // Toggle behavior: if filter is already active, remove it
    if (c.isFilterActive(filter)) {
      delete c.data.activeFilters[filter];
    } else {
      // Add filter to active filters
      c.data.activeFilters[filter] = label;
    }
    
    // Build combined filter with OR logic
    var filterKeys = Object.keys(c.data.activeFilters);
    var combinedFilter = '';
    
    if (filterKeys.length > 0) {
      // Join multiple filters with ^OR operator
      combinedFilter = filterKeys.join('^OR');
    }
    
    // Parse the combined filter string to extract field and value
    // For simple filters like "u_state=1", extract field and value
    var field = '';
    var value = '';
    
    // Try to parse simple field=value pattern from first filter
    if (filterKeys.length > 0) {
      var simpleMatch = filterKeys[0].match(/^([^=<>!]+)=(.+)$/);
      if (simpleMatch) {
        field = simpleMatch[1];
        value = simpleMatch[2];
      }
    }
    
    // Broadcast the filter to list widgets
    // The filter is sent as an encoded query string that adds to existing filters
    $rootScope.$broadcast('sp.list.filter.add', {
      field: field,
      value: value,
      filter: combinedFilter,
      label: label,
      activeFilters: c.data.activeFilters
    });
    
    // Also broadcast with a custom event name if specified in options
    if (c.options.broadcast_event) {
      $rootScope.$broadcast(c.options.broadcast_event, {
        field: field,
        value: value,
        filter: combinedFilter,
        label: label,
        activeFilters: c.data.activeFilters
      });
    }
  };
  
  // Clear the active filter
  c.clearFilter = function() {
    c.data.activeFilters = {};
    
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
