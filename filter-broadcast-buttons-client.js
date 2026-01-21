function($scope, $rootScope) {
  var c = this;
  
  // Initialize the widget
  c.$onInit = function() {
    c.data.activeFilter = null;
  };
  
  // Apply a filter and broadcast it to list widgets
  c.applyFilter = function(filter, label) {
    c.data.activeFilter = filter;
    
    // Parse the filter string (e.g., "u_state=1" becomes field: "u_state", value: "1")
    var filterParts = filter.split('=');
    if (filterParts.length === 2) {
      var field = filterParts[0];
      var value = filterParts[1];
      
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
