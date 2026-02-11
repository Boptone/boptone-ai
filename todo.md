# Boptone TODO

## Complete Auth-Signup Improvements (User Request)

### Phase 1: Add "Have an account? Sign in" Link
- [x] Add top-right "Have an account? Sign in" link to AuthSignup page
- [x] Style link to match Brex aesthetic (gray text, simple styling)
- [x] Link to appropriate sign-in page (/login)

### Phase 2: Implement Multi-Step Form Flow
- [ ] Design multi-step flow structure (basic info → verification → complete)
- [ ] Add progress indicators matching Brex minimal style
- [ ] Implement smooth transitions between steps
- [ ] Add back/forward navigation between steps

### Phase 3: Add Form Validation and Error States
- [ ] Implement real-time form validation
- [ ] Add error messages with minimal aesthetic (gray text, no red)
- [ ] Add success states for valid inputs
- [ ] Ensure all validation matches Brex style

### Phase 4: Cross-Reference All Auth Pages
- [ ] Find all auth-related pages (AuthSignup, Signup, Login, etc.)
- [ ] Audit each page for design consistency
- [ ] Standardize all auth pages to match Brex aesthetic
- [ ] Ensure consistent typography, spacing, button styles

### Phase 5: Testing and Delivery
- [ ] Test complete signup flow
- [ ] Test signin flow
- [ ] Verify all auth pages match Brex aesthetic
- [ ] Save checkpoint
- [ ] Push to GitHub

## Create Forgot Password Page (User Request)

- [x] Create ForgotPassword.tsx component with Brex-inspired design
- [x] Implement email input form with validation
- [x] Add password reset flow (email → verification → success)
- [x] Add route to App.tsx (/forgot-password)
- [x] Link from AuthSignup page
- [x] Test forgot password flow
- [ ] Save checkpoint
