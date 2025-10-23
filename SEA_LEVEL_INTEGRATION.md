# Sea Level Risk Integration Summary

## Overview
Successfully integrated the sea level risk assessment API to dynamically calculate flood risk based on property location and apply it as a risk factor in premium calculations.

## Changes Made

### 1. API Service Fix (`src/services/quotesService.ts`)
- **Fixed** the `getSeaLevel` mutation to properly pass the location parameter
- Changed from hardcoded `body: { location }` to `body` parameter

```typescript
getSeaLevel: builder.mutation<SeaLevelResponse, { location: string }>({
  query: (body) => ({
    url: "https://location-risks-service.vercel.app/sea-level",
    method: "POST",
    body,
  }),
}),
```

### 2. Component Updates (`src/pages/Dashboard/GetQuote2.tsx`)

#### Imports & Hooks
- Added `useGetSeaLevelMutation` import
- Initialized the hook: `const [getSeaLevel, { data: seaLevelData }] = useGetSeaLevelMutation();`
- Added logging for sea level data

#### Address Selection Handler
When a user selects an address from Google Places autocomplete:
1. Calls the `getSeaLevel` API with the formatted address
2. Shows a toast notification: "Analyzing location flood risk..."
3. Stores the response in `seaLevelData` state

```typescript
onChange={async (value, placeDetails) => {
  handleAnswer(currentQuestion.id, value);
  if (placeDetails && placeDetails.formatted_address) {
    try {
      await getSeaLevel({ location: placeDetails.formatted_address });
      addToast({
        type: "info",
        title: "Location Risk Assessment",
        message: "Analyzing location flood risk...",
      });
    } catch (error) {
      console.error("Error fetching sea level data:", error);
    }
  }
}}
```

#### Premium Calculation Integration
Added sea level risk calculation in the `calculatePremium` function:

**Risk Tiers Based on Assessment:**
- **High Risk** (very high/high): 35% surcharge
- **Medium Risk** (moderate): 20% surcharge  
- **Low Risk**: 8% surcharge
- **Very Low Risk** (minimal): 0% (no surcharge)

```typescript
if (seaLevelData?.sea_level_assessment) {
  const assessment = seaLevelData.sea_level_assessment.toLowerCase();
  
  if (assessment.includes("high risk") || assessment.includes("very high")) {
    totalRiskModifier += 0.35; // 35% surcharge
  } else if (assessment.includes("medium risk") || assessment.includes("moderate")) {
    totalRiskModifier += 0.20; // 20% surcharge
  } else if (assessment.includes("low risk") && !assessment.includes("very low")) {
    totalRiskModifier += 0.08; // 8% surcharge
  }
}
```

#### Premium Breakdown Display
Added sea level risk to the surcharges array for display in the premium breakdown:

```typescript
if (seaLevelData?.sea_level_assessment) {
  // Determines the risk level and adds appropriate surcharge display
  surcharges.push({
    name: `Location ${riskLevel} Surcharge`,
    amount: seaLevelSurcharge,
    type: "percentage" as const,
  });
}
```

#### Dependency Management
- Added `seaLevelData` to the `calculatePremium` useCallback dependencies
- Premium automatically recalculates when sea level data is received

## User Flow

1. **User enters property location question**
   - Starts typing in Google Places autocomplete input
   
2. **User selects an address**
   - Address is saved to quiz state
   - API call to sea level service is triggered
   - Toast notification appears: "Analyzing location flood risk..."
   
3. **Sea level data is received**
   - Response stored in `seaLevelData` state
   - Contains: `location`, `sea_level_assessment`, `success`, `error`
   
4. **Premium calculation is triggered**
   - Risk modifier calculated based on assessment level
   - Applied to both subtotal and total (dual risk application)
   - Displayed in premium breakdown as "Location [Risk Level] Surcharge"

5. **User sees updated premium**
   - Premium increases based on flood risk
   - Breakdown shows specific surcharge percentage
   - Console logs show detailed calculation steps

## Example Scenarios

### Scenario 1: High Flood Risk Property
- **Location:** "1 Victoria Island, Lagos"
- **Assessment:** "High Risk - Property is close to sea level"
- **Impact:** +35% surcharge on premium
- **Display:** "Location High Flood Risk Surcharge (35%)"

### Scenario 2: Medium Flood Risk Property
- **Location:** "15 Banana Island, Lagos"
- **Assessment:** "Medium Risk - Moderate elevation"
- **Impact:** +20% surcharge on premium
- **Display:** "Location Medium Flood Risk Surcharge (20%)"

### Scenario 3: Low Risk Property
- **Location:** "10 Maitama, Abuja"
- **Assessment:** "Low Risk - Elevated area"
- **Impact:** +8% surcharge on premium
- **Display:** "Location Low Flood Risk Surcharge (8%)"

### Scenario 4: Very Low Risk Property
- **Location:** "5 Highlands, Jos"
- **Assessment:** "Very Low Risk - Significantly elevated"
- **Impact:** No surcharge (0%)
- **Display:** No additional surcharge shown

## Technical Details

### API Response Structure
```typescript
interface SeaLevelResponse {
  location: string;
  sea_level_assessment: string;
  success: boolean;
  error: null;
}
```

### Risk Calculation Logic
- Sea level risk is additive to the `totalRiskModifier`
- Applied twice (dual risk system):
  1. To subtotal (before discounts/surcharges)
  2. To final total (after all additions)
- Combined with other risk factors (age, material, condition, etc.)

### Console Logging
For debugging, the following logs are available:
- "Sea Level Data:" - Shows API response
- "Sea Level Assessment:" - Shows the assessment string
- "Applied [LEVEL] sea level risk:" - Shows applied percentage
- "Total Risk Modifier (as percentage):" - Shows cumulative risk

## Error Handling

- API call wrapped in try-catch
- Errors logged to console
- Premium calculation continues even if sea level data unavailable
- No surcharge applied if API fails or returns no data

## Future Enhancements

1. **Caching**: Store sea level data per location to avoid repeated API calls
2. **Visual Indicators**: Show flood risk badge/icon in the UI
3. **Map Integration**: Display property location on a flood risk map
4. **Historical Data**: Show past flood incidents in the area
5. **Custom Risk Tiers**: Allow insurance admins to configure risk percentages
6. **Discount for Mitigation**: Reduce surcharge if property has flood barriers

## Testing

To test the integration:

1. Navigate to Dashboard → Get Quote
2. Progress through questions until "Enter Property Location"
3. Type an address in Nigeria (e.g., "Victoria Island, Lagos")
4. Select an address from the dropdown
5. Check console for "Analyzing location flood risk..." toast
6. Continue to see premium breakdown with flood risk surcharge
7. Verify the surcharge appears in the premium calculation

## Notes

- Sea level API endpoint: `https://location-risks-service.vercel.app/sea-level`
- Risk percentages are configurable (currently hardcoded in component)
- Future: Move risk tiers to charges API for dynamic configuration
- The assessment string is case-insensitive for matching
