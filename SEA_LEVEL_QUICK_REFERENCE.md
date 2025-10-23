# Sea Level Risk Integration - Quick Reference

## 🎯 What Was Done

Integrated real-time flood risk assessment based on property location, automatically applying risk surcharges to insurance premiums.

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER ENTERS PROPERTY LOCATION                           │
│     └─ Types address in Google Places input                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. USER SELECTS ADDRESS                                     │
│     └─ Formatted address captured                            │
│     └─ Place details extracted                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. API CALL TO SEA LEVEL SERVICE                           │
│     POST: location-risks-service.vercel.app/sea-level       │
│     Body: { location: "formatted address" }                  │
│     └─ Toast: "Analyzing location flood risk..."            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. RECEIVE SEA LEVEL ASSESSMENT                            │
│     Response: {                                              │
│       location: "1 Victoria Island, Lagos",                  │
│       sea_level_assessment: "High Risk - Close to sea",      │
│       success: true                                          │
│     }                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. CALCULATE RISK MODIFIER                                 │
│     Assessment → Risk Percentage:                            │
│     ┌──────────────────────┬─────────────┐                 │
│     │ High/Very High Risk  │ +35%        │                 │
│     │ Medium/Moderate Risk │ +20%        │                 │
│     │ Low Risk             │ +8%         │                 │
│     │ Very Low/Minimal     │ 0%          │                 │
│     └──────────────────────┴─────────────┘                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. APPLY TO PREMIUM CALCULATION                            │
│     totalRiskModifier += seaLevelRisk                        │
│     ├─ Applied to subtotal (before discounts)               │
│     └─ Applied to total (after all additions)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  7. DISPLAY IN PREMIUM BREAKDOWN                            │
│     Surcharges:                                              │
│     └─ "Location High Flood Risk Surcharge (35%)"           │
│     Premium recalculated automatically                       │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Risk Tier Breakdown

| Assessment Level | Risk % | Example Impact (₦50,000 base) | Typical Locations |
|-----------------|--------|--------------------------------|-------------------|
| **High Risk** | 35% | +₦17,500 | Victoria Island, Lekki (low-lying coastal) |
| **Medium Risk** | 20% | +₦10,000 | Banana Island, parts of Ajah |
| **Low Risk** | 8% | +₦4,000 | Ikeja, Surulere (moderate elevation) |
| **Very Low Risk** | 0% | ₦0 | Maitama Abuja, Jos (highlands) |

## 💻 Code Locations

### Files Modified
1. **`src/services/quotesService.ts`** - Fixed API endpoint
2. **`src/pages/Dashboard/GetQuote2.tsx`** - Main integration

### Key Sections in GetQuote2.tsx

#### 1. Import & Hook (Lines ~58, ~136)
```typescript
import { useGetSeaLevelMutation } from "../../services/quotesService";
const [getSeaLevel, { data: seaLevelData }] = useGetSeaLevelMutation();
```

#### 2. Address Selection Handler (Lines ~1898-1920)
```typescript
onChange={async (value, placeDetails) => {
  if (placeDetails?.formatted_address) {
    await getSeaLevel({ location: placeDetails.formatted_address });
  }
}}
```

#### 3. Risk Calculation (Lines ~1320-1355)
```typescript
if (seaLevelData?.sea_level_assessment) {
  const assessment = seaLevelData.sea_level_assessment.toLowerCase();
  if (assessment.includes("high risk")) {
    totalRiskModifier += 0.35;
  }
  // ... other risk levels
}
```

#### 4. Surcharge Display (Lines ~1480-1510)
```typescript
surcharges.push({
  name: `Location ${riskLevel} Surcharge`,
  amount: seaLevelSurcharge,
  type: "percentage" as const,
});
```

## 🧪 Testing Checklist

- [ ] API call triggers when address is selected
- [ ] Toast notification appears: "Analyzing location flood risk..."
- [ ] Sea level data logged to console
- [ ] Risk percentage calculated correctly
- [ ] Premium increases based on risk level
- [ ] Surcharge appears in premium breakdown
- [ ] Premium recalculates when sea level data updates
- [ ] Error handling works if API fails
- [ ] Works with different Nigerian locations

## 🎨 UI/UX Flow

1. **Before Selection**: Regular text input with Google Places suggestions
2. **During Selection**: User picks address from dropdown
3. **After Selection**: 
   - Toast appears (blue info notification)
   - API call happens in background
   - Premium sidebar updates automatically
4. **In Breakdown**: New line item shows flood risk surcharge

## 🔍 Debugging

**Console Logs to Check:**
```
Charges Data: {...}
Sea Level Data: { location: "...", sea_level_assessment: "...", success: true }
Sea Level Assessment: "high risk - property is close to sea level"
Applied HIGH sea level risk: 0.35
Total Risk Modifier (as percentage): 0.45
Initial Subtotal (before risk adjustment): 55000
Risk Adjustment on Subtotal: 24750
...
```

**Network Tab:**
- Check POST request to `location-risks-service.vercel.app/sea-level`
- Verify request body contains location
- Check response contains assessment

## ⚠️ Important Notes

- **Dual Risk Application**: Risk applied twice (subtotal + total) for compounding effect
- **Additive**: Sea level risk adds to existing risk modifiers (age, material, etc.)
- **Real-time**: Premium updates automatically when sea level data arrives
- **Fallback**: No surcharge if API fails or returns no data
- **Case-insensitive**: Assessment matching works regardless of text case

## 🚀 Next Steps (Optional)

1. Move risk percentages to charges API for dynamic configuration
2. Add visual flood risk indicator (color-coded badge)
3. Cache sea level assessments to reduce API calls
4. Show flood risk on a map visualization
5. Allow users to add flood mitigation measures for discounts
