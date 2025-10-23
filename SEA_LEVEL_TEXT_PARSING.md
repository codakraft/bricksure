# Sea Level Risk Calculation - Text Parsing Implementation

## Summary

Successfully implemented text parsing to extract **Distance to Sea Level** and **Distance to Water** from the API's `sea_level_assessment` text response, then use these values for accurate flood risk calculation.

## Example API Response

```
"1. Distance to water: 20, Marina, Lagos Island is located directly adjacent to the Lagos Lagoon and is within a few hundred metres of the Atlantic Ocean, making it extremely close to major water bodies. This proximity increases exposure to flooding and sea level rise risks.
2. Distance to sea level: The elevation at 20, Marina, Lagos Island is approximately at or just above sea level, typically ranging from 1 to 3 metres above sea level. This low elevation means the area is highly susceptible to tidal surges and flooding.
3. Distance to sea level: 2 m
4. Distance to water: 50 m"
```

## Parsing Logic

### Regular Expression Patterns

1. **Elevation/Distance to Sea Level**:
   ```javascript
   /(?:distance to sea level|elevation)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
   ```
   - Matches: "Distance to sea level: 2 m" → Extracts `2`
   - Matches: "elevation: 2.5 metres" → Extracts `2.5`

2. **Distance to Water**:
   ```javascript
   /(?:distance to water)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
   ```
   - Matches: "Distance to water: 50 m" → Extracts `50`
   - Matches: "4. Distance to water: 50 m" → Extracts `50`

### Parsing Function

```typescript
const parseDistanceFromText = (text: string): { 
  elevation: number | null; 
  waterDistance: number | null 
} => {
  let elevation: number | null = null;
  let waterDistance: number | null = null;

  // Extract elevation from text
  const elevationMatch = text.match(
    /(?:distance to sea level|elevation)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
  );
  if (elevationMatch) {
    elevation = parseFloat(elevationMatch[1]);
  }

  // Extract distance to water from text
  const waterMatch = text.match(
    /(?:distance to water)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
  );
  if (waterMatch) {
    waterDistance = parseFloat(waterMatch[1]);
  }

  return { elevation, waterDistance };
};
```

## Risk Calculation Flow

### Priority System

1. **Primary**: API fields (`elevation_meters`, `distance_to_sea_level_km`)
2. **Fallback**: Parse from `sea_level_assessment` text
3. **Risk Calculation**: Elevation → Distance to Water → No Risk

### Example 1: Marina, Lagos Island

**Input**:
```json
{
  "sea_level_assessment": "...3. Distance to sea level: 2 m\n4. Distance to water: 50 m"
}
```

**Parsed Values**:
- Elevation: `2` meters
- Distance to Water: `50` meters

**Risk Calculation**:
```typescript
elevationM = 2  // Below 5m
distanceToWaterM = 50  // Less than 100m

// Primary risk from elevation
if (elevationM < 5) {
  seaLevelRisk = 0.40;  // 40% surcharge
  riskCategory = "VERY HIGH";
}

// Additional risk for proximity to water
if (distanceToWaterM < 100) {
  seaLevelRisk += 0.05;  // Additional 5%
}

// Final risk: 45% surcharge
```

**Result**: **45% flood risk surcharge** (40% base + 5% proximity bonus)

### Example 2: Ikeja, Lagos

**Input**:
```json
{
  "sea_level_assessment": "...Distance to sea level: 38 m\nDistance to water: 2500 m"
}
```

**Parsed Values**:
- Elevation: `38` meters
- Distance to Water: `2500` meters (2.5 km)

**Risk Calculation**:
```typescript
elevationM = 38  // Between 20-50m
distanceToWaterM = 2500  // More than 100m

// Primary risk from elevation
if (elevationM < 50) {
  seaLevelRisk = 0.08;  // 8% surcharge
  riskCategory = "LOW";
}

// No additional risk (water distance > 100m)

// Final risk: 8% surcharge
```

**Result**: **8% flood risk surcharge**

### Example 3: Jos, Plateau

**Input**:
```json
{
  "sea_level_assessment": "...Distance to sea level: 1217 m\nDistance to water: 520000 m"
}
```

**Parsed Values**:
- Elevation: `1217` meters
- Distance to Water: `520000` meters (520 km)

**Risk Calculation**:
```typescript
elevationM = 1217  // More than 50m
distanceToWaterM = 520000  // Very far from water

// Primary risk from elevation
if (elevationM >= 50) {
  seaLevelRisk = 0;  // No surcharge
  riskCategory = "VERY LOW";
}

// Final risk: 0% surcharge
```

**Result**: **0% flood risk surcharge** (well elevated)

## Implementation Locations

### 1. Risk Calculation (Lines 1335-1448)

```typescript
if (seaLevelData) {
  // Parse from text if API fields not available
  let elevationM = seaLevelData.elevation_meters;
  let distanceToWaterM: number | null = null;

  if ((!elevationM || elevationM === 0) && seaLevelData.sea_level_assessment) {
    const parsed = parseDistanceFromText(seaLevelData.sea_level_assessment);
    if (parsed.elevation !== null) {
      elevationM = parsed.elevation;
    }
    distanceToWaterM = parsed.waterDistance;
  }

  // Calculate risk based on elevation and proximity to water
  // ...
}
```

### 2. Surcharge Display (Lines 1542-1621)

```typescript
if (seaLevelData) {
  // Same parsing logic for display consistency
  let elevationM = seaLevelData.elevation_meters;
  let distanceToWaterM: number | null = null;

  if ((!elevationM || elevationM === 0) && seaLevelData.sea_level_assessment) {
    const parsed = parseDistanceFromText(seaLevelData.sea_level_assessment);
    // ...
  }

  // Create surcharge entry for breakdown
  if (seaLevelSurcharge > 0) {
    surcharges.push({
      name: `Location ${riskLevel} Surcharge`,
      amount: seaLevelSurcharge,
      type: "percentage",
    });
  }
}
```

### 3. UI Display (Lines 2134-2400)

```typescript
{seaLevelData && !isLoadingSeaLevel && (
  <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
    {(() => {
      // Parse values from assessment text
      const parseDistanceFromText = (text: string) => { /* ... */ };
      
      let elevationM = seaLevelData.elevation_meters;
      let distanceToWaterM: number | null = null;

      if ((!elevationM || elevationM === 0) && seaLevelData.sea_level_assessment) {
        const parsed = parseDistanceFromText(seaLevelData.sea_level_assessment);
        elevationM = parsed.elevation;
        distanceToWaterM = parsed.waterDistance;
      }

      // Display with color-coded risk levels
      return (
        <div className={`p-4 bg-gradient-to-r ${bgGradient} ...`}>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {elevationM && (
              <div>⛰️ Elevation: {elevationM.toFixed(1)}m</div>
            )}
            {distanceToWaterM && (
              <div>💧 Water: {distanceToWaterM < 1000 ? `${distanceToWaterM}m` : `${distanceToWaterM/1000}km`}</div>
            )}
          </div>
        </div>
      );
    })()}
  </div>
)}
```

## Risk Calculation Matrix

| Elevation (m) | Distance to Water | Base Risk | Proximity Bonus | Total Risk | Risk Level |
|--------------|-------------------|-----------|-----------------|------------|------------|
| < 5 | Any | 40% | +5% if <100m | 40-45% | Very High |
| 5-10 | Any | 35% | +5% if <100m | 35-40% | High |
| 10-20 | Any | 20% | +5% if <100m | 20-25% | Medium |
| 20-50 | Any | 8% | +5% if <100m | 8-13% | Low |
| > 50 | Any | 0% | - | 0% | Very Low |

### Fallback (Elevation Not Available)

| Distance to Water (m) | Risk | Risk Level |
|----------------------|------|------------|
| < 100 | 40% | Very High |
| 100-500 | 35% | High |
| 500-1000 | 20% | Medium |
| 1000-5000 | 8% | Low |
| > 5000 | 0% | Very Low |

## Console Logging

For debugging, the system logs:

```javascript
console.log("Sea Level Data - Elevation (m):", elevationM, "Distance to Water (m):", distanceToWaterM);
console.log(`Applied ${riskCategory} flood risk (${seaLevelRisk * 100}%):`, `Elevation: ${elevationM}m`);
console.log("Additional 5% risk added for proximity to water (<100m)");
```

## UI Display Features

### Risk Level Colors

- 🔴 **Red** (Very High/High): Gradient from red to orange
- 🟡 **Yellow** (Medium): Gradient from yellow to amber
- 🔵 **Blue** (Low): Gradient from blue to cyan
- 🟢 **Green** (Very Low): Gradient from green to emerald

### Displayed Metrics

```
⛰️ Elevation: 2.0m
💧 Water: 50m
```

Or if distance is > 1km:
```
⛰️ Elevation: 38.0m
💧 Water: 2.5km
```

## Testing Examples

### Test Case 1: High Risk Coastal Property
**Input**: "Distance to sea level: 2 m, Distance to water: 50 m"
- **Parsed**: elevation=2m, water=50m
- **Result**: 45% surcharge (40% + 5% proximity)
- **Display**: Red gradient, "Very High Flood Risk"

### Test Case 2: Moderate Elevation Property
**Input**: "Distance to sea level: 15 m, Distance to water: 300 m"
- **Parsed**: elevation=15m, water=300m
- **Result**: 20% surcharge
- **Display**: Yellow gradient, "Medium Flood Risk"

### Test Case 3: Well Elevated Property
**Input**: "Distance to sea level: 55 m, Distance to water: 3000 m"
- **Parsed**: elevation=55m, water=3000m
- **Result**: 0% surcharge
- **Display**: Green gradient, "Very Low Risk"

## Benefits

✅ **Accurate Parsing**: Regex patterns handle various text formats
✅ **Dual Metrics**: Uses both elevation and proximity to water
✅ **Smart Fallback**: Works even if API fields are missing
✅ **Proximity Bonus**: Additional 5% for properties <100m from water
✅ **Visual Feedback**: Color-coded UI shows both metrics
✅ **Consistent Logic**: Same parsing used in calculation, display, and breakdown

## Future Enhancements

1. **Multi-language Support**: Adapt regex for different languages
2. **Advanced Patterns**: Handle ranges ("1-3 metres")
3. **Confidence Scoring**: Rate parsing confidence
4. **Historical Data**: Store parsed values in database
5. **Validation**: Cross-check parsed values with known geographic data
