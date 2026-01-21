# Demo Page Configuration

This document describes how to set up a demo page to test the Filter Broadcast Buttons widget.

## Page Structure

### Option 1: Simple Demo with Task List

```xml
<!-- Container with 12-column grid -->
<div class="container-fluid">
  
  <!-- Filter Buttons Widget -->
  <div class="row">
    <div class="col-md-12">
      <sp-widget widget="c.filterWidget"></sp-widget>
    </div>
  </div>
  
  <!-- Task List Widget -->
  <div class="row">
    <div class="col-md-12">
      <sp-widget widget="c.taskListWidget"></sp-widget>
    </div>
  </div>
  
</div>
```

### Server Script for Demo Page

```javascript
(function() {
  // Configure Filter Broadcast Buttons widget
  data.filterWidget = {
    widget: 'filter_broadcast_buttons',
    options: {
      filters: JSON.stringify({
        "state=1": "New",
        "state=2": "In Progress",
        "state=3": "Closed",
        "state=7": "Closed Complete"
      }),
      title: "Filter Tasks by State:",
      show_clear_button: true
    }
  };
  
  // Configure Task List widget
  data.taskListWidget = {
    widget: 'widget-task-list',  // Use your list widget ID
    options: {
      filter: 'active=true',  // Base filter
      table: 'task',
      display_field: 'number',
      fields: 'number,short_description,state,priority,assigned_to',
      limit: 20
    }
  };
})();
```

## Option 2: Multi-Widget Demo

### Page Layout

```
┌────────────────────────────────────────────────────────┐
│                   Page Header                           │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Filter by State:                                 │ │
│  │  [New] [In Progress] [Closed] [Clear]            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Filter by Priority:                              │ │
│  │  [Critical] [High] [Medium] [Low] [Clear]        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
├────────────────────────────────────────────────────────┤
│                   Task List                             │
│  ─────────────────────────────────────────────        │
│  Task Number  | Description      | State | Priority   │
│  TASK0001     | Fix bug          | Open  | High       │
│  TASK0002     | New feature      | WIP   | Medium     │
│  ...                                                    │
└────────────────────────────────────────────────────────┘
```

### HTML Template

```html
<div class="container-fluid">
  
  <!-- Page Header -->
  <div class="row">
    <div class="col-md-12">
      <h1>Task Management Dashboard</h1>
      <p>Use the filters below to narrow down the task list</p>
    </div>
  </div>
  
  <!-- State Filter -->
  <div class="row">
    <div class="col-md-12">
      <sp-widget widget="c.stateFilter"></sp-widget>
    </div>
  </div>
  
  <!-- Priority Filter -->
  <div class="row">
    <div class="col-md-12">
      <sp-widget widget="c.priorityFilter"></sp-widget>
    </div>
  </div>
  
  <!-- Task List -->
  <div class="row">
    <div class="col-md-12">
      <sp-widget widget="c.taskList"></sp-widget>
    </div>
  </div>
  
</div>
```

### Server Script

```javascript
(function() {
  // State filter widget
  data.stateFilter = {
    widget: 'filter_broadcast_buttons',
    options: {
      filters: JSON.stringify({
        "state=1": "New",
        "state=2": "In Progress",
        "state=3": "Closed",
        "state=7": "Closed Complete"
      }),
      title: "Filter by State:",
      show_clear_button: true,
      broadcast_event: 'task.state.filter'
    }
  };
  
  // Priority filter widget
  data.priorityFilter = {
    widget: 'filter_broadcast_buttons',
    options: {
      filters: JSON.stringify({
        "priority=1": "Critical",
        "priority=2": "High",
        "priority=3": "Moderate",
        "priority=4": "Low"
      }),
      title: "Filter by Priority:",
      show_clear_button: true,
      broadcast_event: 'task.priority.filter'
    }
  };
  
  // Task list widget
  data.taskList = {
    widget: 'widget-task-list',
    options: {
      filter: 'active=true',
      table: 'task',
      fields: 'number,short_description,state,priority,assigned_to'
    }
  };
})();
```

## Option 3: Incident Management Demo

### Configuration

```javascript
(function() {
  // Incident filter widget
  data.incidentFilter = {
    widget: 'filter_broadcast_buttons',
    options: {
      filters: JSON.stringify({
        "priority=1": "P1 - Critical",
        "priority=2": "P2 - High",
        "priority=3": "P3 - Moderate",
        "priority=4": "P4 - Low",
        "state=1": "New",
        "state=2": "In Progress",
        "state=6": "Resolved",
        "assigned_to=javascript:gs.getUserID()": "My Incidents"
      }),
      title: "Quick Filters:",
      show_clear_button: true
    }
  };
  
  // Incident list
  data.incidentList = {
    widget: 'widget-incident-list',
    options: {
      filter: 'active=true',
      table: 'incident',
      fields: 'number,short_description,priority,state,assigned_to,sys_updated_on'
    }
  };
})();
```

## Testing Checklist

### Basic Functionality
- [ ] Widget appears on page
- [ ] All buttons render correctly
- [ ] Title displays (if configured)
- [ ] Clear button shows (if enabled)

### Filter Application
- [ ] Clicking a button applies the filter
- [ ] List widget updates with filtered results
- [ ] Active button is highlighted
- [ ] Multiple filter buttons can be clicked sequentially

### Filter Combination
- [ ] Broadcast filter adds to existing list filter
- [ ] Original list filter remains intact
- [ ] Combined filter produces expected results
- [ ] Filter string is properly formatted

### Clear Filter
- [ ] Clear button removes broadcast filter
- [ ] Original list filter is restored
- [ ] List refreshes correctly
- [ ] Button highlighting is removed

### Multiple Widgets
- [ ] Multiple filter widgets can coexist on same page
- [ ] Each widget operates independently
- [ ] Filters from different widgets don't interfere
- [ ] Custom broadcast events work correctly

### Edge Cases
- [ ] Empty filter configuration (no buttons)
- [ ] Invalid JSON in options (error handling)
- [ ] Rapid clicking of multiple buttons
- [ ] Page refresh preserves list state
- [ ] Browser back button works correctly

### Visual/UX
- [ ] Buttons are properly styled
- [ ] Hover effects work
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation)
- [ ] Clear visual feedback for active state

## Demo Data Setup

### Sample Tasks

```javascript
// Create sample tasks for testing
var task1 = new GlideRecord('task');
task1.initialize();
task1.short_description = 'Test task 1 - New';
task1.state = 1;
task1.priority = 2;
task1.active = true;
task1.insert();

var task2 = new GlideRecord('task');
task2.initialize();
task2.short_description = 'Test task 2 - In Progress';
task2.state = 2;
task2.priority = 1;
task2.active = true;
task2.insert();

var task3 = new GlideRecord('task');
task3.initialize();
task3.short_description = 'Test task 3 - Closed';
task3.state = 3;
task3.priority = 3;
task3.active = false;
task3.insert();
```

## Troubleshooting Demo Page

### Widget Not Showing
1. Check widget is properly registered in ServiceNow
2. Verify widget ID matches in page configuration
3. Clear browser cache
4. Check browser console for errors

### Filters Not Working
1. Verify list widget has client script (see `example-list-widget-client.js`)
2. Check browser console for broadcast events
3. Verify filter field names match table fields
4. Test filters manually in list view

### Styling Issues
1. Check CSS is properly loaded
2. Inspect elements with browser dev tools
3. Verify no CSS conflicts with portal theme
4. Test in different browsers

## Performance Testing

Test with various data sizes:
- Small list (10-50 records)
- Medium list (100-500 records)
- Large list (1000+ records)

Monitor:
- Page load time
- Filter application speed
- Browser memory usage
- Network requests

## Next Steps

After successful demo:
1. Deploy to production portal
2. Gather user feedback
3. Monitor usage patterns
4. Optimize based on real-world usage
5. Consider additional features (saved filters, filter presets, etc.)
