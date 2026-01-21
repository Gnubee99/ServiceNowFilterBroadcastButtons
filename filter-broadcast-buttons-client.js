function($scope, $rootScope) {
  var c = this;
  
  // Initialize the widget
  c.$onInit = function() {
    c.data.activeFilter = null;
  };
  
  // Apply a filter and broadcast it to list widgets
  c.applyFilter = function(filter, label) {
    c.data.activeFilter = filter;
    
    // Parse the filter string to extract field and value
    // For simple filters like "u_state=1", extract field and value
    // For complex filters (e.g., "priority<=2", "stateIN1,2"), just send the full filter
    var field = '';
    var value = '';
    
    // Try to parse simple field=value pattern
    var simpleMatch = filter.match(/^([^=<>!]+)=(.+)$/);
    if (simpleMatch) {
      field = simpleMatch[1];
      value = simpleMatch[2];
    }
    
    // Broadcast the filter to list widgets
    // The filter is sent as an encoded query string that adds to existing filters
    $rootScope.$broadcast('sp.list.filter.add', {
      field: field,
      value: value,
      filter: filter,
      label: label
    });
    
    // Also broadcast with a custom event name if specified in options
    if (c.options.broadcast_event) {
      $rootScope.$broadcast(c.options.broadcast_event, {
        field: field,
        value: value,
        filter: filter,
        label: label
      });
    }
  };
  
  // Clear the active filter
  c.clearFilter = function() {
    c.data.activeFilter = null;
    
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
