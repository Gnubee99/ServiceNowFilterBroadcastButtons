# Quick Reference Guide

## Widget Files at a Glance

### Core Widget Files (Upload to ServiceNow)
1. **filter-broadcast-buttons.html** - HTML template
2. **filter-broadcast-buttons-client.js** - Client-side controller  
3. **filter-broadcast-buttons-server.js** - Server-side script
4. **filter-broadcast-buttons.css** - Styling
5. **filter-broadcast-buttons-options.json** - Widget options schema

### Documentation Files (Reference Only)
- **README.md** - Main documentation
- **INSTALLATION.md** - Step-by-step installation guide
- **EXAMPLES.md** - 10+ usage examples
- **ARCHITECTURE.md** - Technical architecture details
- **DEMO.md** - Demo page setup guide
- **example-list-widget-client.js** - Example receiver code

## Minimal Setup

### 1. Widget Options (Most Common)
```json
{
  "filters": "{\"state=1\": \"New\", \"state=2\": \"In Progress\", \"state=3\": \"Closed\"}",
  "title": "Filter By:",
  "show_clear_button": "true"
}
```

### 2. List Widget Client Script (Required)
```javascript
function($scope, $rootScope) {
  var c = this;
  var originalFilter = c.options.filter || '';
  
  $rootScope.$on('sp.list.filter.add', function(event, data) {
    if (data && data.filter) {
      c.data.filter = originalFilter ? originalFilter + '^' + data.filter : data.filter;
      c.server.update();
    }
  });
  
  $rootScope.$on('sp.list.filter.clear', function(event, data) {
    c.data.filter = originalFilter;
    c.server.update();
  });
}
```

## Filter Format

### Basic Filter
```json
{"field=value": "Button Label"}
```

### Multiple Filters
```json
{
  "state=1": "New",
  "state=2": "In Progress",
  "state=3": "Closed"
}
```

### Complex Filter
```json
{
  "priority=1^state=2": "Critical & In Progress",
  "assigned_to=javascript:gs.getUserID()": "My Items"
}
```

## Common Filter Examples

### Status Filters
```json
{"state=1": "New", "state=2": "WIP", "state=3": "Closed"}
```

### Priority Filters
```json
{"priority=1": "Critical", "priority=2": "High", "priority=3": "Medium", "priority=4": "Low"}
```

### Assignment Filters
```json
{"assigned_to=javascript:gs.getUserID()": "My Items", "assignment_group.name=IT": "IT Team"}
```

### Date Filters
```json
{"sys_created_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)": "Today"}
```

### Boolean Filters
```json
{"active=true": "Active", "active=false": "Inactive"}
```

## Events Reference

### Broadcast Events
- **sp.list.filter.add** - Apply filter
- **sp.list.filter.clear** - Clear filter
- **[custom_event]** - Custom event (if configured)
- **[custom_event].clear** - Custom clear event

### Event Payload (filter.add)
```javascript
{
  field: "state",
  value: "1",
  filter: "state=1",
  label: "New"
}
```

## CSS Classes

### Main Container
- `.filter-broadcast-buttons` - Widget container

### Buttons
- `.btn-primary` - Active filter button
- `.btn-default` - Inactive filter button
- `.btn-warning` - Clear button (when active)

## Troubleshooting

### Problem: Buttons not showing
- Check JSON syntax in filters option
- Verify filters option is a valid JSON string

### Problem: Filters not working
- Ensure list widget has client script
- Check field names match table schema
- Verify broadcast event listeners

### Problem: Filters replace instead of add
- Check client script uses `^` to concatenate
- Verify originalFilter is preserved

## ServiceNow Field Operators

| Operator | Syntax | Example |
|----------|--------|---------|
| Equals | `=` | `state=1` |
| Not equals | `!=` | `state!=3` |
| IN | `IN` | `stateIN1,2,3` |
| LIKE | `LIKE` | `nameLIKEtest` |
| Greater than | `>` | `priority>2` |
| Less than | `<` | `priority<3` |
| ON | `ON` | `sys_created_onONToday@javascript:gs.daysAgoStart(0)` |

## Best Practices

1. ✅ Keep button labels short (2-3 words max)
2. ✅ Limit to 3-7 buttons per widget
3. ✅ Use consistent naming conventions
4. ✅ Test filters in list view first
5. ✅ Document custom filters
6. ✅ Use clear button for better UX
7. ✅ Test on mobile devices
8. ✅ Validate JSON before deploying

## Common Mistakes

1. ❌ Forgetting quotes in JSON
2. ❌ Not adding client script to list widget
3. ❌ Using wrong field names
4. ❌ Not testing combined filters
5. ❌ Replacing instead of adding filters
6. ❌ Missing ^ between filter conditions
7. ❌ Not storing originalFilter

## Quick Commands

### Test Filter in ServiceNow
```javascript
// Navigate to list view
// Open Filter Navigator
// Enter filter: state=1
// Verify results
```

### Debug Events in Browser Console
```javascript
// Listen for broadcast events
angular.element(document.body).scope().$root.$on('sp.list.filter.add', function(e, data) {
  console.log('Filter broadcast:', data);
});
```

### Validate JSON
```javascript
// In browser console
try {
  JSON.parse('{"state=1": "New", "state=2": "WIP"}');
  console.log('Valid JSON');
} catch(e) {
  console.error('Invalid JSON:', e.message);
}
```

## Support Resources

- **README.md** - Full documentation
- **INSTALLATION.md** - Installation steps
- **EXAMPLES.md** - Real-world examples
- **ARCHITECTURE.md** - Technical details
- **DEMO.md** - Demo setup
- **ServiceNow Docs** - Service Portal documentation
- **Community** - ServiceNow developer community

## Version Information

- **Widget Version**: 1.0.0
- **ServiceNow Compatibility**: Kingston+
- **Angular Version**: AngularJS 1.x (included in ServiceNow)
- **Dependencies**: None (uses ServiceNow Service Portal framework)

## File Checklist

Before deploying, ensure you have:
- [ ] All 5 core widget files ready
- [ ] Widget options configured
- [ ] List widget client script added
- [ ] Filter JSON validated
- [ ] Tested on dev instance
- [ ] Documented custom configurations
- [ ] Backup of existing widgets
- [ ] User training materials prepared
