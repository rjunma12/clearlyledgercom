
## Remove Test Conversion Link from Navbar

The test conversion route was deleted, but the navbar still displays "Test" links in both desktop and mobile navigation menus. These need to be removed to complete the cleanup.

### Changes Required

**File: `src/components/Navbar.tsx`**

1. **Remove TestTube icon import** (line 3)
   - Current: `import { FileSpreadsheet, Menu, X, Sun, Moon, LayoutDashboard, LogOut, TestTube } from "lucide-react";`
   - Updated: `import { FileSpreadsheet, Menu, X, Sun, Moon, LayoutDashboard, LogOut } from "lucide-react";`

2. **Remove desktop test link** (lines 55-58)
   - Delete the entire `<Link to="/test-conversion">` block with TestTube icon and "Test" label

3. **Remove mobile test link** (lines 161-164)
   - Delete the entire `<Link to="/test-conversion">` block from the mobile menu

### Expected Result

- "Test" link disappears from desktop navbar
- "Test Conversion" link disappears from mobile dropdown menu
- No broken icon imports remain
- Navigation bar only shows: Features, How it Works, Pricing, Blog, Security, and auth actions
