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
    gs.error('Filter Broadcast Buttons Widget: Invalid JSON in filters option - ' + e.message);
  }
  
  // Set data for the client
  data.filters = parsedFilters;
  data.title = title;
})();
