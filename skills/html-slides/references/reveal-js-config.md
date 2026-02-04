# reveal.js Configuration Reference

## Basic Setup

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Presentation Title</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/theme/white.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>Slide 1</section>
      <section>Slide 2</section>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.js"></script>
  <script>
    Reveal.initialize();
  </script>
</body>
</html>
```

## Configuration Options

```javascript
Reveal.initialize({
  // Display controls in the bottom right corner
  controls: true,

  // Display a progress bar
  progress: true,

  // Display the page number
  slideNumber: true,

  // Push each slide to browser history
  history: true,

  // Enable keyboard shortcuts
  keyboard: true,

  // Enable the slide overview mode
  overview: true,

  // Vertical centering of slides
  center: true,

  // Enable touch navigation
  touch: true,

  // Loop the presentation
  loop: false,

  // Transition style: none/fade/slide/convex/concave/zoom
  transition: 'slide',

  // Transition speed: default/fast/slow
  transitionSpeed: 'default',

  // Parallax background image
  parallaxBackgroundImage: '',

  // Parallax background size (CSS syntax, e.g., "2100px 900px")
  parallaxBackgroundSize: '',
});
```

## Built-in Themes

| Theme | Description |
|-------|-------------|
| `black` | Black background, white text, blue links |
| `white` | White background, black text, blue links |
| `league` | Gray background, white text, blue links |
| `beige` | Beige background, dark text, brown links |
| `sky` | Blue background, thin dark text, blue links |
| `night` | Black background, thick white text, orange links |
| `serif` | Cappuccino background, gray text, brown links |
| `simple` | White background, black text, blue links |
| `solarized` | Cream background, dark text, blue links |
| `moon` | Dark blue background, thick grey text, blue links |
| `blood` | Dark background, thick white text, red links |
| `dracula` | Dark purple background, white text, pink links |

## Custom Styling

```css
:root {
  /* Background */
  --r-background-color: #ffffff;

  /* Main content */
  --r-main-font: 'Source Sans Pro', sans-serif;
  --r-main-font-size: 42px;
  --r-main-color: #222;

  /* Headings */
  --r-heading-font: 'Source Sans Pro', sans-serif;
  --r-heading-color: #222;
  --r-heading-line-height: 1.2;
  --r-heading-letter-spacing: normal;
  --r-heading-text-transform: uppercase;
  --r-heading-font-weight: 600;

  /* Links */
  --r-link-color: #2a76dd;
  --r-link-color-hover: #6ca0e8;

  /* Selection */
  --r-selection-background-color: #98bdef;
  --r-selection-color: #fff;
}
```

## Slide Structure

### Horizontal Slides
```html
<section>Slide 1</section>
<section>Slide 2</section>
<section>Slide 3</section>
```

### Vertical Slides (Nested)
```html
<section>
  <section>Vertical Slide 1</section>
  <section>Vertical Slide 2</section>
</section>
```

### Slide Backgrounds
```html
<!-- Color -->
<section data-background-color="#ff0000">

<!-- Image -->
<section data-background-image="image.jpg">

<!-- Video -->
<section data-background-video="video.mp4">

<!-- Gradient -->
<section data-background-gradient="linear-gradient(to bottom, #283b95, #17b2c3)">
```

### Speaker Notes
```html
<section>
  <h2>Slide Title</h2>
  <p>Slide content</p>

  <aside class="notes">
    Speaker notes go here. Press 'S' to view.
  </aside>
</section>
```

## Fragments (Animations)

```html
<p class="fragment">Appears first</p>
<p class="fragment">Appears second</p>
<p class="fragment">Appears third</p>
```

Fragment styles:
- `fade-in` (default)
- `fade-out`
- `fade-up`
- `fade-down`
- `fade-left`
- `fade-right`
- `highlight-red`
- `highlight-blue`
- `highlight-green`

## Code Highlighting

```html
<pre><code data-trim data-noescape data-line-numbers="1|3-5">
function example() {
  const x = 1;
  const y = 2;
  const z = 3;
  return x + y + z;
}
</code></pre>
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N`, `Space` | Next slide |
| `P` | Previous slide |
| `←` `→` | Navigate left/right |
| `↑` `↓` | Navigate up/down |
| `Home`, `End` | First/last slide |
| `B`, `.` | Pause (blackout) |
| `F` | Fullscreen |
| `S` | Speaker view |
| `O`, `Esc` | Overview |
| `?` | Help |
