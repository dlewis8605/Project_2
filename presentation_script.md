# AURA: Live Demo & Presentation Script

This script accompanies the generated PowerPoint presentation (`presentation.pptx`) and walks you through a professional demonstration of **AURA — The Curated UX/UI Asset Catalog** for your instructor.

---

## Part 1: Slide Presentation Guide

### Slide 1: Cover (AURA — UX/UI Asset Catalog)
* **What to say:**
  > "Hello, my name is Darell, and today I am excited to present my Course Project: AURA. AURA is a premium, curated digital asset catalog designed to host, showcase, and distribute high-quality UI assets such as glassmorphic CSS components, SASS mixins, custom color palettes, and SVG icons. It was built using Node.js, Express, MongoDB, Vue.js, and Bootstrap 4, with robust OWASP security mechanisms and offline PWA functionality."

### Slide 2: Goals & Objectives
* **What to say:**
  > "Modern web creators frequently recreate simple UI elements, wasting valuable time. AURA addresses this with four core goals: first, a database-driven catalog to query and list snippets; second, secure user accounts with password salting; third, data integrity and sanitization on community submissions; and fourth, portable offline access via Progressive Web App integration."

### Slide 3: Technology Stack
* **What to say:**
  > "Let's review the stack. On the front-end, Vue.js runs via CDN, managing immediate interactive search and filtering. The styles are written using custom SASS glassmorphic variables and Bootstrap 4. The back-end uses Node.js and Express to route APIs, while security is reinforced via bcrypt and express-session. The database tier uses MongoDB with Mongoose to validate data schemas and enforce integrity rules."

### Slide 4: Mongoose Schemas
* **What to say:**
  > "Our data layer is composed of two primary collections. The User Schema registers members with unique usernames (at least 5 characters), low-cased and validated emails, hashed password strings, and an array of ObjectId references pointing to the user's favorited assets. The Asset Schema houses titles, descriptions, categories strictly restricted to enums like CSS or SASS, the raw source code string, tags, contributor reference IDs, and a downloads counter tracking code copy events."

### Slide 5: Secure Authentication & Sessions
* **What to say:**
  > "Security is key. We protect credentials by hashing passwords using bcrypt. For sessions, we utilize express-session. Rather than keeping sessions in local server memory, which can leak and reset, we persist them using MongoStore in the database. Cookies are flagged with HttpOnly: true to prevent client-side script theft, and we restrict write access to assets behind session verification middleware."

### Slide 6: PWA & Offline-First Implementation
* **What to say:**
  > "AURA behaves like a native application. A web manifest file specifies launching behaviors and icons. When registered, the service worker pre-caches all static app assets, such as pages, styles, manifest configurations, and FontAwesome/Bootstrap CDNs. We intercept network fetches: static assets load instantly via a Cache-First approach, while API requests bypass cache with a graceful offline warning when disconnected."

### Slide 7: OWASP Top-10 Defenses
* **What to say:**
  > "To ensure the server is resilient to attacks, we integrated several security layers. Helmet configures security headers, including a custom Content Security Policy allowing trusted CDNs. We prevent NoSQL injections using mongo-sanitize, and screen out markup attacks using xss-clean. We also guard against brute-force login attacks using express-rate-limit, and enforce a 10kb request body limit to protect against Denial of Service memory exhaustion."

### Slide 8: Automated Verification & Unit Tests
* **What to say:**
  > "To verify app quality, I implemented automated tests using Jest and Supertest. These tests validate schema constraints, duplicate checks, and route accessibility, confirming that guests can query the catalog but must log in to submit or favorite assets. The suite runs inside an isolated DB instance and cleans up state after finishing."

### Slide 9: Live Demo Walkthrough
* **What to say:**
  > "Now, let me transition to a live demonstration of AURA's user interface and functional flows."

---

## Part 2: Live Demo Step-by-Step Instructions

*Perform these actions sequentially on screen during your demonstration:*

### Action 1: Explore the Catalog as Guest
1. Open the browser and go to `http://localhost:3000`.
2. Point out the glowing background orbs, dark glassmorphism theme, and the responsive grid layout.
3. In the search box, type `glass` or `#button` to show instantaneous front-end list filtering.
4. Click on category chips like **CSS Components** or **SVG Icons** to showcase the categorization.
5. Click **View Details** on any asset card to open the modal. Show the live visual render inside the preview sandbox, then highlight the copyable source code.
6. Click **Copy Code** on the card or in the details modal. Notice the green success toast pop up on the bottom right. Mention that this incremented the download statistic.

### Action 2: Sign Up and Register
1. Click **Sign Up** in the top right navbar.
2. Attempt to submit with a username shorter than 5 chars (e.g., `user`) to show error validation.
3. Create a valid account (e.g., `darell`, `darell@aura.com`, `password123`) and click register.
4. Point out how the navbar updates: you now see "Hi, darell", a **Favorites** tab, and a **Submit Asset** button.

### Action 3: Publish a New UI Asset
1. Click **Submit Asset** in the navbar.
2. Fill out the form fields:
   * **Title:** Glowing Glass Button
   * **Category:** CSS Component
   * **Description:** A beautiful glassmorphic button with an active hover glowing aura.
   * **Source Code:**
     ```html
     <button style="background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(168,85,247,0.2);" onmouseover="this.style.boxShadow='0 0 25px rgba(168,85,247,0.6)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 0 15px rgba(168,85,247,0.2)'; this.style.transform='translateY(0)'">Aura Button</button>
     ```
   * **Tags:** button, glassmorphism, glowing, purple
3. Click **Publish Asset**.
4. The system validates the input, uploads the asset, triggers a toast notification, and redirects you back to the home page where your new asset is shown at the very top.

### Action 4: Favorite Assets and View Dashboard
1. Click the heart icon on your newly submitted card. Point out the toast: "Added to Favorites!".
2. Scroll down and click the heart on another asset.
3. Click **Favorites** in the navbar.
4. Show that only your bookmarked assets are listed here. Click the heart icon again to remove one and see it disappear from the grid reactively.

### Action 5: Demonstrate PWA & Offline Access
1. Open the browser's Developer Tools (F12), click on the **Application** (or **Audit/Network**) tab.
2. Under **Service Workers**, point out that `/sw.js` is registered and active.
3. Simulating Offline:
   * **Option A (Browser):** In the Network panel of DevTools, set the throttling preset to **Offline**.
   * **Option B (Server):** Stop your Node terminal server (Ctrl+C).
4. Refresh the page. Show that the page loads instantly from the service worker cache, and a glowing yellow banner appears at the top: *"You are currently offline. Running AURA in offline-only mode."*
5. Demonstrate that you can still search the catalog and inspect previously loaded assets!

---

## Conclusion
* **What to say:**
  > "In summary, AURA delivers a complete, secure, and beautiful digital catalog. By combining Mongoose schema verification, express-session state, OWASP middleware, PWA caching, and Vue.js reactivity, the application meets all coursework criteria for design, performance, and security. Thank you, and I welcome any questions."
