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
│  │  - Renders text input fields for *text* filters        │ │
│  │  - Shows active state with ng-class                    │ │
│  │  - Supports multi-select with visual feedback          │ │
│  │  - Optional clear button                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Client Script (filter-broadcast-buttons-client.js)     │ │
│  │  - Handles button click events                         │ │
│  │  - Handles text input changes with debouncing          │ │
│  │  - Implements toggle logic (click to deselect)         │ │
│  │  - Replaces *text* with actual user input              │ │
│  │  - Manages multiple active filters in object           │ │
│  │  - Combines filters with OR logic (^OR operator)       │ │
│  │  - Broadcasts filters using $rootScope.$broadcast()    │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Server Script (filter-broadcast-buttons-server.js)     │ │
│  │  - Parses JSON options                                 │ │
│  │  - Detects *text* patterns in filters                  │ │
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

### Button Filter Flow
1. **User Action**: User clicks a filter button
2. **Toggle Check**: Client checks if filter is already active in its group
3. **Update State**: Add or remove filter from activeFiltersByGroup[groupName]
4. **Combine Filters**: 
   - Within each group: Join filters with `^OR` operator
   - Between groups: Join with `^` operator (AND)
5. **Broadcast Event**: Broadcasts combined filter data to all listeners
6. **List Receives**: List widget receives broadcast event
7. **Combine Filters**: List adds broadcast filter to existing filters using `^`
8. **Update List**: List refreshes with combined filter

### Text Input Filter Flow
1. **User Action**: User types in a text input field
2. **Debounce**: Cancel previous timeout and start new 1-second timer
3. **Timeout Complete**: After 1 second of inactivity, process input
4. **Replace Placeholder**: Replace `*text*` in filter template with user's input
5. **Update State**: Add/update filter in activeFiltersByGroup[groupName] with marker
6. **Combine Filters**: Same as button filters - join with OR/AND logic
7. **Broadcast Event**: Broadcasts combined filter with substituted text value
8. **Empty Input**: If text is cleared, remove the filter and broadcast update

## Filter Combination Logic

### Button Filters

**Within Groups (OR Logic):**
```javascript
// User selects multiple buttons from "States" group
activeFiltersByGroup = {
  "States": {
    "u_state=1": "Ordering Incomplete",
    "u_state=3": "In Progress"
  }
}

// Button filters within group are combined with OR
groupFilter = "u_state=1^ORu_state=3"
```

**Between Groups (AND Logic):**
```javascript
// User selects from multiple button groups
activeFiltersByGroup = {
  "States": {
    "u_state=1": "Ordering Incomplete",
    "u_state=3": "In Progress"
  },
  "Employment Types": {
    "u_reg_temp=11": "Regular Employee"
  }
}

// Button groups are combined with AND
broadcastFilter = "u_state=1^ORu_state=3^u_reg_temp=11"

// This means: Show records where
//   ((u_state=1) OR (u_state=3)) AND (u_reg_temp=11)
// i.e., (Ordering Incomplete OR In Progress) AND Regular Employee
```

### Text Input Filters (AND Logic)

**All Text Inputs Use AND:**
```javascript
// User enters values in text input fields
activeFiltersByGroup = {
  "Text Search": {
    "u_name=John": { label: "Name Contains", _textInputTemplate: "u_name=*text*" },
    "u_email=john@": { label: "Email Contains", _textInputTemplate: "u_email=*text*" }
  }
}

// Text filters are ALWAYS combined with AND (not OR)
broadcastFilter = "u_name=John^u_email=john@"

// This means: Show records where
//   (u_name contains John) AND (u_email contains john@)
```

**Combined Button + Text Filters:**
```javascript
// User selects buttons and enters text
activeFiltersByGroup = {
  "States": {
    "u_state=1": "Ordering Incomplete",
    "u_state=3": "In Progress"
  },
  "Text Search": {
    "u_name=John": { label: "Name Contains", _textInputTemplate: "u_name=*text*" }
  }
}

// Button filters use OR within groups, text filters use AND
broadcastFilter = "u_state=1^ORu_state=3^u_name=John"

// This means: Show records where
//   ((u_state=1) OR (u_state=3)) AND (u_name contains John)
// i.e., (Ordering Incomplete OR In Progress) AND Name contains John
```

### Flat Filters (Backward Compatible)

```javascript
// User selects multiple buttons (flat structure)
activeFiltersByGroup = {
  "default": {
    "u_state=1": "Incomplete",
    "u_state=3": "In Progress",
    "priority=1": "High Priority"
  }
}

// All filters are combined with OR
broadcastFilter = "u_state=1^ORu_state=3^ORpriority=1"

// This means: Show records where
//   (u_state=1) OR (u_state=3) OR (priority=1)
```

### Integration with Existing Filters

```javascript
// Original list filter (hardcoded or from options)
originalFilter = "active=true^assigned_to=javascript:gs.getUserID()"

// User selects grouped filters
broadcastFilter = "u_state=1^ORu_state=3^u_reg_temp=11"

// Combined filter (additive, not replacement)
finalFilter = "active=true^assigned_to=javascript:gs.getUserID()^u_state=1^ORu_state=3^u_reg_temp=11"

// This means: Show records where
//   (active=true) AND (assigned_to=currentUser) AND 
//   ((u_state=1) OR (u_state=3)) AND (u_reg_temp=11)
```

## Widget Options Schema

**Flat Structure:**
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

**Grouped Structure with Text Inputs (Recommended):**
```json
{
  "filters": {
    "States": {
      "u_state=1": "Ordering Incomplete",
      "u_state=3": "In Progress",
      "u_state=4": "Completed"
    },
    "Custom Search": {
      "u_name=*text*": "Name Contains",
      "u_description=*text*": "Description Contains"
    }
  },
  "title": "Filter By:",
  "show_clear_button": true,
  "broadcast_event": "custom.filter.event"
}
```

## Key Design Decisions

### 1. Grouped Filters with AND/OR Logic
- Supports both flat and grouped filter structures
- Grouped structure prevents filter conflicts between different filter types
- Button filters within groups: Use OR logic (e.g., State1 OR State2)
- Between button groups: Use AND logic (e.g., (State1 OR State2) AND EmployeeType)
- Text input filters: ALWAYS use AND logic, automatically grouped in "Text Search" section
- Provides more flexible and precise filtering
- Toggle behavior: clicking active filter deselects it

### 2. Text Input Filters with *text* Placeholder
- Automatic detection: Server detects `*text*` pattern in filter values
- Automatic grouping: Text inputs are automatically placed in "Text Search" section
- AND logic: All text-based searches use AND conditions (not OR)
- Dynamic rendering: HTML template renders text input instead of button
- Placeholder substitution: Client replaces `*text*` with user input
- Debouncing: 1-second delay after typing stops before broadcasting
- Smart updates: Removes filter when input is empty
- Metadata tracking: Uses `_textInputTemplate` marker to track original template
- Conflict prevention: Removes previous filter version before adding new one

### 3. Backward Compatibility
- Flat filter structure still supported
- Server script auto-detects structure type
- Client script handles both formats seamlessly
- Existing implementations continue to work
- Text input feature is additive and optional

### 4. Additive Filtering
- Broadcast filters **ADD** to existing filters, not replace
- Uses `^` (AND operator) to combine with original filters
- OR filters within groups are maintained
- Preserves original list configuration

### 5. Event-Based Communication
- Uses Angular's `$rootScope.$broadcast()`
- Standard event: `sp.list.filter.add`
- Optional custom events for specialized widgets
- Broadcast includes activeFiltersByGroup object for consumer flexibility

### 6. State Management
- Tracks active filters by group in nested object
- Clear button resets all groups
- No persistent state between page loads
- Visual feedback for active/inactive states per group

### 7. Flexible Configuration
- JSON-based filter definition
- Supports any ServiceNow field and operator
- Dynamic button and group generation
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
