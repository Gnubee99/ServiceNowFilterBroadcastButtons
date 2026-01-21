# ServiceNow Filter Broadcast Buttons Widget

A ServiceNow Service Portal widget that broadcasts filters to list widgets on the same page. This widget creates a set of buttons that, when clicked, apply filters to list widgets without replacing existing table filters.

## Features

- **Dynamic Filter Buttons**: Create multiple filter buttons from a JSON configuration
- **Broadcast Filtering**: Filters are broadcast to list widgets using Angular's event system
- **Additive Filtering**: Filters add onto existing table filters rather than replacing them
- **Multi-Select with OR Logic**: Select multiple filter buttons to create OR-combined queries
- **Toggle Functionality**: Click an active filter button to deselect it
- **Active State Indication**: Visual feedback showing which filters are currently active
- **Clear Filter Option**: Optional button to clear all active filters
- **Customizable**: Configure button labels, filters, title, and custom broadcast events

## Installation

1. In ServiceNow, navigate to **Service Portal > Widgets**
2. Click **New** to create a new widget
3. Set the following properties:
   - **Widget ID**: `filter-broadcast-buttons`
   - **Widget Name**: `Filter Broadcast Buttons`
   - **HTML Template**: Copy content from `filter-broadcast-buttons.html`
   - **Client Script**: Copy content from `filter-broadcast-buttons-client.js`
   - **Server Script**: Copy content from `filter-broadcast-buttons-server.js`
   - **CSS**: Copy content from `filter-broadcast-buttons.css`
   - **Option Schema**: Copy content from `filter-broadcast-buttons-options.json`

## Usage

### Adding the Widget to a Page

1. Navigate to **Service Portal > Pages** and select your page
2. Add the widget to your page using the page designer
3. Configure the widget options (see below)

### Widget Options

#### Filters (Required)
A JSON object defining the filters and their labels. Each key is a filter query (e.g., `field=value`) and each value is the button label.

**Format**: `{"field=value": "Label", "field=value": "Label", ...}`

**Example**:
```json
{
  "u_state=1": "Incomplete",
  "u_state=3": "In Progress", 
  "u_state=4": "Complete"
}
```

**Example with ServiceNow i18n**:
```json
{
  "u_state=1": "${Incomplete}",
  "u_state=3": "${In Progress}",
  "u_state=4": "${Complete}"
}
```

#### Title (Optional)
Text to display above the filter buttons.

**Default**: `"Filter By:"`

#### Show Clear Button (Optional)
Whether to display a "Clear Filter" button.

**Default**: `true`

#### Custom Broadcast Event (Optional)
Custom event name to broadcast in addition to the standard `sp.list.filter.add` event. Useful if you have custom widgets that need to listen to filter events.

**Example**: `"custom.filter.event"`

## How It Works

### Multi-Select and Toggle Behavior

The widget now supports selecting multiple filter buttons simultaneously:
- **Click to Select**: Click any filter button to activate it
- **Click to Deselect**: Click an active filter button again to deselect it
- **Multiple Selection**: Multiple buttons can be active at the same time
- **Visual Feedback**: Active buttons are highlighted in blue, inactive buttons are white

### Broadcasting Filters with OR Logic

When filter buttons are selected:
1. The widget tracks all active filters in an `activeFilters` object
2. Builds a combined filter query by joining active filters with `^OR` operator
3. Broadcasts the combined filter using Angular's `$rootScope.$broadcast()` with event name `sp.list.filter.add`
4. The broadcast includes:
   - `field`: The field name (from first filter)
   - `value`: The field value (from first filter)
   - `filter`: The complete combined filter string (e.g., `"u_state=1^ORu_state=3^ORpriority=1"`)
   - `label`: The button label
   - `activeFilters`: Object containing all active filter/label pairs

### Filter Examples

**Single Filter:**
- Select "Incomplete" → Broadcasts: `u_state=1`

**Multiple Filters (OR Logic):**
- Select "Incomplete" + "In Progress" → Broadcasts: `u_state=1^ORu_state=3`
- Select "Incomplete" + "In Progress" + "High Priority" → Broadcasts: `u_state=1^ORu_state=3^ORpriority=1`

**Toggle Off:**
- Click "Incomplete" again → Removes it from active filters
- Remaining filters are broadcast

**Clear All:**
- Click "Clear Filter" → All filters are deselected and a clear event is broadcast

### Integration with List Widgets

ServiceNow list widgets can be configured to listen for the `sp.list.filter.add` event. The broadcast filter is **added** to any existing filters on the list, not replacing them.

To make a list widget respond to these broadcasts, you may need to:
1. Add a client-side script to the list widget that listens for the broadcast event
2. Apply the filter to the list when the event is received

### Example List Widget Client Script

```javascript
function($scope, $rootScope) {
  var c = this;
  
  // Listen for filter broadcast
  $rootScope.$on('sp.list.filter.add', function(event, data) {
    // Add the filter to the existing list query
    if (c.data.filter) {
      c.data.filter += '^' + data.filter;
    } else {
      c.data.filter = data.filter;
    }
    c.server.update();
  });
  
  // Listen for clear filter broadcast
  $rootScope.$on('sp.list.filter.clear', function(event, data) {
    // Remove all broadcast filters, keeping original filters
    c.data.filter = c.options.original_filter || '';
    c.server.update();
  });
}
```

## Example Configuration

### Simple Status Filter
```json
{
  "state=1": "New",
  "state=2": "In Progress",
  "state=3": "Closed"
}
```

### Custom Field Filter
```json
{
  "priority=1": "Critical",
  "priority=2": "High",
  "priority=3": "Medium",
  "priority=4": "Low"
}
```

### Multiple Field Values
```json
{
  "active=true": "Active Only",
  "active=false": "Inactive Only",
  "sys_created_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)": "Created Today"
}
```

## Styling

The widget includes default CSS styling that can be customized:
- `.filter-broadcast-buttons`: Main container
- `.btn-primary`: Active filter button
- `.btn-default`: Inactive filter button
- `.btn-warning`: Clear filter button

## Troubleshooting

### Filters Not Working
1. Ensure list widgets on the page are configured to listen for broadcast events
2. Check browser console for JavaScript errors
3. Verify the JSON format of the filters option

### Invalid JSON Error
If you see "Invalid JSON in filters option" in ServiceNow logs:
- Validate your JSON syntax using a JSON validator
- Ensure all strings are properly quoted
- Check for trailing commas

### Filters Replacing Existing Filters
If broadcast filters are replacing existing list filters instead of adding to them:
- Verify the list widget's client script is properly concatenating filters
- Ensure you're using `^` to join multiple filter conditions

## License

This widget is provided as-is for use in ServiceNow Service Portal implementations.

## Support

For issues or questions, please refer to the ServiceNow community or your ServiceNow administrator.