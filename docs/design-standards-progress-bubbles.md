# Design Standard: Progress Indicator Bubbles

**Last Updated:** February 21, 2026  
**Status:** ✅ APPROVED - Use this exact design for all multi-step flows

---

## Visual Specification

All progress indicator bubbles across the Boptone platform MUST match the signup page design exactly.

### Bubble Styling

**Active/Completed Steps:**
- Background: `#81e6fe` (bright cyan brand color)
- Border: `2px solid black` (thin black border)
- Text/Icon Color: `black` (NOT white)
- Size: `40px × 40px` (w-10 h-10)
- Shape: Perfect circle (`rounded-full`)

**Inactive/Future Steps:**
- Background: `bg-gray-100` (light gray)
- Border: `2px solid black` (thin black border)
- Text Color: `text-gray-400` (muted gray)
- Size: `40px × 40px` (w-10 h-10)
- Shape: Perfect circle (`rounded-full`)

### Content

**Current Step:**
- Display step number in black text
- Example: "1", "2", "3", "4"

**Completed Steps:**
- Display checkmark icon in black
- Use `lucide-react` Check icon at `w-5 h-5`

**Future Steps:**
- Display step number in gray text

### Labels

**Position:**
- Centered directly below bubble
- Margin top: `mt-2` (8px)
- Use `whitespace-nowrap` to prevent wrapping

**Typography:**
- Font size: `text-sm` (14px)
- Current step: `font-semibold` (bold)
- Other steps: `text-gray-500` (muted)

### Connecting Lines

**Between Bubbles:**
- Height: `h-0.5` (2px)
- Color (completed): `#81e6fe` (matches active bubble)
- Color (incomplete): `#d1d5db` (gray-300)
- Position: `marginTop: '-20px'` to align with bubble centers

---

## Implementation Example

```tsx
<div className="flex items-center justify-between gap-2">
  {[1, 2, 3, 4].map((step, index) => (
    <React.Fragment key={step}>
      <div className="flex flex-col items-center">
        {/* Bubble */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-black transition-all ${
            step <= currentStep
              ? "text-black"
              : "bg-gray-100 text-gray-400"
          }`}
          style={step <= currentStep ? { backgroundColor: '#81e6fe' } : {}}
        >
          {step < currentStep ? <Check className="w-5 h-5" /> : step}
        </div>
        {/* Label below bubble */}
        <span className={`text-sm mt-2 whitespace-nowrap ${step === currentStep ? "font-semibold" : "text-gray-500"}`}>
          {stepLabels[index]}
        </span>
      </div>
      {/* Connecting line */}
      {step < totalSteps && (
        <div
          className={`flex-1 h-0.5 transition-all`}
          style={{ backgroundColor: step < currentStep ? '#81e6fe' : '#d1d5db', marginTop: '-20px' }}
        />
      )}
    </React.Fragment>
  ))}
</div>
```

---

## Where to Apply

This design standard applies to ALL multi-step flows across Boptone:

### Current Implementation
- ✅ `/auth-signup` - Multi-step signup flow (4 steps: Account, Profile, Preferences, Picture)

### Future Implementation Required
- [ ] Music upload flow (if multi-step)
- [ ] Product creation flow in BopShop
- [ ] Onboarding tutorials
- [ ] Workflow builder steps
- [ ] Any other multi-step processes

---

## Design Rationale

**Why Black Text on #81e6fe?**
- Superior contrast and readability
- Maintains brand color prominence
- Professional, modern aesthetic
- Accessibility compliance (WCAG AA)

**Why Thin Black Borders?**
- Creates visual definition
- Prevents bubbles from blending into background
- Adds subtle brutalist design element
- Consistent with Boptone's "softened brutalist" aesthetic

**Why Centered Labels?**
- Improved visual hierarchy
- Easier to scan and understand progress
- Cleaner, more professional appearance
- Better mobile responsiveness

---

## Do NOT Deviate

This design has been approved by the platform owner. Do not modify:
- Border thickness or color
- Text color inside active bubbles
- Background color (#81e6fe)
- Label positioning
- Bubble size or shape

If you need to create a new multi-step flow, copy this exact design pattern.
