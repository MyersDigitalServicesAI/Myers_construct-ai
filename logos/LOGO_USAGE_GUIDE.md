# Myers Construct AI - Logo Usage Guide

**Date:** January 23, 2026  
**Brand:** Myers Construct AI  
**Theme:** 5-Star Premium Construction + AI Technology

---

## 📦 Logo Files

### 1. **myers-construct-logo-main.png** (Primary Logo)
- **Use Case:** Main brand identity, website homepage, marketing materials
- **Format:** Square (1:1)
- **Colors:** Navy blue (#1a2332), Gold (#d4af37)
- **Features:** Pentagon shape with 5 gold stars, full company name
- **Best For:** Hero sections, business cards, letterheads

### 2. **myers-construct-logo-icon.png** (App Icon)
- **Use Case:** App icons, favicons, social media profile pictures
- **Format:** Square (1:1)
- **Colors:** Navy blue (#1a2332), Gold (#d4af37)
- **Features:** Simplified pentagon with single star
- **Best For:** Small sizes, mobile apps, browser tabs

### 3. **myers-construct-logo-horizontal.png** (Horizontal Lockup)
- **Use Case:** Website headers, email signatures, wide banners
- **Format:** Landscape (16:9 or wider)
- **Colors:** Navy blue (#1a2332), Gold (#d4af37)
- **Features:** Badge + text side-by-side with construction helmet
- **Best For:** Navigation bars, email footers, wide displays

### 4. **myers-construct-logo-dark.png** (Dark Mode Version)
- **Use Case:** Dark backgrounds, night mode interfaces
- **Format:** Square (1:1)
- **Colors:** White/Light gray, Gold (#d4af37)
- **Features:** Pentagon with 5 stars optimized for dark backgrounds
- **Best For:** Dark mode websites, presentations on dark slides

### 5. **myers-construct-badge.png** (Premium Badge)
- **Use Case:** Certifications, awards, premium branding
- **Format:** Circular badge
- **Colors:** Navy blue (#1a2332), Gold (#d4af37)
- **Features:** Circular seal with 5 stars and blueprint elements
- **Best For:** Certificates, quality seals, premium marketing

---

## 🎨 Brand Colors

### Primary Colors

| Color Name | Hex Code | RGB | Use Case |
|------------|----------|-----|----------|
| **Navy Blue** | `#1a2332` | `rgb(26, 35, 50)` | Primary brand color, text, backgrounds |
| **Gold** | `#d4af37` | `rgb(212, 175, 55)` | Accent color, stars, premium elements |
| **White** | `#ffffff` | `rgb(255, 255, 255)` | Backgrounds, text on dark |
| **Light Gray** | `#f5f5f5` | `rgb(245, 245, 245)` | Secondary backgrounds |

### Secondary Colors (Optional)

| Color Name | Hex Code | RGB | Use Case |
|------------|----------|-----|----------|
| **Steel Blue** | `#4a5568` | `rgb(74, 85, 104)` | Secondary text, borders |
| **Dark Gold** | `#b8941f` | `rgb(184, 148, 31)` | Hover states, shadows |

---

## 📐 Logo Specifications

### Minimum Sizes

| Logo Variant | Minimum Width | Minimum Height |
|--------------|---------------|----------------|
| Main Logo | 200px | 200px |
| Icon | 32px | 32px |
| Horizontal | 300px | 100px |
| Dark Mode | 200px | 200px |
| Badge | 150px | 150px |

### Clear Space

- Maintain clear space around logo equal to the height of one star
- No text, graphics, or other elements should intrude into clear space

### Scaling

- Always scale proportionally (maintain aspect ratio)
- Use vector formats (SVG) when possible for scalability
- PNG files provided are high resolution (suitable for print)

---

## ✅ Do's

✓ Use the logo on white or light backgrounds (main logo)  
✓ Use dark mode logo on dark backgrounds  
✓ Maintain minimum size requirements  
✓ Keep adequate clear space around logo  
✓ Use official brand colors  
✓ Scale proportionally  
✓ Use horizontal lockup for wide spaces  
✓ Use icon version for small sizes (under 100px)  

---

## ❌ Don'ts

✗ Don't stretch or distort the logo  
✗ Don't change the colors  
✗ Don't rotate the logo  
✗ Don't add effects (shadows, glows, gradients)  
✗ Don't place logo on busy backgrounds  
✗ Don't use low-resolution versions  
✗ Don't remove or rearrange elements  
✗ Don't use main logo on dark backgrounds (use dark mode version)  

---

## 🌐 Digital Usage

### Website

```html
<!-- Favicon -->
<link rel="icon" type="image/png" href="/logos/myers-construct-logo-icon.png">

<!-- Header Logo -->
<img src="/logos/myers-construct-logo-horizontal.png" alt="Myers Construct AI" height="60">

<!-- Hero Section -->
<img src="/logos/myers-construct-logo-main.png" alt="Myers Construct AI" width="400">
```

### Social Media

| Platform | Recommended Logo | Size |
|----------|------------------|------|
| Facebook Profile | Icon | 180x180px |
| Twitter/X Profile | Icon | 400x400px |
| LinkedIn Profile | Icon | 300x300px |
| Instagram Profile | Badge | 320x320px |
| Facebook Cover | Horizontal | 820x312px |
| Twitter/X Header | Horizontal | 1500x500px |
| LinkedIn Banner | Horizontal | 1584x396px |

### Email Signature

```html
<img src="https://your-domain.com/logos/myers-construct-logo-horizontal.png" 
     alt="Myers Construct AI" 
     width="250" 
     style="max-width: 250px; height: auto;">
```

---

## 🖨️ Print Usage

### Business Cards

- Use main logo or horizontal lockup
- Minimum size: 1 inch (2.54 cm) width
- Resolution: 300 DPI minimum

### Letterhead

- Use horizontal lockup in header
- Position: Top left or centered
- Size: 2-3 inches (5-7.5 cm) width

### Brochures & Flyers

- Use main logo on cover
- Use icon for page headers
- Maintain brand colors throughout

### Signage

- Use main logo or badge for maximum impact
- Ensure visibility from intended viewing distance
- Consider illumination for outdoor signage

---

## 🎯 Logo Symbolism

### Pentagon Shape
- Represents **5 stars** of excellence
- Symbolizes **stability** and **construction**
- Conveys **strength** and **precision**

### 5 Gold Stars
- **Premium quality** service
- **5-star rating** commitment
- **Excellence** in construction
- **Award-winning** AI technology
- **Top-tier** client satisfaction

### Navy Blue Color
- **Trust** and **reliability**
- **Professional** and **corporate**
- **Stability** and **confidence**
- **Construction industry** standard

### Gold Color
- **Premium** and **luxury**
- **Excellence** and **achievement**
- **Value** and **quality**
- **Award** and **recognition**

---

## 📱 Implementation Examples

### React Component

```jsx
import logo from './logos/myers-construct-logo-main.png';
import logoIcon from './logos/myers-construct-logo-icon.png';
import logoHorizontal from './logos/myers-construct-logo-horizontal.png';
import logoDark from './logos/myers-construct-logo-dark.png';

function Logo({ variant = 'main', size = 'medium' }) {
  const logos = {
    main: logo,
    icon: logoIcon,
    horizontal: logoHorizontal,
    dark: logoDark
  };
  
  const sizes = {
    small: 100,
    medium: 200,
    large: 400
  };
  
  return (
    <img 
      src={logos[variant]} 
      alt="Myers Construct AI" 
      width={sizes[size]}
      style={{ height: 'auto' }}
    />
  );
}
```

### CSS Background

```css
.logo-main {
  background-image: url('/logos/myers-construct-logo-main.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 200px;
  height: 200px;
}

.logo-dark {
  background-image: url('/logos/myers-construct-logo-dark.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

---

## 🔄 File Formats Available

| Format | Use Case | Scalability |
|--------|----------|-------------|
| **PNG** | Web, digital displays | Fixed resolution (high quality provided) |
| **SVG** | Web, scalable graphics | Infinite (vector) |
| **PDF** | Print, professional documents | Infinite (vector) |
| **JPG** | Photos, web (not recommended for logo) | Fixed resolution |

**Note:** PNG files provided are high resolution (2048x2048px or larger) suitable for most uses.

---

## 📞 Brand Contact

For questions about logo usage or to request additional formats:

- **Email:** myersdigitalservicesai@gmail.com
- **Website:** https://myers-construct-ai.vercel.app
- **GitHub:** https://github.com/MyersDigitalServicesAI

---

## 📄 License

These logos are proprietary to Myers Construct AI and Myers Digital Services AI. Unauthorized use, reproduction, or distribution is prohibited.

**© 2026 Myers Construct AI. All rights reserved.**

---

## 🎨 Design Credits

- **Designer:** AI-Generated with professional refinement
- **Date Created:** January 23, 2026
- **Version:** 1.0
- **Theme:** 5-Star Premium Construction + AI Technology

---

**Last Updated:** January 23, 2026  
**Document Version:** 1.0
