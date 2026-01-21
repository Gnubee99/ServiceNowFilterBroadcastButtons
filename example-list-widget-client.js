/**
 * Example List Widget Client Script
 * 
 * This script should be added to any list widget that needs to respond to
 * filter broadcasts from the Filter Broadcast Buttons widget.
 * 
 * This example demonstrates how to:
 * 1. Listen for filter broadcast events
 * 2. Add broadcast filters to existing list filters
 * 3. Clear broadcast filters while preserving original filters
 */

function($scope, $rootScope) {
  var c = this;
  
  // Store the original filter that was configured on the list widget
  // This ensures we don't lose the base filter when applying broadcasts
  var originalFilter = c.options.filter || c.data.filter || '';
  
  /**
   * Listen for filter add events from Filter Broadcast Buttons widget
   */
  $rootScope.$on('sp.list.filter.add', function(event, data) {
    if (data && data.filter) {
      console.log('Filter broadcast received:', data);
      
      // Combine original filter with broadcast filter using ^ (AND operator)
      if (originalFilter) {
        c.data.filter = originalFilter + '^' + data.filter;
      } else {
        c.data.filter = data.filter;
      }
      
      // Refresh the list with the new filter
      c.server.update();
    }
  });
  
  /**
   * Listen for filter clear events from Filter Broadcast Buttons widget
   */
  $rootScope.$on('sp.list.filter.clear', function(event, data) {
    console.log('Clear filter broadcast received');
    
    // Reset to original filter, removing all broadcast filters
    c.data.filter = originalFilter;
    
    // Refresh the list
    c.server.update();
  });
  
  /**
   * Optional: Listen for custom broadcast events
   * Uncomment this if you're using a custom broadcast event
   */
  /*
  $rootScope.$on('custom.filter.event', function(event, data) {
    if (data && data.filter) {
      console.log('Custom filter broadcast received:', data);
      
      // Same logic as above
      if (originalFilter) {
        c.data.filter = originalFilter + '^' + data.filter;
      } else {
        c.data.filter = data.filter;
      }
      
      c.server.update();
    }
  });
  
  $rootScope.$on('custom.filter.event.clear', function(event, data) {
    console.log('Custom clear filter broadcast received');
    c.data.filter = originalFilter;
    c.server.update();
  });
  */
}
