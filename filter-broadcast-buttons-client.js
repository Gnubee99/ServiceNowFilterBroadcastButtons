// Client controller for Filter Broadcast Buttons widget
// Dependencies: $scope, $rootScope, $timeout (Angular core services)
function($scope, $rootScope, $timeout) {
  var c = this;
  
  // Initialize the widget
  c.$onInit = function() {
    // Track active filters by group: {groupName: {filter: label}}
    c.data.activeFiltersByGroup = {};
    
    // Track text input values by group: {groupName: {filter: value}}
    c.textInputValues = {};
    
    // Track debounce timeouts for text inputs
    c.textInputTimeouts = {};
    
    // Initialize text input values for all groups
    if (c.data.isGrouped) {
      for (var i = 0; i < c.data.filterGroups.length; i++) {
        var group = c.data.filterGroups[i];
        c.ensureGroupExists(group.name);
      }
    } else {
      c.ensureGroupExists('default');
    }
  };
  
  // Helper to ensure a group's text input object exists
  c.ensureGroupExists = function(groupName) {
    if (!c.textInputValues[groupName]) {
      c.textInputValues[groupName] = {};
    }
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
  
  // Handle text input changes with debouncing
  c.onTextInputChange = function(filterTemplate, groupName) {
    groupName = groupName || 'default';
    
    // Safety check: ensure textInputValues object exists for this group
    c.ensureGroupExists(groupName);
    
    // Get the text input value
    var textValue = c.textInputValues[groupName][filterTemplate];
    
    // Create a unique key for this text input's timeout
    var timeoutKey = groupName + ':' + filterTemplate;
    
    // Cancel any pending timeout for this input
    if (c.textInputTimeouts[timeoutKey]) {
      $timeout.cancel(c.textInputTimeouts[timeoutKey]);
    }
    
    // Set up new timeout to apply filter after 1 second
    c.textInputTimeouts[timeoutKey] = $timeout(function() {
      if (textValue && textValue.trim() !== '') {
        // Replace *text* with the actual value
        // Note: In ServiceNow, GlideRecord handles query encoding to prevent injection
        var actualFilter = filterTemplate.replace(/\*text\*/g, textValue.trim());
        
        // Get the label for this filter
        var label = '';
        if (c.data.isGrouped) {
          for (var i = 0; i < c.data.filterGroups.length; i++) {
            if (c.data.filterGroups[i].name === groupName) {
              label = c.data.filterGroups[i].filters[filterTemplate].label;
              break;
            }
          }
        } else {
          label = c.data.filters[filterTemplate].label;
        }
        
        // Apply the filter with the substituted value
        c.applyTextInputFilter(filterTemplate, actualFilter, label, groupName);
      } else {
        // If text is empty, remove the filter
        c.removeTextInputFilter(filterTemplate, groupName);
      }
    }, 1000); // 1 second debounce
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
    
    // Broadcast the combined filter
    c.broadcastFilters();
  };
  
  // Apply text input filter (doesn't toggle, just sets/updates)
  c.applyTextInputFilter = function(filterTemplate, actualFilter, label, groupName) {
    groupName = groupName || 'default';
    
    // Initialize group if it doesn't exist
    if (!c.data.activeFiltersByGroup[groupName]) {
      c.data.activeFiltersByGroup[groupName] = {};
    }
    
    // Remove any previous version of this text input filter
    for (var existingFilter in c.data.activeFiltersByGroup[groupName]) {
      if (c.data.activeFiltersByGroup[groupName].hasOwnProperty(existingFilter)) {
        var existingValue = c.data.activeFiltersByGroup[groupName][existingFilter];
        // Check if this filter was generated from the same template by looking for the metadata marker
        if (typeof existingValue === 'object' && existingValue._textInputTemplate === filterTemplate) {
          delete c.data.activeFiltersByGroup[groupName][existingFilter];
        }
      }
    }
    
    // Add the filter with a marker indicating it's from a text input
    c.data.activeFiltersByGroup[groupName][actualFilter] = {
      label: label,
      _textInputTemplate: filterTemplate
    };
    
    // Broadcast the combined filter
    c.broadcastFilters();
  };
  
  // Remove text input filter
  c.removeTextInputFilter = function(filterTemplate, groupName) {
    groupName = groupName || 'default';
    
    if (!c.data.activeFiltersByGroup[groupName]) {
      return;
    }
    
    // Remove any filter generated from this template by checking the metadata marker
    for (var existingFilter in c.data.activeFiltersByGroup[groupName]) {
      if (c.data.activeFiltersByGroup[groupName].hasOwnProperty(existingFilter)) {
        var filterValue = c.data.activeFiltersByGroup[groupName][existingFilter];
        // Only check for the template marker to avoid false positives
        if (typeof filterValue === 'object' && filterValue._textInputTemplate === filterTemplate) {
          delete c.data.activeFiltersByGroup[groupName][existingFilter];
        }
      }
    }
    
    // Clean up empty groups
    if (Object.keys(c.data.activeFiltersByGroup[groupName]).length === 0) {
      delete c.data.activeFiltersByGroup[groupName];
    }
    
    // Broadcast the updated filter
    c.broadcastFilters();
  };
  
  // Broadcast combined filters to list widgets
  c.broadcastFilters = function() {
    // Build combined filter with group logic:
    // - Text-based filters: ALL use AND (^) - each text input is a separate AND condition
    // - Button filters within a group: use OR (^OR)
    // - Between button groups: use AND (^)
    var groupFilters = [];
    var textFilters = [];
    var firstLabel = '';
    
    for (var gName in c.data.activeFiltersByGroup) {
      if (c.data.activeFiltersByGroup.hasOwnProperty(gName)) {
        var buttonFiltersInGroup = [];
        for (var filterKey in c.data.activeFiltersByGroup[gName]) {
          if (c.data.activeFiltersByGroup[gName].hasOwnProperty(filterKey)) {
            var filterValue = c.data.activeFiltersByGroup[gName][filterKey];
            
            // Check if this is a text input filter (has _textInputTemplate marker)
            var isTextFilter = typeof filterValue === 'object' && filterValue._textInputTemplate;
            
            if (isTextFilter) {
              // Text filters are added to textFilters array (for AND logic)
              textFilters.push(filterKey);
            } else {
              // Button filters are added to buttonFiltersInGroup (for OR logic within group)
              buttonFiltersInGroup.push(filterKey);
            }
            
            if (!firstLabel && filterValue) {
              firstLabel = typeof filterValue === 'string' ? filterValue : filterValue.label;
            }
          }
        }
        
        // Process button filters with OR logic within the group
        if (buttonFiltersInGroup.length > 0) {
          if (buttonFiltersInGroup.length === 1) {
            // Single filter in group, no need for parentheses
            groupFilters.push(buttonFiltersInGroup[0]);
          } else {
            // Multiple filters in group, join with ^OR
            groupFilters.push(buttonFiltersInGroup.join('^OR'));
          }
        }
      }
    }
    
    // Combine all filters:
    // 1. Button filters (already combined within groups with OR, groups with AND)
    // 2. Text filters (each as separate AND condition)
    var allFilters = groupFilters.concat(textFilters);
    var combinedFilter = allFilters.join('^');
    
    // Parse the combined filter string to extract field and value
    var field = '';
    var value = '';
    
    // Try to parse simple field=value pattern from first filter
    // Check both button filters and text filters
    if (allFilters.length > 0) {
      var firstFilter = allFilters[0];
      // If first filter contains ^OR, extract just the first individual filter
      var firstIndividualFilter = firstFilter.split('^OR')[0];
      // Extract field and value from field=value pattern
      var simpleMatch = firstIndividualFilter.match(/^([^=<>!]+)=(.+)$/);
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
      label: firstLabel,
      activeFiltersByGroup: c.data.activeFiltersByGroup
    });
    
    // Also broadcast with a custom event name if specified in options
    if (c.options.broadcast_event) {
      $rootScope.$broadcast(c.options.broadcast_event, {
        field: field,
        value: value,
        filter: combinedFilter,
        label: firstLabel,
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
