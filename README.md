# Alam Zia — engineering portfolio

A cinematic portfolio exploring DevOps, cloud infrastructure and AI engineering through five connected chapters: Home, Selected Work, Engineering Process, About and Contact.

The experience combines an original glass-and-metal AZ sculpture, reflective ground, spatial engineering assemblies and scroll-driven camera movement. Portfolio content covers webMethods Managed File Transfer, delivery automation, GitOps and AI projects.

## Technology

Next.js, TypeScript, React Three Fiber, Three.js, Drei, GSAP, ScrollTrigger, Lenis and Tailwind CSS. The scene uses physical materials, procedural ground normals and a custom horizon shader.

## Local development

From the repository directory, install dependencies and start the application:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Keep the development server running while reviewing the site.

## Checks and production build

```sh
npm run test:scroll
npm run typecheck
npm run lint
npm run build
npm start
```

The scroll regression suite covers initial movement, reverse scrolling, chapter boundaries, reduced motion and render wake-up behavior. These tests do not replace browser and GPU testing. Full application build validation and cross-browser visual review remain outstanding.

## Project structure

- `app/`: application entry points, metadata and global styles.
- `components/Portfolio.tsx`: chapter content and scroll coordination.
- `components/Navigation.tsx`: numbered navigation and accessible menu.
- `components/scene/`: geometry, lighting, camera animation and rendering controls.
- `components/portfolio.css`: typography, composition and responsive styles.
- `lib/content.ts`: professional background and project content.
- `lib/choreography.ts`, `lib/motion.ts`, `lib/scroll-state.ts`: camera paths and animation state.
- `lib/render-budget.ts`: rendering resolution budgets.
- `public/Alam-Zia-Resume.pdf`: downloadable résumé.
- `tests/`: scroll regression tests.

## Interaction and accessibility

Project controls switch engineering stories and reveal additional notes. The menu supports keyboard focus, Escape and focus restoration. Chapter anchors support direct navigation. The motion toggle and operating-system reduced-motion preference disable interpolated camera travel and parallax. Devices without WebGL receive a semantic content view.

The 3D scene loads separately from the page content. Rendering pauses after interactions settle, pixel density is capped and distant chapter geometry is hidden. Reflection quality adapts to device capabilities.

## Browser review

Check the first scroll after page load and after idle, forward and reverse chapter navigation, project controls, menu keyboard behavior, reduced motion, contact links and résumé download. Review desktop and mobile layouts in Chrome, Safari, Firefox and Edge, including a device with limited graphics capability.
