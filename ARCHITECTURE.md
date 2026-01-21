# ServiceNow Filter Broadcast Buttons - Technical Architecture

## Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│           Filter Broadcast Buttons Widget                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ HTML Template (filter-broadcast-buttons.html)          │ │
│  │  - Renders filter buttons from JSON config             │ │
│  │  - Shows active state with ng-class                    │ │
│  │  - Supports multi-select with visual feedback          │ │
│  │  - Optional clear button                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Client Script (filter-broadcast-buttons-client.js)     │ │
│  │  - Handles button click events                         │ │
│  │  - Implements toggle logic (click to deselect)         │ │
│  │  - Manages multiple active filters in object           │ │
│  │  - Combines filters with OR logic (^OR operator)       │ │
│  │  - Broadcasts filters using $rootScope.$broadcast()    │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Server Script (filter-broadcast-buttons-server.js)     │ │
│  │  - Parses JSON options                                 │ │
│  │  - Prepares data for client                            │ │
│  │  - Handles initialization                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Angular $broadcast
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Event Broadcasting                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Event: 'sp.list.filter.add'                                │
│  Payload: {                                                  │
│    field: "u_state",                                         │
│    value: "1",                                               │
│    filter: "u_state=1^ORu_state=3^ORpriority=1",           │
│    label: "Incomplete",                                      │
│    activeFilters: {                                          │
│      "u_state=1": "Incomplete",                             │
│      "u_state=3": "In Progress",                            │
│      "priority=1": "High Priority"                          │
│    }                                                         │
│  }                                                           │
│                                                               │
│  Event: 'sp.list.filter.clear' (when clear clicked)         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ $rootScope.$on()
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  List Widget (Receiver)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Listens for: 'sp.list.filter.add'                          │
│                                                               │
│  Action: Combines broadcast filter with existing filter      │
│    Original Filter: "active=true"                            │
│    Broadcast Filter: "u_state=1^ORu_state=3^ORpriority=1"  │
│    Combined: "active=true^u_state=1^ORu_state=3^OR..."      │
│                                                               │
│  Calls: c.server.update() to refresh list                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **User Action**: User clicks a filter button
2. **Toggle Check**: Client checks if filter is already active
3. **Update State**: Add or remove filter from activeFilters object
4. **Combine Filters**: Join all active filter keys with `^OR` operator
5. **Broadcast Event**: Broadcasts combined filter data to all listeners
6. **List Receives**: List widget receives broadcast event
7. **Combine Filters**: List adds broadcast filter to existing filters using `^`
8. **Update List**: List refreshes with combined filter

## Filter Combination Logic

### Multi-Select with OR Logic

```javascript
// User selects multiple buttons
activeFilters = {
  "u_state=1": "Incomplete",
  "u_state=3": "In Progress",
  "priority=1": "High Priority"
}

// Filters are combined with OR operator
broadcastFilter = "u_state=1^ORu_state=3^ORpriority=1"

// This means: Show records where
//   (u_state=1) OR (u_state=3) OR (priority=1)
```

### Integration with Existing Filters

```javascript
// Original list filter (hardcoded or from options)
originalFilter = "active=true^assigned_to=javascript:gs.getUserID()"

// User selects "Incomplete" and "In Progress"
broadcastFilter = "u_state=1^ORu_state=3"

// Combined filter (additive, not replacement)
finalFilter = "active=true^assigned_to=javascript:gs.getUserID()^u_state=1^ORu_state=3"

// This means: Show records where
//   (active=true) AND (assigned_to=currentUser) AND ((u_state=1) OR (u_state=3))
```

## Widget Options Schema

```json
{
  "filters": {
    "u_state=1": "Incomplete",
    "u_state=3": "In Progress",
    "u_state=4": "Complete"
  },
  "title": "Filter By:",
  "show_clear_button": true,
  "broadcast_event": "custom.filter.event"
}
```

## Key Design Decisions

### 1. Multi-Select with OR Logic
- Multiple filters can be active simultaneously
- Active filters are combined using `^OR` operator
- Provides flexible filtering: show records matching ANY selected filter
- Toggle behavior: clicking active filter deselects it

### 2. Additive Filtering
- Broadcast filters **ADD** to existing filters, not replace
- Uses `^` (AND operator) to combine with original filters
- OR filters are grouped together within the overall AND logic
- Preserves original list configuration

### 3. Event-Based Communication
- Uses Angular's `$rootScope.$broadcast()`
- Standard event: `sp.list.filter.add`
- Optional custom events for specialized widgets
- Broadcast includes activeFilters object for consumer flexibility

### 4. State Management
- Tracks all active filters in an object
- Clear button resets all filters
- No persistent state between page loads
- Visual feedback for active/inactive states

### 5. Flexible Configuration
- JSON-based filter definition
- Supports any ServiceNow field and operator
- Dynamic button generation
- Toggle functionality enabled by default

## File Structure

```
filter-broadcast-buttons/
├── filter-broadcast-buttons.html          # HTML template
├── filter-broadcast-buttons-client.js     # Client-side controller
├── filter-broadcast-buttons-server.js     # Server-side script
├── filter-broadcast-buttons.css           # Styling
├── filter-broadcast-buttons-options.json  # Widget options schema
├── example-list-widget-client.js          # Example receiver
├── README.md                               # Main documentation
├── INSTALLATION.md                         # Installation guide
└── EXAMPLES.md                             # Usage examples
```

## Integration Points

### For Widget Developers
1. Copy widget files into ServiceNow
2. Configure widget options
3. Place on page with list widgets

### For List Widget Integration
1. Add client script to list widget
2. Listen for `sp.list.filter.add` event
3. Combine filters and refresh

## Testing Strategy

1. **Unit Testing**: Test filter parsing logic
2. **Integration Testing**: Test with list widgets
3. **UI Testing**: Verify button states and interactions
4. **Edge Cases**: 
   - Empty filter configuration
   - Invalid JSON
   - Multiple filters applied rapidly
   - Clear button with no active filter

## Performance Considerations

- **Minimal DOM Updates**: Angular tracks active filter efficiently
- **Event Broadcasting**: Low overhead, standard Angular pattern
- **No Polling**: Event-driven, not time-based
- **Lazy Evaluation**: Filters only applied on click

## Browser Compatibility

- Works with all ServiceNow supported browsers
- Requires Angular (included in ServiceNow Service Portal)
- No external dependencies

## Security Considerations

- Filter values are not sanitized by widget (handled by ServiceNow)
- No SQL injection risk (ServiceNow handles query encoding)
- No XSS risk (Angular escapes output)
- Respects ServiceNow ACLs and security rules
