# Company Logos Directory

## 📁 Drop Your Company Logo Here

### **Location:**
```
/public/images/logos/
```

### **Recommended File Names:**
- `company-logo.png` - Main logo (color version)
- `company-logo-white.png` - White version (for dark backgrounds)
- `company-logo.svg` - Vector version (best quality, scalable)
- `favicon.ico` - Browser tab icon (16x16, 32x32, 48x48)
- `company-logo-small.png` - Small version for headers (e.g., 200x50px)

### **Recommended Specifications:**

#### **Main Logo:**
- Format: PNG or SVG (SVG preferred for scalability)
- Size: 400x100px to 800x200px (approximate)
- Background: Transparent
- Color: Your brand colors

#### **Favicon:**
- Format: ICO or PNG
- Size: 16x16, 32x32, 48x48 (multi-resolution ICO)
- Background: Transparent or white

#### **Header Logo:**
- Format: PNG or SVG
- Size: 200x50px to 300x75px
- Background: Transparent
- Optimized for web (compressed)

### **Usage in Code:**

#### **Next.js Image Component:**
```tsx
import Image from 'next/image'

<Image
  src="/images/logos/company-logo.png"
  alt="Company Logo"
  width={200}
  height={50}
  priority
/>
```

#### **Regular HTML Image:**
```tsx
<img src="/images/logos/company-logo.png" alt="Company Logo" />
```

#### **In Layout (Favicon):**
```tsx
// In app/layout.tsx or pages/_document.tsx
<link rel="icon" href="/images/logos/favicon.ico" />
```

### **File Structure:**
```
public/
└── images/
    └── logos/
        ├── company-logo.png          ← Main color logo
        ├── company-logo-white.png    ← White version
        ├── company-logo.svg          ← Vector version
        ├── company-logo-small.png    ← Header version
        ├── favicon.ico               ← Browser icon
        └── README.md                 ← This file
```

### **Public URL:**
Once deployed, your logos will be accessible at:
- `https://onelastai.co/images/logos/company-logo.png`
- `https://onelastai.co/images/logos/company-logo.svg`

### **Tips:**
- ✅ Use SVG format when possible (infinite scalability)
- ✅ Keep file sizes under 100KB (compress with TinyPNG)
- ✅ Use transparent backgrounds
- ✅ Test on both light and dark backgrounds
- ✅ Maintain aspect ratio (width:height ratio)

---

**Ready to use!** Just drop your logo files in this folder.
