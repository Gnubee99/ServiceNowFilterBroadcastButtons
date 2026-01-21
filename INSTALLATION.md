# Installation Guide for ServiceNow Filter Broadcast Buttons Widget

## Step-by-Step Installation

### 1. Create the Widget in ServiceNow

1. Log in to your ServiceNow instance
2. Navigate to **Service Portal > Service Portal Configuration > Widgets**
3. Click the **New** button
4. Fill in the following fields:

#### Basic Information
- **Widget ID**: `filter_broadcast_buttons` (use underscore for ServiceNow)
- **Widget Name**: `Filter Broadcast Buttons`
- **Description**: `Widget that broadcasts filters to list widgets on the same page`

#### Widget Code
- **HTML Template**: Copy and paste content from `filter-broadcast-buttons.html`
- **Client Script**: Copy and paste content from `filter-broadcast-buttons-client.js`
- **Server Script**: Copy and paste content from `filter-broadcast-buttons-server.js`
- **CSS - SCSS**: Copy and paste content from `filter-broadcast-buttons.css`

#### Widget Options
- Click on **Option Schema** (related list at the bottom)
- Use the content from `filter-broadcast-buttons-options.json` to create options:
  
  **Option 1:**
  - Name: `filters`
  - Label: `Filters`
  - Type: `String`
  - Default Value: `{"u_state=1": "Incomplete", "u_state=3": "In Progress", "u_state=4": "Complete"}`
  - Hint: `JSON object of filters and labels`
  
  **Option 2:**
  - Name: `title`
  - Label: `Title`
  - Type: `String`
  - Default Value: `Filter By:`
  
  **Option 3:**
  - Name: `show_clear_button`
  - Label: `Show Clear Button`
  - Type: `True/False`
  - Default Value: `true`
  
  **Option 4:**
  - Name: `broadcast_event`
  - Label: `Custom Broadcast Event`
  - Type: `String`
  - Default Value: *(leave empty)*

5. Click **Submit** to save the widget

### 2. Add Widget to a Page

1. Navigate to **Service Portal > Pages**
2. Select the page where you want to add the filter buttons
3. Click **Edit Page** in the page designer
4. Drag the **Filter Broadcast Buttons** widget onto your page
5. Configure the widget options:
   - Set the **Filters** option with your desired filters
   - Optionally set a **Title**
   - Configure other options as needed
6. Save the page

### 3. Configure List Widget to Receive Broadcasts

To make your list widgets respond to the broadcast filters, add this client script to your list widget:

```javascript
function($scope, $rootScope) {
  var c = this;
  
  // Store original filter
  var originalFilter = c.options.filter || '';
  
  // Listen for filter add event
  $rootScope.$on('sp.list.filter.add', function(event, data) {
    if (data && data.filter) {
      // Combine original filter with broadcast filter
      if (originalFilter) {
        c.data.filter = originalFilter + '^' + data.filter;
      } else {
        c.data.filter = data.filter;
      }
      // Refresh the list
      c.server.update();
    }
  });
  
  // Listen for filter clear event
  $rootScope.$on('sp.list.filter.clear', function(event, data) {
    // Reset to original filter
    c.data.filter = originalFilter;
    // Refresh the list
    c.server.update();
  });
}
```

### 4. Test the Widget

1. Navigate to the page where you added the widget
2. Click one of the filter buttons
3. Verify that the list widget updates with the filtered results
4. Click another filter button to change the filter
5. Click the "Clear Filter" button to remove the broadcast filter

## Verification Checklist

- [ ] Widget created in ServiceNow
- [ ] Widget appears on the page
- [ ] Filter buttons display correctly
- [ ] Clicking a button highlights it (shows active state)
- [ ] List widget filters when button is clicked
- [ ] Multiple filters work correctly
- [ ] Clear button removes the broadcast filter
- [ ] Original list filters remain intact

## Common Issues and Solutions

### Widget Not Appearing
- Check that the widget is properly saved
- Verify the widget ID matches what you're trying to add to the page
- Clear your browser cache

### Buttons Not Showing
- Verify the filters option contains valid JSON
- Check the browser console for errors
- Ensure the JSON is properly formatted

### Filters Not Working
- Verify the list widget has the client script to listen for broadcasts
- Check that field names in filters match your table fields
- Ensure the list widget is on the same page

### Styling Issues
- Verify the CSS was properly copied
- Check for conflicts with custom CSS on your portal
- Use browser developer tools to inspect the elements

## Next Steps

After installation, you can:
1. Customize the CSS to match your portal theme
2. Add additional filter options
3. Create multiple instances with different filter sets
4. Use custom broadcast events for specialized widgets

## Support

For technical support:
- Check ServiceNow documentation for Service Portal widgets
- Review the README.md for usage examples
- Consult your ServiceNow administrator
