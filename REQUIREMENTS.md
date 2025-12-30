# Cart Tracker - Requirements Specification

**Version**: 1.0
**Last Updated**: December 24, 2024
**Status**: Complete - Ready for React Native Implementation

## Purpose

This document provides a comprehensive, **framework-agnostic** specification for the Cart Tracker application. It describes WHAT to build and HOW it should look and behave, without specifying HOW to implement it in any particular framework.

**Intended Audience**: Developers and AI assistants building this application in React Native, Flutter, SwiftUI, or any other framework.

**Success Criteria**: A developer or AI should be able to read this document and build an identical cart tracker app matching all visual specifications and behaviors exactly, without needing to guess or make assumptions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Requirements](#2-feature-requirements)
3. [Visual Design Specifications](#3-visual-design-specifications)
4. [Data Models](#4-data-models)
5. [Business Logic & Algorithms](#5-business-logic--algorithms)
6. [User Flows](#6-user-flows)
7. [Animation Specifications](#7-animation-specifications)
8. [Map Styling](#8-map-styling)
9. [Geographic Data](#9-geographic-data)
10. [External API Requirements](#10-external-api-requirements)
11. [UI State Management](#11-ui-state-management)
12. [Configuration Constants](#12-configuration-constants)
13. [Error Handling](#13-error-handling)
14. [Out of Scope](#14-out-of-scope)
15. [Implementation Notes](#15-implementation-notes)

---

## 1. Project Overview

### 1.1 Project Name
**Cart Tracker Demo**

### 1.2 Core Purpose
A single-screen golf cart ride-sharing application that displays carts on an interactive map, allows users to request rides to a sports stadium, and animates carts moving along real roads in real-time.

### 1.3 Target Platform
Cross-platform mobile application (iOS and Android) via React Native or Flutter.

### 1.4 Demo Context
This is a framework evaluation project, NOT a production application. The goal is to demonstrate:
- Real-time GPS tracking
- Google Maps integration
- Route calculation and visualization
- Smooth animations
- State management
- Clean UI/UX

Time budget: 4-6 hours of development.

### 1.5 Key Features Summary
- Interactive Google Maps with custom styling (light/dark modes)
- Real-time GPS location tracking with continuous updates
- Service area validation using point-in-polygon detection
- Nearest cart assignment algorithm
- Real road routing via Google Directions API
- Smooth cart animation at 8x speed (demo mode)
- Request status lifecycle (pending → assigned → inProgress → completed)
- Info card showing ride details with live updates
- Purple-themed UI throughout
- Custom car and stadium marker icons

---

## 2. Feature Requirements

### 2.1 Map Display

**Interactive Google Map**
- Pan and zoom gestures enabled
- Display center: Downtown Cincinnati, Ohio
- Initial zoom level: 13.5 (shows entire service area)
- Map type: Normal (not satellite or terrain)
- Support for light and dark map styles
- Custom styling to reduce visual clutter

**Map Elements**
- Service area polygon boundary (purple, subtle fill)
- 3 cart markers (purple car icons, 30px)
- Stadium destination marker (pastel red baseball icon, 40px)
- User location indicator (blue dot, system default)
- Route polyline (purple, 5px width) when ride is active
- Camera animations for different states

### 2.2 Location Services

**Permission Handling**
- Request "While In Use" location permission on app launch
- Handle permission denied gracefully (show snackbar, disable request button)
- Handle location service disabled (show warning)
- Handle permanently denied permissions (inform user to enable in settings)

**Continuous Tracking**
- High accuracy location (best available)
- Update location when user moves 10+ meters
- Stream location updates continuously while app is active
- Update UI reactively when location changes
- Check service area on each location update

**Service Area Validation**
- Use ray-casting point-in-polygon algorithm
- Warn user if outside service area (snackbar)
- Disable request button if outside service area
- Prevent ride requests from outside boundary

### 2.3 Ride Request System

**Request Button States**
| State | Button Text | Color | Icon | Enabled |
|-------|-------------|-------|------|---------|
| Loading location | "Getting your location..." | Grey | Baseball | No |
| Outside service area | "Outside Service Area" | Red | Baseball | No |
| Ready to request | "Request Pickup to Stadium" | Deep Purple | Baseball | Yes |
| Request active | "Cancel Request" | Red | Cancel | Yes |
| Ride completed | "Exit" | Blue | Exit | Yes |

**Request Flow**
1. User taps "Request Pickup to Stadium" button
2. System validates user location and service area
3. Find nearest available cart using Haversine distance
4. Calculate route via Google Directions API (cart → user → stadium)
5. Create ride request with UUID
6. Start cart animation along route
7. Show info card with ride details
8. Update button to "Cancel Request"

**Cancel Flow**
1. User taps "Cancel Request" button
2. Stop cart animation immediately
3. Clear route from map
4. Reset cart marker to available state (green/purple)
5. Show "Request cancelled" snackbar
6. Return button to "Request Pickup to Stadium"

**Exit Flow** (after completion)
1. User taps "Exit" button
2. Clear all ride state
3. Remove route and info card
4. Show "Ready for next ride!" snackbar
5. Return to initial state

### 2.4 Cart Animation

**Real-Time Position Updates**
- Update cart position every 100 milliseconds (10 FPS)
- Smooth linear interpolation between polyline points
- Speed: 15 mph base × 8x multiplier = 120 mph effective (demo mode)
- Distance per update: ~5.36 meters

**Animation Lifecycle**
1. **Assigned Phase**: Cart animates from starting position toward user
   - Status: "assigned"
   - Marker color: Orange/dark purple
   - Camera follows cart at zoom 17.0
2. **Pickup Phase**: Cart reaches user location (within 20 meters)
   - Pause animation for 5 seconds
   - Status transitions to "inProgress"
   - Show "Picked up!" snackbar
3. **In Progress Phase**: Cart continues to stadium
   - Status: "inProgress"
   - Camera continues following
   - Info card updates with live progress
4. **Completion**: Cart reaches stadium
   - Stop animation
   - Status: "completed"
   - Show "Ride completed! Enjoy the game! 🎉" snackbar
   - Button changes to "Exit"

### 2.5 Information Display

**Info Card** (shown during active ride)
- Position: Top of screen, below app bar
- Full width with 16px side margins
- Rounded corners (16px radius)
- White background with subtle shadow
- Contains:
  - Cart icon (48×48px container, golf course icon)
  - Cart name (bold, 18px)
  - Status badge (pill-shaped, color-coded by status)
  - 3-column info grid:
    - Distance to stadium (route icon, miles)
    - ETA (clock icon, minutes)
    - Party size (person icon, number)

**Snackbar Notifications** (temporary messages)
- Position: Bottom of screen (default)
- Auto-dismiss after specified duration
- Background color varies by message type (see UI State Management)
- Text: White, standard size

**Status Transitions**
- Grey: "Finding cart..." (pending)
- Orange: "Cart on the way" (assigned)
- Blue: "En route to stadium" (inProgress)
- Green: "Arrived!" (completed)
- Red: "Cancelled" (cancelled)

### 2.6 Theme Toggle

**Map Style Switching**
- Toggle button in app bar (top right)
- Icon: Light mode icon (sun) when dark mode active
- Icon: Dark mode icon (moon) when light mode active
- Tooltip: "Switch to Light Mode" or "Switch to Dark Mode"
- On tap: Load and apply alternate map style JSON
- Styles: "Clean Minimal" (light) and "Dark" modes
- Toggle state NOT persisted (resets to light on app restart for demo)

---

## 3. Visual Design Specifications

### 3.1 Color Palette

**Service Area**
| Element | Hex Code | Opacity | Description |
|---------|----------|---------|-------------|
| Fill | `#AB47BC` | 6% (`0x10`) | Very subtle purple tint |
| Border | `#9C27B0` | 100% (`0xFF`) | Deep purple outline |

**Marker Colors**
| Marker Type | Color | Hue/Shade | Size |
|-------------|-------|-----------|------|
| Available cart | Deep purple | `#673AB7` | 30px |
| Active cart | Very dark purple | `#311B92` (shade 900) | 30px |
| Stadium | Pastel red | `#EF9A9A` (red shade 200) | 40px |
| User location | Blue | System default | System |

**Button Colors**
| State | Background Color | Text Color |
|-------|-----------------|------------|
| Default (disabled) | Grey `#9E9E9E` | White |
| Ready (enabled) | Deep purple `#6A1B9A` | White |
| Cancel | Red `#F44336` | White |
| Exit (completed) | Blue `#2196F3` | White |

**Snackbar Colors**
| Type | Background Color | Use Case |
|------|-----------------|----------|
| Success | Deep purple `#512DA8` | Cart assigned, pickup, ready for next ride |
| Info | Purple shade 300 `#BA68C8` | Warnings, outside area, cancelled |
| Completion | Deep purple shade 700 `#4527A0` | Ride completed |
| Error | Red `#F44336` | API failures, no carts |

**Status Badge Colors**
| Status | Background | Text |
|--------|-----------|------|
| pending | Grey `#9E9E9E` | White |
| assigned | Orange `#FF9800` | White |
| inProgress | Blue `#2196F3` | White |
| completed | Green `#4CAF50` | White |
| cancelled | Red `#F44336` | White |

**Map Style Colors - Light Mode**
| Feature | Hex Code | Description |
|---------|----------|-------------|
| Base geometry | `#f5f5f5` | Very light grey background |
| Text fill | `#616161` | Dark grey labels |
| Text stroke | `#f5f5f5` | Light outline on text |
| Roads | `#ffffff` | White roads |
| Road strokes | `#d4d4d4` | Light grey road edges |
| Highways | `#e8e8e8` | Very light grey highways |
| Water | `#b8d4e8` | Light blue water |
| Parks | `#d6e8d4` | Light green parks |

**Map Style Colors - Dark Mode**
| Feature | Hex Code | Description |
|---------|----------|-------------|
| Base geometry | `#242424` | Dark grey background |
| Text fill | `#b0b0b0` | Light grey labels |
| Text stroke | `#1a1a1a` | Very dark outline |
| Roads | `#3a3a3a` | Dark grey roads |
| Road strokes | `#2a2a2a` | Darker grey edges |
| Highways | `#4a4a4a` | Medium dark grey |
| Water | `#1e3a5f` | Dark blue water |
| Parks | `#1a2e1a` | Dark green parks |

### 3.2 Typography

**Font Sizes**
| Element | Size (px) | Weight | Color |
|---------|-----------|--------|-------|
| Cart name | 18 | Bold | Black |
| Status message | 14 | Regular | Grey |
| Status badge text | 12 | Semi-bold (600) | White |
| Info card values | 16 | Bold | Black |
| Info card labels | 12 | Regular | Grey |
| Button label | 16 | Medium | White |

**Font Weights Reference**
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### 3.3 Dimensions & Spacing

**Marker Sizes**
- Cart icon container: 30×30 pixels
- Stadium icon container: 40×40 pixels
- Icon glyph: 70% of container size (21px for cart, 28px for stadium)
- Background: White circle

**Route & Boundaries**
- Route polyline width: 5 pixels
- Service area border width: 2 pixels

**Info Card**
- Width: Screen width - 32px (16px margins each side)
- Padding: 20px all sides
- Border radius: 16px
- Shadow: 10px blur, (0, -2) offset, 10% opacity black
- Cart icon container: 48×48px, 12px border radius
- Divider: 1px height, 16px vertical margins
- Info grid: 3 columns, equal width
- Column spacing: 16px horizontal gaps

**Status Badge**
- Horizontal padding: 12px
- Vertical padding: 6px
- Border radius: 20px (pill shape)
- Font size: 12px
- Font weight: 600

**Button (FAB)**
- Type: Extended Floating Action Button (icon + label)
- Position: Center bottom, 16px from bottom edge
- Icon size: 24px
- Label size: 16px

**Spacing Constants**
- Small gap: 8px
- Medium gap: 16px
- Large gap: 24px

### 3.4 Icons

**Map Markers**
| Element | Icon Type | Description |
|---------|-----------|-------------|
| Available cart | Car icon | Side view of car (like `directions_car`) |
| Active cart | Car icon | Same as available, different color |
| Stadium | Baseball icon | Baseball or sports icon |

**App Bar**
| Element | Icon Type | States |
|---------|-----------|--------|
| Theme toggle | Sun/Moon | Sun when dark mode, moon when light mode |

**Info Card**
| Element | Icon Type | Size |
|---------|-----------|------|
| Cart | Golf course | 28px |
| Distance | Route/navigation | 16px |
| ETA | Clock | 16px |
| Party size | Person | 16px |

**Button Icons**
| State | Icon Type |
|-------|-----------|
| Request | Baseball |
| Cancel | Cancel/X |
| Exit | Exit/arrow |

### 3.5 Component Layouts

**Info Card Layout**
```
┌─────────────────────────────────────────┐
│  [Cart Icon] Cart Name                  │
│              [Status Badge]             │
│─────────────────────────────────────────│
│  [Route]    [Clock]      [Person]       │
│  X.X mi     XX min       X person       │
└─────────────────────────────────────────┘
```

**App Bar Layout**
```
┌─────────────────────────────────────────┐
│  Cart Tracker              [Theme Icon] │
└─────────────────────────────────────────┘
```

**Map Screen Layout**
```
┌─────────────────────────────────────────┐
│  [App Bar]                              │
├─────────────────────────────────────────┤
│                                         │
│  [Info Card] (if ride active)           │
│                                         │
│                                         │
│       [Map with markers & route]        │
│                                         │
│                                         │
│                                         │
│          [Request/Cancel/Exit FAB]      │
└─────────────────────────────────────────┘
```

---

## 4. Data Models

### 4.1 Cart Model

**Fields**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | String | Unique identifier | "CART-001" |
| name | String | Display name | "Findlay Market Cart" |
| latitude | Double | Latitude coordinate | 39.1116 |
| longitude | Double | Longitude coordinate | -84.5158 |

**Mock Data** (3 carts)
```
Cart 1:
  id: "CART-001"
  name: "Findlay Market Cart"
  latitude: 39.1116
  longitude: -84.5158

Cart 2:
  id: "CART-002"
  name: "Fountain Square Cart"
  latitude: 39.1020
  longitude: -84.5120

Cart 3:
  id: "CART-003"
  name: "Washington Park Cart"
  latitude: 39.1088
  longitude: -84.5180
```

### 4.2 RideRequest Model

**Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | String | UUID v4 identifier |
| pickupLocation | LatLng | User's location when requested |
| dropoffLocation | LatLng | Always stadium location |
| partySize | Integer | Number of passengers (1-5) |
| requestTime | DateTime | When request was created |
| status | RequestStatus | Current status enum |
| assignedCartId | String | ID of assigned cart |

**RequestStatus Enum**
| Value | Display String | Description |
|-------|---------------|-------------|
| pending | "Finding cart..." | Request created, searching |
| assigned | "Cart on the way" | Cart assigned, en route to pickup |
| inProgress | "En route to stadium" | User picked up, heading to destination |
| completed | "Arrived!" | Reached stadium |
| cancelled | "Cancelled" | User cancelled request |

### 4.3 Route Model

**Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| waypoints | List<LatLng> | 3 points: [cart, pickup, stadium] |
| polylinePoints | List<LatLng> | Decoded route points |
| estimatedDistanceMeters | Double | Total route distance |
| estimatedDurationSeconds | Integer | Total route time |

**Computed Properties**
| Property | Formula | Example |
|----------|---------|---------|
| estimatedDistanceMiles | meters × 0.000621371 | 3.2 miles |
| estimatedDurationMinutes | ceil(seconds / 60) | 8 minutes |

### 4.4 CartAnimationState Model

**Fields**
| Field | Type | Description |
|-------|------|-------------|
| position | LatLng | Current cart location |
| distanceTraveled | Double | Meters traveled so far |
| totalDistance | Double | Total route distance |
| hasReachedPickup | Boolean | True when within 20m of pickup |
| isComplete | Boolean | True when animation finished |

**Computed Properties**
| Property | Formula |
|----------|---------|
| progress | distanceTraveled / totalDistance (0.0-1.0) |
| remainingDistance | totalDistance - distanceTraveled |

---

## 5. Business Logic & Algorithms

### 5.1 Haversine Distance Formula

**Purpose**: Calculate great-circle distance between two GPS coordinates

**Inputs**:
- start: LatLng (latitude, longitude in degrees)
- end: LatLng (latitude, longitude in degrees)

**Output**: Distance in meters

**Constants**:
- Earth radius: 6,371,000 meters
- π (pi): 3.14159265359

**Formula**:
```
// Convert degrees to radians
lat1_rad = start.latitude × (π / 180)
lat2_rad = end.latitude × (π / 180)
lon1_rad = start.longitude × (π / 180)
lon2_rad = end.longitude × (π / 180)

// Calculate differences
dLat = lat2_rad - lat1_rad
dLon = lon2_rad - lon1_rad

// Haversine formula
a = sin²(dLat/2) + cos(lat1_rad) × cos(lat2_rad) × sin²(dLon/2)
c = 2 × asin(√a)
distance_meters = 6371000 × c
```

**Used For**:
- Finding nearest cart to user
- Calculating distance displayed in info card
- Detecting when cart reaches pickup location (threshold: 20 meters)

### 5.2 Ray Casting (Point-in-Polygon Detection)

**Purpose**: Determine if a point (user location) is inside a polygon (service area)

**Algorithm**: Cast a ray from the point to infinity and count how many times it crosses the polygon boundary.

**Logic**:
- Odd number of crossings = point is INSIDE polygon
- Even number of crossings = point is OUTSIDE polygon

**Inputs**:
- point: LatLng (user location)
- polygon: List<LatLng> (service area boundary, 30 points)

**Output**: Boolean (true if inside, false if outside)

**Pseudo-code**:
```
function isPointInPolygon(point, polygon):
    crossings = 0
    n = polygon.length

    for i from 0 to n-1:
        j = (i + 1) % n  // Next vertex, wrapping to 0

        vertex1 = polygon[i]
        vertex2 = polygon[j]

        // Check if ray from point crosses edge
        if ((vertex1.lat > point.lat) != (vertex2.lat > point.lat)):
            // Calculate x-coordinate of intersection
            slope = (vertex2.lng - vertex1.lng) / (vertex2.lat - vertex1.lat)
            x_intersection = vertex1.lng + slope × (point.lat - vertex1.lat)

            if (point.lng < x_intersection):
                crossings = crossings + 1

    return (crossings % 2 == 1)  // Odd = inside
```

**Used For**:
- Validating user is inside service area before allowing request
- Showing warning message when user is outside area
- Disabling request button when outside boundary

### 5.3 Nearest Cart Assignment

**Purpose**: Find the closest available cart to the user's pickup location

**Algorithm**:
1. Get list of all available carts
2. For each cart, calculate distance to user using Haversine formula
3. Return cart with minimum distance

**Pseudo-code**:
```
function findNearestCart(userLocation, availableCarts):
    if (availableCarts is empty):
        return null

    nearestCart = null
    minDistance = infinity

    for each cart in availableCarts:
        cartLocation = LatLng(cart.latitude, cart.longitude)
        distance = haversineDistance(cartLocation, userLocation)

        if (distance < minDistance):
            minDistance = distance
            nearestCart = cart

    return nearestCart
```

**Used For**:
- Assigning cart when user taps "Request Pickup"

### 5.4 Route Animation Interpolation (Linear)

**Purpose**: Smoothly move cart along polyline points

**Algorithm**: Linear interpolation (LERP) between consecutive polyline points

**Constants**:
- Base speed: 15 mph = 6.7056 m/s
- Speed multiplier: 8.0 (for demo)
- Effective speed: 120 mph = 53.6448 m/s
- Update interval: 100 milliseconds
- Distance per tick: 53.6448 m/s × 0.1 s = 5.36448 meters

**Linear Interpolation Formula**:
```
// progress is 0.0 to 1.0 representing position between start and end
newLatitude = startLat + (endLat - startLat) × progress
newLongitude = startLng + (endLng - startLng) × progress
```

**Animation Loop** (every 100ms):
```
function updateCartPosition(elapsedTime):
    // Calculate total distance traveled
    distancePerTick = 5.36448  // meters
    totalDistanceTraveled = totalDistanceTraveled + distancePerTick

    // Find current segment in polyline
    currentSegment = findSegmentAtDistance(polylinePoints, totalDistanceTraveled)

    if (currentSegment is null):
        // Reached end of route
        isComplete = true
        return finalPosition

    // Calculate progress within current segment
    distanceIntoSegment = totalDistanceTraveled - currentSegment.startDistance
    segmentLength = currentSegment.length
    progress = distanceIntoSegment / segmentLength

    // Interpolate position
    newPosition = lerp(currentSegment.start, currentSegment.end, progress)

    // Check pickup threshold
    if (distance(newPosition, pickupLocation) < 20):
        hasReachedPickup = true

    return newPosition
```

**Used For**:
- Animating cart movement from starting point → pickup → stadium

### 5.5 ETA Calculation

**Purpose**: Estimate time until cart arrives at pickup location

**Constants**:
- Cart speed: 15 mph = 6.7056 m/s
- Speed multiplier: 8.0 (for demo, adjustable)

**Formula**:
```
// Calculate distance from cart to pickup
distance_meters = haversineDistance(cartLocation, pickupLocation)

// Calculate time
speed_mps = 15 mph × 0.44704 m/s per mph × speedMultiplier
eta_seconds = distance_meters / speed_mps
eta_minutes = ceil(eta_seconds / 60)
```

**Example**:
```
distance = 2000 meters
speed = 15 × 0.44704 × 8 = 53.6448 m/s
eta_seconds = 2000 / 53.6448 = 37.3 seconds
eta_minutes = ceil(37.3 / 60) = 1 minute
```

**Used For**:
- Displaying "Arriving in X min" when cart is assigned
- Showing ETA in info card

### 5.6 Route Duration Calculation

**Purpose**: Calculate total trip time from pickup to stadium

**Formula**:
```
// Use route distance from Google Directions API
totalDistance_meters = route.estimatedDistanceMeters

// Calculate duration based on demo speed
speed_mps = 15 mph × 0.44704 × speedMultiplier
duration_seconds = totalDistance_meters / speed_mps
duration_minutes = ceil(duration_seconds / 60)
```

**Used For**:
- Displaying trip duration in info card

---

## 6. User Flows

### 6.1 App Initialization Flow

**Trigger**: User opens app

**Steps**:
1. App launches, renders map screen
2. Create service area polygon from 30 coordinate points
3. Load 3 mock carts from constants
4. Create custom marker icons:
   - Available cart icon (30px, deep purple, car symbol)
   - Active cart icon (30px, very dark purple, car symbol)
   - Stadium icon (40px, pastel red, baseball symbol)
5. Load map style from assets (default: light mode)
6. Request location permission:
   - If granted: Continue to step 7
   - If denied: Show snackbar "Location permission denied", disable button
   - If denied permanently: Show snackbar to enable in settings
7. Obtain user's current location:
   - If successful: Update blue dot on map
   - If fails: Show error snackbar
8. Check if user is inside service area:
   - If outside: Show warning snackbar (4 sec), button shows "Outside Service Area" (red, disabled)
   - If inside: Button shows "Request Pickup to Stadium" (deep purple, enabled)
9. Start continuous location stream (updates every 10m movement)
10. Display map with:
    - 3 cart markers (deep purple)
    - Stadium marker (pastel red)
    - Service area polygon (subtle purple fill, purple border)
    - User location blue dot

**UI State After Init**:
- Map centered at (39.105, -84.51) with zoom 13.5
- All 3 cart markers visible
- Request button enabled if inside service area

### 6.2 Request Pickup Flow

**Trigger**: User taps "Request Pickup to Stadium" button

**Preconditions**:
- User location is available
- User is inside service area
- No active request exists

**Steps**:
1. Validate preconditions:
   - If location unavailable: Show "Waiting for your location..." snackbar, abort
   - If outside service area: Show "Sorry, you are outside the service area..." snackbar (4 sec), abort
   - If request already active: Show "You already have an active request!" snackbar, abort
2. Find nearest available cart:
   - Calculate distance from user to each of 3 carts using Haversine
   - Select cart with minimum distance
   - If no carts available: Show "No carts available..." snackbar (3 sec), abort
3. Calculate route using Google Directions API:
   - Waypoints: [cart location, user location, stadium location]
   - Mode: Driving
   - Request polyline, distance, and duration
   - If API fails: Show "Unable to calculate route..." snackbar (4 sec), abort
4. Create ride request:
   - Generate UUID for request ID
   - Set pickupLocation = user's current location
   - Set dropoffLocation = stadium location (39.0978, -84.5086)
   - Set partySize = 1
   - Set status = "assigned"
   - Set assignedCartId = selected cart's ID
   - Set requestTime = current timestamp
5. Update UI:
   - Change selected cart marker to very dark purple
   - Draw route polyline on map (deep purple, 5px width)
   - Show info card at top of screen with:
     - Cart name
     - Status badge: "Cart on the way" (orange)
     - Distance to stadium (in miles)
     - ETA (in minutes)
     - Party size: 1
   - Change button to "Cancel Request" (red, cancel icon)
6. Show success snackbar: "[Cart name] assigned! Arriving in [ETA] min" (deep purple, 4 sec)
7. Start cart animation:
   - Begin position updates every 100ms
   - Cart moves from starting position toward pickup location
   - Camera animates to cart position with zoom 17.0
   - Camera continues following cart as it moves

**UI State After Request**:
- Route polyline visible
- Info card visible
- Selected cart animating toward user
- Button shows "Cancel Request"
- Camera following cart

### 6.3 Pickup Animation Flow

**Trigger**: Cart reaches pickup location during animation

**Detection**: Distance between cart position and pickup location < 20 meters

**Steps**:
1. Detect pickup threshold reached:
   - Calculate distance from cart to pickup location each animation tick
   - When distance < 20 meters: Set hasReachedPickup = true
2. Pause animation for 5 seconds:
   - Stop position updates
   - Cart remains stationary at current position
   - Camera continues showing cart
3. Update status:
   - Change request.status from "assigned" to "inProgress"
   - Update status badge to "En route to stadium" (blue)
4. Show pickup snackbar: "Picked up! Heading to stadium..." (deep purple, 2 sec)
5. Resume animation after 5-second pause:
   - Continue position updates every 100ms
   - Cart moves from pickup location toward stadium
   - Camera continues following cart at zoom 17.0
6. Update info card:
   - Distance updates in real-time as cart moves
   - ETA updates based on remaining distance

**UI State During In Progress**:
- Status badge: Blue "En route to stadium"
- Cart animating toward stadium
- Route polyline still visible
- Camera following cart
- Button still shows "Cancel Request"

### 6.4 Dropoff/Completion Flow

**Trigger**: Cart reaches stadium destination

**Detection**: Total distance traveled >= total route distance

**Steps**:
1. Detect completion:
   - When totalDistanceTraveled >= route.estimatedDistanceMeters
   - Set isComplete = true
2. Stop animation:
   - Cancel position update timer
   - Cart remains at final position (stadium location)
3. Update status:
   - Change request.status from "inProgress" to "completed"
   - Update status badge to "Arrived!" (green)
4. Update button:
   - Change text to "Exit"
   - Change color to blue
   - Change icon to exit icon
5. Show completion snackbar: "Ride completed! Enjoy the game! 🎉" (deep purple shade 700, 3 sec)
6. Stop camera following:
   - Camera remains at current position (stadium area)
7. Wait for user to tap "Exit" button

**UI State After Completion**:
- Status badge: Green "Arrived!"
- Cart marker at stadium
- Route still visible
- Info card still visible
- Button shows "Exit" (blue)
- Camera stationary

### 6.5 Cancel Request Flow

**Trigger**: User taps "Cancel Request" button during active ride

**Preconditions**: Request exists with status other than "completed"

**Steps**:
1. Stop cart animation:
   - Cancel position update timer
   - Stop emitting new positions
2. Clear animation state:
   - Set animatedCartPosition = null
   - Clear CartAnimationService state
3. Reset cart marker:
   - Change marker color back to deep purple (available)
   - Position returns to original starting location
4. Remove route from map:
   - Clear polyline from map
   - Set activeRoute = null
5. Hide info card:
   - Remove from screen
6. Clear ride state:
   - Set activeRequest = null
   - Set selectedCart = null
   - Set activeRoute = null
7. Reset button:
   - Change text to "Request Pickup to Stadium"
   - Change color to deep purple
   - Change icon to baseball
   - Enable if user is inside service area
8. Show cancellation snackbar: "Request cancelled" (purple shade 300, 2 sec)
9. Return to initial state

**UI State After Cancel**:
- No route polyline
- No info card
- All cart markers deep purple (available)
- Button shows "Request Pickup to Stadium"
- Map shows original view

### 6.6 Theme Toggle Flow

**Trigger**: User taps theme toggle button (sun/moon icon in app bar)

**Steps**:
1. Read current theme state (isDarkMode boolean)
2. Toggle theme:
   - If light mode: Set isDarkMode = true
   - If dark mode: Set isDarkMode = false
3. Load appropriate map style:
   - If isDarkMode: Load "dark.json" from assets
   - If !isDarkMode: Load "clean_minimal.json" from assets
4. Apply style to map:
   - Call map SDK method to update style
   - Map re-renders with new colors
5. Update icon:
   - If dark mode: Show light mode icon (sun)
   - If light mode: Show dark mode icon (moon)
6. Update tooltip:
   - If dark mode: "Switch to Light Mode"
   - If light mode: "Switch to Dark Mode"

**UI State After Toggle**:
- Map colors updated (instant)
- Icon changed
- Theme persists until app restart (not saved)

---

## 7. Animation Specifications

### 7.1 Cart Movement Animation

**Type**: Continuous position streaming via timer/interval

**Trigger**: When ride request status becomes "assigned"

**Duration**: Variable (depends on route distance and speed)

**Update Frequency**: Every 100 milliseconds (10 updates per second)

**Speed Calculation**:
```
Base speed: 15 mph
Demo multiplier: 8.0
Effective speed: 15 × 8 = 120 mph

Convert to m/s:
120 mph × 0.44704 m/s per mph = 53.6448 m/s

Distance per update (100ms):
53.6448 m/s × 0.1 s = 5.36448 meters
```

**Interpolation Method**: Linear interpolation (LERP) between polyline points

**Algorithm**:
1. Start timer with 100ms interval
2. Each tick:
   a. Increment totalDistanceTraveled by 5.36448 meters
   b. Find polyline segment containing current distance
   c. Calculate progress (0.0-1.0) within that segment
   d. Interpolate position: `lerp(segmentStart, segmentEnd, progress)`
   e. Emit new cart position
3. Continue until totalDistanceTraveled >= route.totalDistance

**Key Events**:
| Event | Condition | Action |
|-------|-----------|--------|
| Pickup Reached | Distance to pickup < 20m | Set hasReachedPickup = true, pause 5 sec |
| Animation Complete | Distance traveled >= total | Set isComplete = true, stop timer |

**Smoothness**: Continuous position updates create fluid motion. No easing curves needed.

### 7.2 Camera Animation

**Type**: Animated camera movement with zoom

**Initial State**:
- Center: (39.105, -84.51) - Service area center
- Zoom: 13.5 - Shows entire service area
- Duration: N/A (static)

**Transition 1: Location Obtained**
- Trigger: User location successfully acquired
- Target: User's current position
- Zoom: 15.0 (closer view)
- Duration: ~500ms (standard animation)
- Easing: Default (usually ease-in-out)

**Transition 2: Cart Animation Starts**
- Trigger: Request assigned, cart begins moving
- Target: Cart's current position
- Zoom: 17.0 (close-up on cart)
- Duration: ~500ms
- Easing: Default

**Continuous Following**:
- Trigger: Request status is "assigned" or "inProgress"
- Behavior: Camera center updates to cart position on every animation tick (100ms)
- Zoom: Maintains 17.0
- Duration per update: Instant (no animation between ticks)
- Creates smooth following effect due to short intervals

**Stop Following**:
- Trigger: Request completed or cancelled
- Behavior: Camera stops updating, remains at last position
- User can manually pan/zoom after this

### 7.3 Status Transitions

**State Diagram**:
```
        [Request Created]
               ↓
           pending (grey)
               ↓
        [Cart Assigned]
               ↓
          assigned (orange) ←── Camera starts following
               ↓
        [Cart Reaches Pickup]
               ↓
         inProgress (blue) ←── Still following
               ↓
        [Cart Reaches Stadium]
               ↓
         completed (green) ←── Stop following
               ↓
         [User Taps Exit]
               ↓
           [Reset]

        [Any Time: User Taps Cancel]
               ↓
         cancelled (red)
               ↓
           [Reset]
```

**Transition Conditions**:
| From | To | Trigger | Duration |
|------|----|---------| ---------|
| - | pending | Request created | Instant |
| pending | assigned | Cart assigned, route calculated | Instant |
| assigned | inProgress | Cart position within 20m of pickup | After 5s pause |
| inProgress | completed | Distance traveled >= total distance | Instant |
| Any | cancelled | User taps Cancel button | Instant |

**Badge Color Changes**: Instantaneous, no animation. Background color updates immediately when status changes.

---

## 8. Map Styling

### 8.1 Light Mode (clean_minimal.json)

**Overall Theme**: Clean, bright, minimal clutter

**Color Scheme**:
- Background: Very light grey (#f5f5f5)
- Roads: White (#ffffff) with light grey strokes (#d4d4d4)
- Water: Light blue (#b8d4e8)
- Parks: Light green (#d6e8d4)
- Labels: Dark grey (#616161)

**Feature Visibility**:
| Feature | Visibility | Notes |
|---------|-----------|-------|
| POIs (restaurants, shops) | Hidden | Reduces clutter |
| Parks | Visible | Adds context, pleasant color |
| Transit lines | Hidden | Not relevant to demo |
| Local road labels | Hidden | Too much text |
| Arterial/highway labels | Visible | Helps orientation |
| Water bodies | Visible | Geographic context |

**Complete JSON** (56 lines):
```json
[
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{"color": "#f5f5f5"}]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#616161"}]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{"color": "#d6e8d4"}, {"visibility": "on"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#d4d4d4"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [{"visibility": "on"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#e8e8e8"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [{"visibility": "on"}]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#b8d4e8"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [{"visibility": "simplified"}]
  }
]
```

### 8.2 Dark Mode (dark.json)

**Overall Theme**: Dark, low-light friendly

**Color Scheme**:
- Background: Dark grey (#242424)
- Roads: Dark grey (#3a3a3a) with darker strokes (#2a2a2a)
- Water: Dark blue (#1e3a5f)
- Parks: Dark green (#1a2e1a)
- Labels: Light grey (#b0b0b0)

**Feature Visibility**: Same as light mode (POIs hidden, parks visible, etc.)

**Complete JSON** (56 lines, same structure as light mode):
```json
[
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{"color": "#242424"}]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#b0b0b0"}]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#1a1a1a"}, {"lightness": -20}]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{"color": "#1a2e1a"}, {"visibility": "on"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#3a3a3a"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#2a2a2a"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [{"visibility": "on"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#4a4a4a"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [{"visibility": "on"}]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#1e3a5f"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [{"visibility": "simplified"}]
  }
]
```

### 8.3 Custom Map Elements

**Service Area Polygon**
- Fill color: #AB47BC with 6% opacity (#10AB47BC in ARGB)
- Stroke color: #9C27B0 (deep purple, 100% opacity)
- Stroke width: 2 pixels
- Always visible, not affected by map style
- Renders above base map, below markers

**Route Polyline**
- Color: #512DA8 (deep purple shade 700)
- Width: 5 pixels
- Style: Solid (no dashes or patterns)
- Visibility: Only visible during active ride
- Renders above polygon, below markers

**Markers**
- Custom icons (rendered from symbols, not default pins)
- White circular backgrounds for visibility
- Z-index: Above all other map elements

---

## 9. Geographic Data

### 9.1 Service Area Polygon (30 Points)

**Description**: Downtown Cincinnati service area boundary

**Format**: Array of [latitude, longitude] pairs

**Coordinates** (closes by repeating first point as last):
```
[
  [39.087184207591065, -84.51869432563144],
  [39.088568525895084, -84.51295921817994],
  [39.09124204525713, -84.49855367546303],
  [39.094210859858805, -84.49281847460088],
  [39.097869873918825, -84.4882301889014],
  [39.101628084682545, -84.48644478053633],
  [39.10686961187102, -84.48236882778457],
  [39.107168350512694, -84.49001239631811],
  [39.103606243980266, -84.49791552341914],
  [39.1063732610742, -84.50300839651248],
  [39.11819090098837, -84.4993029719065],
  [39.118390759936375, -84.50159045247447],
  [39.11700136991567, -84.50450564358165],
  [39.11572197103618, -84.50641085204794],
  [39.11582153925349, -84.50958609613129],
  [39.11886026704204, -84.50843025065834],
  [39.11994706864513, -84.51427021106275],
  [39.122207829063655, -84.51629661820152],
  [39.12230754690731, -84.51794735512611],
  [39.11969481393308, -84.52055448953064],
  [39.12067901511497, -84.52373027064776],
  [39.11803234705846, -84.5223640104097],
  [39.1077574632933, -84.51969579536427],
  [39.10765913017838, -84.52148208568308],
  [39.10370493456995, -84.52096836431508],
  [39.107760150629616, -84.53755365014761],
  [39.10271615444725, -84.53666648301301],
  [39.10063934649253, -84.53117892427926],
  [39.09806732166379, -84.52914345499913],
  [39.094800562344176, -84.52341629338783],
  [39.087184207591065, -84.51869432563144]
]
```

**Total Points**: 31 (30 unique + 1 repeated to close)

### 9.2 Stadium Location

**Name**: Great American Ball Park

**Description**: West entrance/drop-off area

**Coordinates**:
- Latitude: `39.0978`
- Longitude: `-84.5086`

**Usage**: Destination for all ride requests (dropoffLocation)

### 9.3 Mock Cart Starting Locations

**Cart 1**:
- ID: "CART-001"
- Name: "Findlay Market Cart"
- Latitude: `39.1116`
- Longitude: `-84.5158`

**Cart 2**:
- ID: "CART-002"
- Name: "Fountain Square Cart"
- Latitude: `39.1020`
- Longitude: `-84.5120`

**Cart 3**:
- ID: "CART-003"
- Name: "Washington Park Cart"
- Latitude: `39.1088`
- Longitude: `-84.5180`

### 9.4 Initial Camera Position

**Center Coordinates**:
- Latitude: `39.105`
- Longitude: `-84.51`

**Zoom Level**: `13.5`

**Description**: Centered on service area to show all carts and boundary

---

## 10. External API Requirements

### 10.1 Google Maps Platform

**Required APIs**:
1. **Maps SDK for iOS** - Display interactive map (iOS native)
2. **Maps SDK for Android** - Display interactive map (Android native)
3. **Directions API** - Calculate routes with real roads

**API Key Requirements**:
- Obtain API key from Google Cloud Console
- Enable all 3 APIs on the key
- Restrict key to prevent unauthorized use (optional for demo)
- Budget: Free tier sufficient for demo (no high volume)

**Maps SDK Usage**:
- Display map widget
- Show markers (custom icons)
- Draw polygons (service area)
- Draw polylines (route)
- Apply custom styling via JSON
- Animate camera
- Handle user interactions (pan, zoom)

### 10.2 Location Services API

**Platform-Specific**:
- iOS: CoreLocation framework
- Android: Google Play Services Location API
- React Native: react-native-geolocation or expo-location
- Flutter: geolocator package

**Permission Type**: "While In Use" (not "Always")

**Permission Prompt Message**:
"Cart Tracker needs your location to find nearby carts and provide ride services."

**Accuracy**: High (best available)

**Update Settings**:
- Distance filter: 10 meters (only update when user moves 10m)
- Desired accuracy: Best for navigation

### 10.3 Google Directions API

**Endpoint**: `https://maps.googleapis.com/maps/api/directions/json`

**Request Parameters**:
| Parameter | Value | Description |
|-----------|-------|-------------|
| origin | `{cartLat},{cartLng}` | Starting point (cart location) |
| destination | `39.0978,-84.5086` | End point (stadium) |
| waypoints | `{userLat},{userLng}` | Pickup location |
| mode | `driving` | Travel mode |
| key | `[YOUR_API_KEY]` | API key |

**Example Request**:
```
GET https://maps.googleapis.com/maps/api/directions/json
  ?origin=39.1116,-84.5158
  &destination=39.0978,-84.5086
  &waypoints=39.1050,-84.5100
  &mode=driving
  &key=YOUR_API_KEY_HERE
```

**Response Needed**:
| Field | Path | Usage |
|-------|------|-------|
| Encoded polyline | routes[0].overview_polyline.points | Decode to LatLng array for animation |
| Distance | routes[0].legs[].distance.value | Sum all legs, use for total distance |
| Duration | routes[0].legs[].duration.value | Sum all legs, use for ETA |

**Polyline Decoding**:
- Directions API returns encoded polyline string
- Must decode using polyline algorithm (5-digit precision)
- Results in array of LatLng points for route visualization

**Error Handling**:
- Status: "OK" = success
- Status: "ZERO_RESULTS" = no route found
- Status: "OVER_QUERY_LIMIT" = exceeded quota
- Status: "REQUEST_DENIED" = invalid API key
- Any non-OK status: Show error snackbar, abort request

---

## 11. UI State Management

### 11.1 Button States Table

| Condition | Button Text | Color | Icon | Enabled | Action |
|-----------|-------------|-------|------|---------|--------|
| User location = null | "Getting your location..." | Grey (#9E9E9E) | Baseball | No | None |
| User outside service area | "Outside Service Area" | Red (#F44336) | Baseball | No | None |
| User inside area, no request | "Request Pickup to Stadium" | Deep Purple (#6A1B9A) | Baseball | Yes | Request pickup |
| Request active (assigned) | "Cancel Request" | Red (#F44336) | Cancel | Yes | Cancel request |
| Request active (inProgress) | "Cancel Request" | Red (#F44336) | Cancel | Yes | Cancel request |
| Request completed | "Exit" | Blue (#2196F3) | Exit | Yes | Clear state, reset |

### 11.2 Snackbar Messages Table

| Event | Message | Duration | Background Color |
|-------|---------|----------|------------------|
| App start, outside area | "You are outside the service area. We only serve downtown Cincinnati." | 4 sec | Purple.shade300 (#BA68C8) |
| Location permission denied | "Location permission denied. Please enable in settings." | 3 sec | Default (grey) |
| Location error | "Error getting location: [error]" | 3 sec | Default |
| Cart marker tapped | "[Cart name] tapped!" | 2 sec | Default |
| Already has active request | "You already have an active request!" | Auto | Purple.shade300 |
| Waiting for location | "Waiting for your location..." | Auto | Purple.shade300 |
| No carts available | "No carts available right now. Please try again later." | 3 sec | Red (#F44336) |
| Outside area (on request tap) | "Sorry, you are outside the service area. We only serve downtown Cincinnati." | 4 sec | Red |
| Route calculation failed | "Unable to calculate route. Please try again." | 4 sec | Red |
| Request successful | "[Cart name] assigned! Arriving in [ETA] min" | 4 sec | Deep Purple (#512DA8) |
| Cart reached pickup | "Picked up! Heading to stadium..." | 2 sec | Deep Purple |
| Ride completed | "Ride completed! Enjoy the game! 🎉" | 3 sec | Deep Purple.shade700 (#4527A0) |
| Request cancelled | "Request cancelled" | 2 sec | Purple.shade300 |
| Ready after exit | "Ready for next ride!" | 2 sec | Deep Purple |

### 11.3 Info Card Visibility

**Show Condition**:
```
activeRequest != null
AND activeRoute != null
AND selectedCart != null
```

**Hide Condition**:
```
activeRequest == null
OR status == cancelled
OR user tapped Exit
```

**Position**: Top of map, below app bar, 16px margins on left/right

**Content Updates**:
- Distance: Updates in real-time during animation
- ETA: Recalculates based on remaining distance
- Status badge: Updates on status transitions
- Cart name: Static
- Party size: Static (always 1 for demo)

### 11.4 App Bar Elements

**Title**: "Cart Tracker" (left side)

**Theme Toggle Button**:
- Position: Top right
- Type: IconButton
- Icon when light mode: Moon/dark mode icon
- Icon when dark mode: Sun/light mode icon
- Tooltip when light: "Switch to Dark Mode"
- Tooltip when dark: "Switch to Light Mode"
- Action: Toggle theme, reload map style

**Background Color**: Inverse primary color (light grey for light theme, dark for dark theme)

---

## 12. Configuration Constants

### 12.1 App Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Max party size | 5 | Maximum passengers per request |
| Cart capacity | 5 | Seats available per cart |
| Location update filter | 10 meters | Minimum distance change to trigger update |
| Location accuracy | High | Best available accuracy |

### 12.2 Animation Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Speed multiplier | 8.0 | Makes demo 8x faster than realistic |
| Base cart speed | 15 mph | Realistic golf cart speed |
| Effective speed | 120 mph | 15 × 8 = 120 (demo speed) |
| Update interval | 100 ms | Position update frequency |
| Pickup pause duration | 5 seconds | How long to wait at pickup |
| Pickup detection threshold | 20 meters | Distance to consider "reached pickup" |

### 12.3 Map Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Default map type | Normal | Not satellite or terrain |
| Initial camera zoom | 13.5 | Shows entire service area |
| User-centered zoom | 15.0 | When centering on user location |
| Cart-following zoom | 17.0 | When following cart during ride |

---

## 13. Error Handling

### 13.1 Location Errors

| Error Scenario | Behavior |
|----------------|----------|
| Location service disabled | Show snackbar: "Location permission denied. Please enable in settings." (3 sec), disable request button |
| Permission denied (first time) | Show snackbar, disable button, user can retry |
| Permission denied permanently | Show snackbar instructing to enable in Settings app, disable button |
| Location timeout | Return null, show snackbar: "Error getting location", disable button |
| Location unavailable | Show error snackbar with error message, disable button |

### 13.2 API Errors

| Error Scenario | Behavior |
|----------------|----------|
| Directions API returns non-OK status | Show snackbar: "Unable to calculate route. Please try again." (4 sec), abort request, return to ready state |
| Network error (no internet) | Same as API error |
| Invalid API key | Same as API error (logged to console) |
| Malformed response | Same as API error |
| Timeout | Same as API error |

**Important**: Never create a ride request if route calculation fails. User must retry.

### 13.3 Animation Errors

| Error Scenario | Behavior |
|----------------|----------|
| Timer/interval cancelled | Gracefully stop animation, log silently |
| Position calculation error | Log error, continue with last valid position |
| Stream controller closed | Stop animation gracefully |

**Philosophy**: Animation errors should not break the app. Log errors but handle gracefully.

---

## 14. Out of Scope

The following features are **NOT** included in this demo and should not be implemented:

**Backend & Infrastructure**:
- Real backend server or database
- User authentication or accounts
- Payment processing or pricing
- Cloud storage
- Real-time database sync

**Multi-User Features**:
- Multiple simultaneous rides
- Ride history
- User profiles
- Driver interface or driver app
- Cart availability management (all carts always available in demo)

**Advanced Features**:
- Route optimization
- Surge pricing
- Ride sharing (multiple passengers)
- Scheduled rides
- Favorites or saved locations
- Ratings and reviews
- Chat or messaging
- Push notifications

**Production Requirements**:
- Comprehensive error handling for all edge cases
- Analytics or logging
- Crash reporting
- A/B testing
- Feature flags
- Comprehensive unit/integration/e2e tests
- Accessibility features (screen readers, high contrast, etc.)
- Internationalization (i18n)
- Localization (l10n)

**What IS Included** (for clarity):
- Single-user demo
- Mock data (3 hardcoded carts)
- One ride at a time
- Simplified error handling (show snackbars)
- No persistence (state resets on app restart)
- Demo-speed animation (8x realistic speed)

---

## 15. Implementation Notes

### 15.1 Technical Constraints

**Must Haves**:
1. **Real road routing** - No straight-line routes. Must use Google Directions API.
2. **Service area validation** - Must check point-in-polygon before allowing requests.
3. **Graceful permission handling** - Must handle denied permissions without crashing.
4. **Smooth animation** - 100ms updates create smooth motion, no jank.

**Must Not Haves**:
1. **No fallback to straight lines** - If Directions API fails, show error and abort (honest UX).
2. **No mock routes** - All routes must come from real API.
3. **No ignoring permissions** - Respect user's choice, show helpful messages.

### 15.2 Framework-Specific Considerations

**React Native**:
- Use `react-native-maps` for map display
- Use `@react-native-community/geolocation` or Expo Location API
- Polyline decoding: Use `@mapbox/polyline` package
- Custom markers: Render images or use Marker components with custom icons
- Animation: Use `setInterval` or `requestAnimationFrame`, update state

**Flutter**:
- Use `google_maps_flutter` package
- Use `geolocator` for location services
- Use `flutter_polyline_points` for decoding
- Custom markers: Render icons to BitmapDescriptor
- Animation: Use `Stream.periodic` or Timer.periodic

**iOS Native (SwiftUI)**:
- Use MapKit or Google Maps SDK for iOS
- Use CoreLocation for GPS
- Custom markers: MKAnnotationView with custom images
- Animation: Use Timer or CADisplayLink

**Android Native (Kotlin)**:
- Use Google Maps Android API
- Use FusedLocationProviderClient
- Custom markers: BitmapDescriptorFactory with custom drawables
- Animation: Use Handler with Runnable or ValueAnimator

**Key Differences**:
- Map SDK names vary (react-native-maps vs google_maps_flutter vs MapKit)
- Location permission APIs differ by platform
- Custom icon rendering approaches vary
- Animation patterns differ (state updates vs streams vs timers)

**Common Patterns**:
- All use Google Directions API (same REST endpoint)
- All use same Haversine and ray-casting algorithms
- All show same UI elements (just implemented differently)
- All use same colors, sizes, and timing values

### 15.3 Testing Recommendations

**Manual Testing Checklist**:
1. **Permission Denial**
   - Deny location permission on first launch
   - Verify button is disabled
   - Verify snackbar shows
   - Grant permission later, verify button enables

2. **Outside Service Area**
   - Start app outside the polygon boundary
   - Verify warning snackbar shows (4 sec)
   - Verify button shows "Outside Service Area" (red, disabled)
   - Move inside area, verify button enables

3. **Request Flow**
   - Tap "Request Pickup" inside service area
   - Verify nearest cart is selected
   - Verify route appears on map
   - Verify info card shows
   - Verify cart animates smoothly
   - Verify camera follows cart

4. **Pickup Transition**
   - Watch cart animate to pickup location
   - Verify 5-second pause when cart reaches user
   - Verify snackbar: "Picked up! Heading to stadium..."
   - Verify status badge changes to blue "En route to stadium"
   - Verify cart continues to stadium

5. **Completion**
   - Watch cart animate to stadium
   - Verify animation stops at stadium
   - Verify snackbar: "Ride completed! Enjoy the game! 🎉"
   - Verify button changes to "Exit" (blue)
   - Tap Exit, verify state resets

6. **Cancellation**
   - Request pickup
   - Immediately tap "Cancel Request"
   - Verify animation stops
   - Verify route disappears
   - Verify info card hides
   - Verify cart marker returns to original position
   - Verify button returns to "Request Pickup"

7. **API Failure**
   - Disable internet connection
   - Tap "Request Pickup"
   - Verify error snackbar shows
   - Verify no ride is created
   - Re-enable internet, verify can request again

8. **Theme Toggle**
   - Tap theme toggle button (moon icon)
   - Verify map style changes to dark
   - Verify icon changes to sun
   - Tap again, verify returns to light mode

9. **Rapid Button Taps**
   - Rapidly tap "Request Pickup" multiple times
   - Verify only one request is created
   - Verify snackbar: "You already have an active request!"

10. **Cart at Different Locations**
    - Request pickup from different user locations
    - Verify different carts are assigned based on proximity
    - Verify routes change based on starting points

**Edge Cases**:
- User moves significantly during active ride (location updates)
- App backgrounding during animation (should pause/resume)
- Very short routes (ensure animation doesn't overshoot)
- User exactly on service area boundary (edge of polygon)

---

## Appendix: Summary Checklist

Use this checklist to verify your implementation matches the requirements:

**Visual Design**:
- [ ] Deep purple theme (#6A1B9A) used throughout
- [ ] Service area fill: 6% opacity purple (#10AB47BC)
- [ ] Service area border: 2px deep purple (#9C27B0)
- [ ] Cart icons: 30px, deep purple, car symbol, white circle background
- [ ] Stadium icon: 40px, pastel red (#EF9A9A), baseball symbol
- [ ] Route line: 5px, deep purple (#512DA8)
- [ ] Info card: 16px padding, 16px margins, 16px border radius
- [ ] Status badges: Color-coded (grey/orange/blue/green/red)
- [ ] Snackbar colors match specification (purple shades for info/success)

**Functionality**:
- [ ] Location permission requested on launch
- [ ] Continuous location tracking (10m threshold)
- [ ] Service area validation (point-in-polygon)
- [ ] Button states match conditions table
- [ ] Nearest cart assignment (Haversine)
- [ ] Real road routing (Google Directions API)
- [ ] Cart animation at 8x speed (100ms updates)
- [ ] Linear interpolation between polyline points
- [ ] 5-second pause at pickup
- [ ] Status transitions (assigned → inProgress → completed)
- [ ] Camera follows cart at zoom 17.0
- [ ] Info card shows live updates
- [ ] Theme toggle switches map styles

**Data & Logic**:
- [ ] 3 mock carts with correct coordinates
- [ ] Service area polygon: 30 points (31 including closure)
- [ ] Stadium at (39.0978, -84.5086)
- [ ] Haversine formula implemented correctly
- [ ] Ray casting algorithm for point-in-polygon
- [ ] Speed: 15 mph × 8 = 120 mph effective
- [ ] Distance per tick: 5.36448 meters
- [ ] Pickup threshold: 20 meters

**Error Handling**:
- [ ] Location permission denied: Show snackbar, disable button
- [ ] Outside service area: Warning snackbar, button disabled
- [ ] API failure: Error snackbar, abort request
- [ ] No carts available: Error snackbar
- [ ] Already active request: Info snackbar, prevent duplicate

**User Flows**:
- [ ] App initialization: Create polygon, load carts, request location
- [ ] Request pickup: Validate, find cart, calculate route, start animation
- [ ] Pickup: Pause 5 sec, update status, resume animation
- [ ] Completion: Stop animation, show snackbar, change button
- [ ] Cancel: Stop animation, clear state, reset UI
- [ ] Exit: Clear state, return to ready
- [ ] Theme toggle: Load JSON, apply style, update icon

---

**End of Requirements Specification**

Version 1.0 | December 24, 2024 | Ready for Implementation
