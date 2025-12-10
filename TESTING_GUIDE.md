# Insurance Sales Tool - Comprehensive Testing Guide

## Overview
This guide provides step-by-step testing procedures for the Insurance Sales Tool.

## Test Data Generation

Use the provided `generate_test_data.py` script to create Excel test files:

```bash
python generate_test_data.py
```

This will generate several test files:
- `test_data_valid.xlsx` - Standard valid test case
- `test_data_edge_cases.xlsx` - Edge cases (very young/old clients, boundary incomes)
- `test_data_missing_sheets.xlsx` - Missing required sheets (should fail)
- `test_data_empty.xlsx` - Empty sheets (should fail gracefully)

## Phase 1: Functional Testing

### 1.1 File Upload Flow

**Test Case 1: Valid Excel File**
- [ ] Upload `test_data_valid.xlsx`
- [ ] Expected: File processes successfully, redirects to dashboard
- [ ] Verify: All 5 sheets loaded (Clients, Products, Policies, SalesReps, CommissionRules)
- [ ] Verify: No console errors

**Test Case 2: Missing Sheets**
- [ ] Upload file with only 3 sheets
- [ ] Expected: Clear error message indicating which sheets are missing
- [ ] Verify: User-friendly error dialog (not just console error)

**Test Case 3: Empty Sheets**
- [ ] Upload file with empty "Clients" sheet
- [ ] Expected: Error message "No client data provided"
- [ ] Verify: Application doesn't crash

**Test Case 4: Malformed Data**
- [ ] Upload file with missing columns (e.g., no "ClientID" column)
- [ ] Expected: Graceful error handling
- [ ] Verify: Helpful error message

**Test Case 5: Library Load Failure**
- [ ] Block CDN in browser DevTools Network tab
- [ ] Reload page
- [ ] Expected: Error message with Retry button
- [ ] Click Retry
- [ ] Expected: Attempts to reload library

### 1.2 Dashboard Display

**Test Case 6: KPI Calculations**
- [ ] Upload valid test data
- [ ] Verify: Total Potential Commission = sum of top 30 opportunities' estimated commissions
- [ ] Verify: Target Progress = (Total Commission / €5,000) * 100
- [ ] Verify: Critical Count = opportunities with score >= 95
- [ ] Verify: High Count = opportunities with score 85-94
- [ ] Verify: Est. Closed Deals = Total Opps * 0.25
- [ ] Verify: Daily Target = €5,000 / 20 = €250

**Test Case 7: Progress Bar**
- [ ] Check progress bar width matches percentage
- [ ] Verify: Doesn't exceed 100% width
- [ ] Test with 0 opportunities (should show 0%)
- [ ] Test with > €5,000 potential (should cap at 100%)

**Test Case 8: Goal Section Expand/Collapse**
- [ ] Click goal section header
- [ ] Expected: Section expands with detailed stats
- [ ] Click again
- [ ] Expected: Section collapses
- [ ] Verify: Chevron icon rotates correctly

### 1.3 Filtering & Search

**Test Case 9: Search Functionality**
- [ ] Type client name in search box
- [ ] Expected: Results filter in real-time
- [ ] Verify: Case-insensitive search works
- [ ] Search for product name
- [ ] Expected: Shows opportunities with that product
- [ ] Clear search
- [ ] Expected: All opportunities return

**Test Case 10: Category Filter**
- [ ] Select "Life" from category dropdown
- [ ] Expected: Only Life insurance opportunities shown
- [ ] Verify: Top 3 list updates correctly
- [ ] Select "All Categories"
- [ ] Expected: All opportunities return

**Test Case 11: Priority Filter**
- [ ] Select "Critical Only"
- [ ] Expected: Only opportunities with score >= 95
- [ ] Select "High Priority"
- [ ] Expected: Only opportunities with score 85-94
- [ ] Select "All Priority"
- [ ] Expected: All opportunities shown

**Test Case 12: Combined Filters**
- [ ] Apply search + category + priority filters simultaneously
- [ ] Expected: Results match ALL filter criteria (AND operation)
- [ ] Click "Clear filters" button
- [ ] Expected: All filters reset

**Test Case 13: Sales Rep Filter**
- [ ] Select specific sales rep from dropdown
- [ ] Expected: Only that rep's opportunities shown
- [ ] Verify: KPIs recalculate for filtered set
- [ ] Select "All Sales Reps"
- [ ] Expected: All opportunities return

### 1.4 Client Detail View

**Test Case 14: Navigation**
- [ ] Click on opportunity card from dashboard
- [ ] Expected: Navigates to client detail view
- [ ] Verify: Client name shown in header
- [ ] Click "Back" button
- [ ] Expected: Returns to dashboard
- [ ] Verify: Previous filters preserved

**Test Case 15: Client Information Display**
- [ ] Verify all client data displays:
  - [ ] Client name with initials avatar
  - [ ] Persona badge with correct color
  - [ ] Age, income, city, sales rep
  - [ ] Product recommendation
- [ ] Verify scoring breakdown:
  - [ ] Need Score
  - [ ] Fit Score
  - [ ] Commission %
  - [ ] Estimated Commission

**Test Case 16: Premium Calculations**
- [ ] Verify annual premium matches (Min + Max) / 2 from product data
- [ ] Verify monthly premium = Annual / 12 (rounded)
- [ ] Check affordability ratio matches income band

**Test Case 17: Consultative Talking Points**
- [ ] Verify 5 talking points generated:
  - [ ] Build Rapport
  - [ ] Discovery
  - [ ] Value Positioning
  - [ ] Create Urgency
  - [ ] Assumptive Close
- [ ] Check personalization (uses client name)
- [ ] Verify urgency message changes for age >= 50 vs < 50

**Test Case 18: Objection Handlers**
- [ ] Verify 3 objection handlers display
- [ ] Check objection text in amber color
- [ ] Check response text readable
- [ ] Verify dynamic data (premium amounts) calculated correctly

### 1.5 Quick Actions (CRITICAL BUG FIXES REQUIRED)

**Test Case 19: Call Client Button**
- [ ] Click "Call Client" button
- [ ] **CURRENT BUG**: Button does nothing
- [ ] **EXPECTED BEHAVIOR**: Should open tel: link or show phone number modal
- [ ] **FIX NEEDED**: Implement click handler

**Test Case 20: Send Email Button**
- [ ] Click "Send Email" button
- [ ] Expected: Email template copied to clipboard
- [ ] Verify: Confirmation message shown
- [ ] Paste into text editor
- [ ] Verify: Template includes client name, product, pricing

**Test Case 21: Schedule Button**
- [ ] Click "Schedule" button
- [ ] **CURRENT BUG**: Button does nothing
- [ ] **EXPECTED BEHAVIOR**: Should open calendar link or scheduling modal
- [ ] **FIX NEEDED**: Implement click handler

**Test Case 22: Mark Contacted Button**
- [ ] Click "Mark Contacted" button
- [ ] **CURRENT BUG**: Button does nothing
- [ ] **EXPECTED BEHAVIOR**: Should update opportunity status, show confirmation
- [ ] **FIX NEEDED**: Implement state management for contacted status

### 1.6 Persona Classification Logic

**Test Case 23: Income Boundaries**
- [ ] Client with income = '100k-150k'
- [ ] Expected: Classified as "High Net Worth" (income > 100k)
- [ ] Client with income = '75k-100k'
- [ ] Expected: Age-based classification (not HNW)

**Test Case 24: Age Boundaries**
- [ ] Client age = 65
- [ ] Expected: "Retiree"
- [ ] Client age = 64, income < 100k
- [ ] Expected: "Pre-Retiree"
- [ ] Client age = 55
- [ ] Expected: "Pre-Retiree"
- [ ] Client age = 54, income < 100k
- [ ] Expected: "Established Household"

**Test Case 25: Edge Cases**
- [ ] Client age = 18, income = '<20k'
- [ ] Expected: "Young Professional"
- [ ] Client age = 90, income = '150k+'
- [ ] Expected: "High Net Worth" (income takes precedence)
- [ ] Client with null/undefined income
- [ ] Expected: Defaults to lowest bracket, doesn't crash

### 1.7 Gap Analysis Engine

**Test Case 26: Essential vs Optional Coverage**
- [ ] Young Professional with 0 policies
- [ ] Expected: Essential = [Health, Car, Liability, Life]
- [ ] Expected: Optional = [Travel, Electronics]
- [ ] Verify: All missing essential coverage gets needScore = 95
- [ ] Verify: All missing optional coverage gets needScore = 70

**Test Case 27: Existing Coverage**
- [ ] Growing Family with Health and Car policies
- [ ] Expected: Gaps = Home, Life, Income, Liability (essential)
- [ ] Expected: No Health or Car opportunities (already covered)

**Test Case 28: Complete Coverage**
- [ ] Client with all essential policies
- [ ] Expected: Only optional coverage opportunities
- [ ] Expected: Lower scores overall

### 1.8 Opportunity Scoring Algorithm

**Test Case 29: Affordability Calculation**
- [ ] Opportunity: Premium = €1,000, Client income = €100,000
- [ ] Ratio = 1%, Expected: fitScore = 100
- [ ] Opportunity: Premium = €2,000, Client income = €100,000
- [ ] Ratio = 2%, Expected: fitScore = 100
- [ ] Opportunity: Premium = €3,000, Client income = €100,000
- [ ] Ratio = 3%, Expected: fitScore ≈ 80
- [ ] Opportunity: Premium = €15,000, Client income = €100,000
- [ ] Ratio = 15%, Expected: fitScore = 20 (borderline)

**Test Case 30: Ethical Filters**
- [ ] Opportunity with needScore = 25
- [ ] Expected: FILTERED OUT (< 30)
- [ ] Opportunity with premium/income = 16%
- [ ] Expected: FILTERED OUT (> 15%)
- [ ] Opportunity with premium/income = 15% exactly
- [ ] Expected: INCLUDED (at boundary)

**Test Case 31: Renewal Boost**
- [ ] Renewal opportunity with base score = 80
- [ ] Expected: Final score = 80 * 1.15 = 92
- [ ] Verify: "Renewal" badge displayed
- [ ] Verify: needScore = 90 for renewals

**Test Case 32: Weighted Score Formula**
- [ ] Manually calculate for sample opportunity:
  - needScore = 95, fitScore = 100, commissionScore = 80, conversionScore = 70, balanceScore = 87
  - Expected: (95 * 0.30) + (100 * 0.25) + (87 * 0.30) + (70 * 0.15) = 89.6
- [ ] Verify: Matches application calculation

### 1.9 Renewal Detection

**Test Case 33: Age Thresholds**
- [ ] Policy from 6 months ago
- [ ] Expected: NOT a renewal opportunity
- [ ] Policy from 12 months ago
- [ ] Expected: IS a renewal opportunity
- [ ] Policy from 24 months ago
- [ ] Expected: IS a renewal opportunity (high priority)

**Test Case 34: Better Products**
- [ ] Client has "Basic Life" policy from 18 months ago
- [ ] Expected: Renewal opportunity for "Premium Life" policy
- [ ] Expected: Renewal needScore = 90
- [ ] Expected: 15% score boost applied

### 1.10 Responsive Design

**Test Case 35: Mobile Viewport (375px)**
- [ ] Resize browser to 375px width
- [ ] Verify: All text readable
- [ ] Verify: Buttons minimum 48px tap target
- [ ] Verify: No horizontal scrolling
- [ ] Verify: Cards stack vertically
- [ ] Verify: Sidebar hidden, content uses full width

**Test Case 36: Tablet Viewport (768px)**
- [ ] Resize browser to 768px width
- [ ] Verify: Layout adjusts appropriately
- [ ] Verify: Some grid items side-by-side

**Test Case 37: Desktop Viewport (1920px)**
- [ ] Resize browser to 1920px width
- [ ] Verify: Sidebar visible
- [ ] Verify: Content uses remaining space
- [ ] Verify: Grid layouts maximize space

### 1.11 Performance

**Test Case 38: Large Dataset (1,000 clients)**
- [ ] Generate test data with 1,000 clients
- [ ] Upload file
- [ ] Measure: Time from upload to dashboard render
- [ ] Expected: < 5 seconds
- [ ] Verify: No browser freezing
- [ ] Verify: Smooth scrolling

**Test Case 39: Filtering Performance**
- [ ] With 10,000 opportunities
- [ ] Type in search box
- [ ] Measure: Time to filter results
- [ ] Expected: < 100ms response
- [ ] Verify: No lag while typing

**Test Case 40: Memory Leaks**
- [ ] Open DevTools > Memory tab
- [ ] Take heap snapshot
- [ ] Navigate between dashboard and client detail 50 times
- [ ] Take another heap snapshot
- [ ] Expected: Memory usage relatively stable (no unbounded growth)

### 1.12 Error Handling

**Test Case 41: Network Errors**
- [ ] Disable internet
- [ ] Try to load page (XLSX library will fail)
- [ ] Expected: Clear error message
- [ ] Expected: Retry button available
- [ ] Re-enable internet
- [ ] Click Retry
- [ ] Expected: Library loads successfully

**Test Case 42: Data Validation**
- [ ] Upload file with ClientID as string instead of number
- [ ] Expected: Graceful handling or type coercion
- [ ] Upload file with invalid income band "Unknown"
- [ ] Expected: Error message or default to lowest bracket

**Test Case 43: Null/Undefined Values**
- [ ] Client record with null Age field
- [ ] Expected: Doesn't crash, uses default or skips
- [ ] Product with undefined premium values
- [ ] Expected: Doesn't crash, skips or shows N/A

## Bug Fixes Required

### Priority 1: Quick Actions
1. **Call Client**: Implement tel: link or phone modal
2. **Schedule**: Implement calendar integration or scheduling modal
3. **Mark Contacted**: Add state management and UI feedback

### Priority 2: Error Handling
1. Add try-catch blocks around all data processing
2. Show user-friendly error dialogs instead of alerts
3. Add loading states during processing
4. Validate Excel data format before processing

### Priority 3: User Feedback
1. Add toast notification system
2. Add confirmation dialogs for actions
3. Show empty states with helpful messages
4. Improve error messages with actionable steps

## Success Criteria

- [ ] All 43 test cases pass
- [ ] Zero console errors during normal operation
- [ ] All Quick Actions functional
- [ ] Graceful error handling for all edge cases
- [ ] Responsive on mobile, tablet, desktop
- [ ] Performance targets met (< 5s load, < 100ms filter)
- [ ] No memory leaks detected
- [ ] User-friendly error messages throughout

## Next Steps

After Phase 1 testing passes:
1. Move to Phase 2: Advanced Features
2. Implement Life Event Detection
3. Implement Tiered Proposals
4. Add Meeting Preparation Mode
5. And continue with remaining features...
