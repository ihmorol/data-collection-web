# Frontend Component Reference

## Core components

### `NavBar`

File: `src/components/NavBar.tsx`

Props:

1. `variant`: `user | admin`
2. `username?`
3. `currentPage?`
4. `rightBadge?`

Behavior:

1. Calculates active nav link based on pathname/current page.
2. Handles logout with optimistic redirect to login.
3. Supports mobile menu state.

### `MemeCard`

File: `src/components/MemeCard.tsx`

Props:

1. `imageName`
2. `displayOrder`
3. `reviewed`
4. `onClick`

Behavior:

1. Encodes image filename for URL safety.
2. Shows check icon if reviewed else empty circle icon.
3. Provides hover elevation animation.

### `ProgressBar`

File: `src/components/ProgressBar.tsx`

Props:

1. `completed`
2. `total`

Behavior:

1. Avoids divide-by-zero via safe total fallback.
2. Caps completion percent at 100.
3. Runs growth animation with keyframes.

### `SurveyForm`

File: `src/components/SurveyForm.tsx`

Output model (`SurveyAnswers`):

1. `perception`
2. `is_offensive`
3. `contains_vulgarity`
4. `primary_target`
5. `moderation_decision`

Behavior:

1. Normalizes initial answers for edit/prefill mode.
2. Emits `onChange(answers, isComplete)` on each update.
3. Uses `RadioCards` for 4 question groups.
4. Uses explicit button group for moderation decision.

## UI primitives

### `AgeInput`

File: `src/components/ui/AgeInput.tsx`

1. Clamps values to min/max.
2. Supports plus/minus controls and typed input.
3. Shows inline error text.

### `GlowButton`

File: `src/components/ui/GlowButton.tsx`

1. Reuses global `glow-button` class.
2. Supports loading spinner and disabled state merging.

### `RadioCards`

File: `src/components/ui/RadioCards.tsx`

1. Supports `horizontal` and `grid` layouts.
2. Supports `card` and `pill` variants.
3. Implements keyboard arrow navigation.
4. Exposes ARIA radio semantics.

### `SegmentedPills`

File: `src/components/ui/SegmentedPills.tsx`

1. Option list rendered as mutually exclusive radio-like buttons.
2. Supports left/right arrow cycling.
3. Designed for compact demographic option selection.

### `SliderInput`

File: `src/components/ui/SliderInput.tsx`

1. Integer range slider with value bubble.
2. Gradient track fill based on value percentage.
3. Tick marks for min/mid/max.

### `Skeleton`

File: `src/components/ui/Skeleton.tsx`

1. Generic shimmer loading placeholder.
2. Size and shape controlled by className.

### `Toast` + `showToast`

File: `src/components/ui/Toast.tsx`

1. In-memory listener bus for toast events.
2. Auto-dismiss timer per toast.
3. Supports `success`, `error`, `info` variants.
4. Renders top-right fixed viewport.
