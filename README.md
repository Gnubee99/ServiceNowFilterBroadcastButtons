# ServiceNow Filter Broadcast Buttons Widget

A ServiceNow Service Portal widget that broadcasts filters to list widgets on the same page. This widget creates a set of buttons that, when clicked, apply filters to list widgets without replacing existing table filters.

## Features

- **Dynamic Filter Buttons**: Create multiple filter buttons from a JSON configuration
- **Text Input Filters**: Use `*text*` placeholder in filter values to create text input fields for custom user input
- **Broadcast Filtering**: Filters are broadcast to list widgets using Angular's event system
- **Additive Filtering**: Filters add onto existing table filters rather than replacing them
- **Multi-Select with OR Logic**: Select multiple filter buttons within a group to create OR-combined queries
- **Text Search with AND Logic**: All text-based searches use AND conditions for precise filtering
- **Toggle Functionality**: Click an active filter button to deselect it
- **Active State Indication**: Visual feedback showing which filters are currently active
- **Clear Filter Option**: Optional button to clear all active filters
- **Customizable**: Configure button labels, filters, title, and custom broadcast events
- **Debounced Text Input**: Text input filters wait 1 second after user stops typing before broadcasting

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
A JSON object defining the filters and their labels. Supports both flat and grouped structures.

**Flat Format** (filters use OR logic):
```json
{
  "field=value": "Label",
  "field=value": "Label",
  ...
}
```

**Grouped Format** (filters within groups use OR, between groups use AND):
```json
{
  "Group Name": {
    "field=value": "Label",
    "field=value": "Label"
  },
  "Another Group": {
    "field=value": "Label"
  }
}
```

**Flat Example**:
```json
{
  "u_state=1": "Incomplete",
  "u_state=3": "In Progress", 
  "u_state=4": "Complete"
}
```

**Grouped Example** (recommended to prevent filter conflicts):
```json
{
  "States": {
    "u_state=1": "Ordering Incomplete",
    "u_state=3": "In Progress",
    "u_state=4": "Completed"
  },
  "Employment Types": {
    "u_reg_temp=11": "Regular Employee",
    "u_reg_temp=1": "Contract Worker"
  }
}
```

**Example with ServiceNow i18n**:
```json
{
  "${States}": {
    "u_state=1": "${Ordering Incomplete}",
    "u_state=3": "${In Progress}",
    "u_state=4": "${Completed}"
  },
  "${Employment Types}": {
    "u_reg_temp=11": "${Regular Employee}",
    "u_reg_temp=1": "${Contract Worker}"
  }
}
```

**Example with Text Input Filters**:
```json
{
  "States": {
    "u_state=1": "Incomplete",
    "u_state=3": "In Progress",
    "u_state=4": "Complete"
  },
  "Custom Search": {
    "u_name=*text*": "Name Contains",
    "u_description=*text*": "Description Contains"
  }
}
```

When a filter value contains `*text*`, it will render as a text input field instead of a button. The `*text*` placeholder will be replaced with the user's input when broadcasting the filter. Text inputs are debounced with a 1-second delay after the user stops typing.

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

The widget supports selecting multiple filter buttons simultaneously:
- **Click to Select**: Click any filter button to activate it
- **Click to Deselect**: Click an active filter button again to deselect it
- **Multiple Selection**: Multiple buttons can be active at the same time
- **Visual Feedback**: Active buttons are highlighted in blue, inactive buttons are white

### Text Input Filters

Filters can include text input fields for dynamic user input:
- **Placeholder Pattern**: Use `*text*` in the filter value (e.g., `"u_name=*text*"`)
- **Automatic Detection**: The widget automatically detects `*text*` and renders a text input field instead of a button
- **Automatic Grouping**: Text input filters are automatically placed in a "Text Search" section
- **AND Logic**: ALL text-based searches are combined with AND conditions (unlike button filters which use OR within groups)
- **Dynamic Substitution**: When the user types, `*text*` is replaced with their input (e.g., `u_name=*text*` becomes `u_name=John`)
- **Debouncing**: The filter is broadcast 1 second after the user stops typing, preventing excessive updates
- **Clear on Empty**: If the user clears the text input, the filter is automatically removed

**Example Use Cases**:
- Search by name: `"u_name=*text*"` → User types "John" → Broadcasts `u_name=John`
- Filter by ID: `"sys_id=*text*"` → User types "abc123" → Broadcasts `sys_id=abc123`
- Contains search: `"descriptionLIKE*text*"` → User types "urgent" → Broadcasts `descriptionLIKEurgent`

### Grouped vs Flat Filter Structure

**Grouped Structure (Recommended)**:
- Filters are organized into logical groups
- Button filters within each group: use OR logic
- Between button groups: use AND logic
- Text input filters: automatically grouped in "Text Search" section and use AND logic
- Prevents conflicts between different filter types
- Each group is displayed with a section header

**Flat Structure (Backward Compatible)**:
- All filters are at the same level
- All selected filters use OR logic

### Broadcasting Filters with AND/OR Logic

**Button Filters (Grouped Structure):**
When filter buttons are selected from grouped structure:
1. Widget tracks active filters by group
2. Combines button filters within each group using `^OR`
3. Combines groups using `^` (AND)
4. Broadcasts the combined filter

Example: Selecting "Incomplete" + "In Progress" from States group and "Regular Employee" from Employment Types group broadcasts: `u_state=1^ORu_state=3^u_reg_temp=11`

This means: Show records where `(state is Incomplete OR In Progress) AND (employment type is Regular Employee)`

**Text Input Filters:**
Text-based searches always use AND logic:
1. All text inputs are automatically placed in a "Text Search" section
2. Each text input creates a separate AND condition
3. Text filters are combined with button filters using `^` (AND)

Example: Selecting "Incomplete" from States and entering "John" in Name and "urgent" in Description broadcasts: `u_state=1^u_name=John^u_description=urgent`

This means: Show records where `(state is Incomplete) AND (name contains John) AND (description contains urgent)`

**Combined Example:**
Selecting "Incomplete" + "In Progress" from States, "Regular" from Types, and entering "John" in Name broadcasts: `u_state=1^ORu_state=3^u_type=regular^u_name=John`

This means: Show records where `(state is Incomplete OR In Progress) AND (type is Regular) AND (name contains John)`

**Flat Filters:**
All selected button filters are combined with `^OR` operator. If text inputs are present, they are separated into the "Text Search" section automatically.

The broadcast includes:
- `field`: The field name (from first filter)
- `value`: The field value (from first filter)
- `filter`: The complete combined filter string
- `label`: The button label
- `activeFiltersByGroup`: Object containing active filters organized by group

### Filter Examples

**Button Filters (Grouped):**
- Select "Incomplete" from States → Broadcasts: `u_state=1`
- Select "Incomplete" + "In Progress" from States → Broadcasts: `u_state=1^ORu_state=3`
- Select "Incomplete" + "In Progress" from States AND "Regular Employee" from Employment Types → Broadcasts: `u_state=1^ORu_state=3^u_reg_temp=11`

**Text Input Filters:**
- Enter "John" in Name → Broadcasts: `u_name=John`
- Enter "John" in Name + "smith@" in Email → Broadcasts: `u_name=John^u_email=smith@`
- Enter "John" in Name + "555" in Phone + "urgent" in Description → Broadcasts: `u_name=John^u_phone=555^u_description=urgent`

**Combined Button + Text Filters:**
- Select "Incomplete" from States + Enter "John" in Name → Broadcasts: `u_state=1^u_name=John`
- Select "Incomplete" + "In Progress" from States + Enter "John" in Name → Broadcasts: `u_state=1^ORu_state=3^u_name=John`
- Select "Incomplete" + "In Progress" from States + "Regular" from Types + Enter "John" in Name → Broadcasts: `u_state=1^ORu_state=3^u_type=regular^u_name=John`

**Flat Filters:**
- Select "Incomplete" → Broadcasts: `u_state=1`
- Select "Incomplete" + "In Progress" → Broadcasts: `u_state=1^ORu_state=3`
- Select "Incomplete" + "High Priority" → Broadcasts: `u_state=1^ORpriority=1`

**Toggle Off:**
- Click an active filter again → Removes it from active filters
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