# Usage Examples for Filter Broadcast Buttons Widget

This document provides practical examples of how to configure the Filter Broadcast Buttons widget for different use cases.

## Example 1: Task Status Filter

Filter tasks by their state.

### Widget Options
```json
{
  "filters": "{\"state=1\": \"New\", \"state=2\": \"In Progress\", \"state=3\": \"Closed\", \"state=7\": \"Closed Complete\"}",
  "title": "Filter by Task Status:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Displays 4 buttons: New, In Progress, Closed, Closed Complete
- Clicking a button filters the task list to show only tasks with that state
- Filters are added to existing list filters (e.g., if list shows "Assigned to me", filter adds to that)

---

## Example 2: Priority Filter

Filter records by priority level.

### Widget Options
```json
{
  "filters": "{\"priority=1\": \"Critical\", \"priority=2\": \"High\", \"priority=3\": \"Moderate\", \"priority=4\": \"Low\", \"priority=5\": \"Planning\"}",
  "title": "Filter by Priority:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Displays 5 priority filter buttons
- Only shows records matching the selected priority
- Works with incidents, tasks, or any table with a priority field

---

## Example 3: Assignment Group Filter

Filter by specific assignment groups.

### Widget Options
```json
{
  "filters": "{\"assignment_group.name=Network\": \"Network Team\", \"assignment_group.name=Database\": \"Database Team\", \"assignment_group.name=Hardware\": \"Hardware Team\"}",
  "title": "Filter by Team:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Displays 3 team filter buttons
- Filters by assignment group name
- Shows records assigned to the selected team

---

## Example 4: Date Range Filter

Filter by creation date ranges.

### Widget Options
```json
{
  "filters": "{\"sys_created_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)\": \"Today\", \"sys_created_onONLast 7 days@javascript:gs.daysAgoStart(7)@javascript:gs.daysAgoEnd(0)\": \"Last 7 Days\", \"sys_created_onONLast 30 days@javascript:gs.daysAgoStart(30)@javascript:gs.daysAgoEnd(0)\": \"Last 30 Days\"}",
  "title": "Created:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Displays 3 date range buttons
- Filters records by creation date
- Uses ServiceNow's date range operators

---

## Example 5: Active/Inactive Filter

Simple active status filter.

### Widget Options
```json
{
  "filters": "{\"active=true\": \"Active Only\", \"active=false\": \"Inactive Only\"}",
  "title": "Status:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Displays 2 buttons: Active Only, Inactive Only
- Filters records by active field
- Works with users, groups, or any table with an active field

---

## Example 6: Custom Field Filter with i18n

Using ServiceNow internationalization for labels.

### Widget Options
```json
{
  "filters": "{\"u_custom_state=1\": \"${Draft}\", \"u_custom_state=2\": \"${Submitted}\", \"u_custom_state=3\": \"${Approved}\", \"u_custom_state=4\": \"${Rejected}\"}",
  "title": "${Filter by Status}:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Button labels are translated based on user's language preference
- Uses ServiceNow's ${} syntax for internationalization
- Title is also internationalized

---

## Example 7: Multiple Value Filter (OR Condition)

Filter by multiple values using IN operator.

### Widget Options
```json
{
  "filters": "{\"stateIN1,2\": \"Open Items\", \"stateIN3,4,7\": \"Closed Items\", \"stateIN-5,6\": \"Cancelled Items\"}",
  "title": "Quick Filters:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Groups multiple state values together
- "Open Items" shows state 1 or 2
- Uses ServiceNow's IN operator for multiple values

---

## Example 8: Without Clear Button

Minimal configuration without clear button.

### Widget Options
```json
{
  "filters": "{\"category=inquiry\": \"Inquiry\", \"category=request\": \"Request\", \"category=issue\": \"Issue\"}",
  "title": "Category:",
  "show_clear_button": "false"
}
```

### Expected Behavior
- No clear button shown
- User must select one of the filter options
- Useful when you always want a filter applied

---

## Example 9: With Custom Broadcast Event

Using a custom event for specialized widgets.

### Widget Options
```json
{
  "filters": "{\"department=IT\": \"IT Department\", \"department=HR\": \"HR Department\", \"department=Finance\": \"Finance\"}",
  "title": "Department:",
  "show_clear_button": "true",
  "broadcast_event": "custom.department.filter"
}
```

### Custom List Widget Client Script
```javascript
function($scope, $rootScope) {
  var c = this;
  var originalFilter = c.options.filter || '';
  
  $rootScope.$on('custom.department.filter', function(event, data) {
    if (originalFilter) {
      c.data.filter = originalFilter + '^' + data.filter;
    } else {
      c.data.filter = data.filter;
    }
    c.server.update();
  });
  
  $rootScope.$on('custom.department.filter.clear', function(event, data) {
    c.data.filter = originalFilter;
    c.server.update();
  });
}
```

### Expected Behavior
- Broadcasts to custom event in addition to standard event
- Useful when you have custom widgets that need specific events

---

## Example 10: Complex Filter Expression

Advanced filtering with encoded queries.

### Widget Options
```json
{
  "filters": "{\"priority=1^state=2\": \"Critical & In Progress\", \"priority<=2^active=true\": \"High Priority Active\", \"assigned_to=javascript:gs.getUserID()^state!=3\": \"My Open Items\"}",
  "title": "Advanced Filters:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Each button applies a complex filter expression
- Uses ^ for AND conditions in the filter string
- Can include JavaScript expressions for dynamic values

---

## Page Layout Example

### HTML Structure
```html
<!-- Filter Broadcast Buttons Widget -->
<div class="col-sm-12">
  <widget id="filter-broadcast-buttons"></widget>
</div>

<!-- List Widget that receives broadcasts -->
<div class="col-sm-12">
  <widget id="widget-sc-cat-item-list" options='{"filter": "active=true", "original_filter": "active=true"}'></widget>
</div>
```

### Tips
1. Place the filter widget above the list widget for better UX
2. Set `original_filter` in list widget options to preserve base filters
3. Test with multiple list widgets on the same page
4. Consider using panels or cards for better visual organization

---

## Testing Your Configuration

1. **Verify JSON Syntax**: Use a JSON validator before entering in ServiceNow
2. **Test Each Filter**: Click each button individually to ensure correct filtering
3. **Check Multiple Filters**: Test switching between filters quickly
4. **Test Clear Button**: Verify it resets to original list state
5. **Test with Existing Filters**: Ensure broadcast filters add to, not replace, existing filters
6. **Check Browser Console**: Look for any JavaScript errors
7. **Test on Mobile**: Ensure buttons are responsive and work on mobile devices

---

## Example 11: Text Input Filters

Using `*text*` placeholder to allow user input for dynamic filtering.

### Widget Options
```json
{
  "filters": "{\"States\": {\"u_state=1\": \"Incomplete\", \"u_state=3\": \"In Progress\", \"u_state=4\": \"Complete\"}, \"Custom Search\": {\"u_name=*text*\": \"Name Contains\", \"u_description=*text*\": \"Description Contains\", \"sys_id=*text*\": \"By System ID\"}}",
  "title": "Filter Records:",
  "show_clear_button": "true"
}
```

### Expected Behavior
- Displays 3 buttons for state filters (Incomplete, In Progress, Complete)
- Displays 3 text input fields: Name Contains, Description Contains, By System ID
- When user types in "Name Contains" field, waits 1 second after they stop typing, then broadcasts filter like `u_name=John`
- Text inputs can be combined with button filters
- Example: Select "In Progress" button + type "Smith" in "Name Contains" → Broadcasts: `u_state=3^u_name=Smith`
- Empty text inputs are automatically ignored
- Text input filters are debounced to prevent excessive updates while typing

### Use Cases
- Search by name, email, or other text fields
- Filter by IDs or reference numbers
- Partial text matching with LIKE operator
- Dynamic user-driven filtering

---

## Troubleshooting Examples

### Problem: Filters not applying
**Solution**: Ensure list widget has client script to listen for broadcasts (see `example-list-widget-client.js`)

### Problem: Buttons not showing
**Solution**: Check JSON syntax in filters option - ensure proper escaping

### Problem: Filters replace existing filters
**Solution**: Verify list widget client script uses `^` to concatenate filters

### Problem: Clear button not working
**Solution**: Ensure list widget stores and restores `originalFilter`

---

## Best Practices

1. **Keep labels short**: Long button labels may wrap or look cluttered
2. **Limit button count**: 3-7 buttons is ideal, use dropdown for more options
3. **Use meaningful labels**: Make it clear what each filter does
4. **Test filter logic**: Verify filter strings work correctly in list view
5. **Consider mobile**: Test on mobile devices where space is limited
6. **Use consistent naming**: Follow ServiceNow field naming conventions
7. **Document custom filters**: Add comments explaining complex filter expressions
