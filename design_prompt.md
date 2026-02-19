# Web3 Hero Section Design Prompt

Use the following prompt to recreate the Web3 landing page hero section design:

---

**Task:** Build a high-end, responsive Web3 landing page hero section.

**Design System & Core Styles:**
*   **Font:** "General Sans" from Fontshare (Weights: 400, 500, 600, 700). Use for all text.
*   **Background:** Pure black (`#000000`) with a full-screen looping background video.
    *   **Video Behavior:** Muted, autoplay, loop, playsInline.
    *   **Video Overlay:** Apply a 50% black overlay (`bg-black/50`) on top of the video for readability.
    *   **Video URL:** `d8j0ntlcm91z4.cloudfront.net/user_38xzZboKV…` (Note: Ensure the full correct URL is used).
*   **Layout:** All content sits on top of the video in a centered layout.

**Navbar Component:**
*   **Position:** Fixed or absolute top, transparent background.
*   **Padding:** 120px horizontal, 20px vertical.
*   **Left Side:**
    *   **Logo:** Placeholder "LOGOIPSUM" wordmark (White, 187px x 25px).
    *   **Nav Links:** "Get Started", "Developers", "Features", "Resources".
        *   **Style:** White, 14px, Medium weight.
        *   **Icon:** Small white chevron-down arrow to the right of each link (14px gap).
        *   **Spacing:** 30px gap between links.
        *   **Mobile:** Hidden on screens smaller than md breakpoint.
*   **Right Side:**
    *   **CTA Button:** "Join Waitlist"
        *   **Style:** Layered pill shape.
        *   **Outer:** Thin 0.6px solid white border.
        *   **Inner:** Black background, white text (14px, font-medium).
        *   **Padding:** 29px horizontal, 11px vertical.
        *   **Effect:** Subtle white glow/light streak styling element at the top edge (blurred white-to-transparent gradient).

**Hero Content (Centered):**
*   **Positioning:** Vertically centered but pushed down (approx. 280px top padding desktop / 200px mobile). 102px bottom padding.
*   **Stacking:** Elements centered horizontally, stacked vertically with `40px` gaps.

1.  **Badge / Pill:**
    *   **Shape:** Rounded pill (20px radius).
    *   **Style:** 10% white background, 1px border (white at 20% opacity).
    *   **Content:**
        *   Tiny 4px white dot.
        *   Text: "Early access available from" (White, 60% opacity).
        *   Date: "May 1, 2026" (Solid White).
        *   Font: 13px, Medium.

2.  **Hero Heading:**
    *   **Text:** "Web3 at the Speed of Experience"
    *   **Typography:** 56px (Desktop) / 36px (Mobile), Medium weight, 1.28 line-height.
    *   **Gradient Fill:** Linear gradient at ~144.5 degrees.
        *   Starts solid white at ~28%.
        *   Fades to fully transparent black at ~115%.
    *   **Width:** Max-width 613px.

3.  **Subtitle:**
    *   **Text:** "Powering seamless experiences and real-time connections, EOS is the base for creators who move with purpose, leveraging resilience, speed, and scale to shape the future."
    *   **Typography:** 15px, Normal weight, White at 70% opacity.
    *   **Width:** Max-width 680px, centered.

4.  **Main CTA:**
    *   **Text:** "Join Waitlist"
    *   **Style:** Same construction as Navbar button, BUT **White Background** with **Black Text**.
    *   **Details:** 0.6px white outer border, white glow streak on top, 14px Medium.

**Responsiveness:**
*   Ensure text scales down on mobile.
*   Adjust padding (200px top on mobile).
*   Hide nav links on mobile.
