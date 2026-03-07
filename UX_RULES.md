# Lingland UX/UI Governance: The Golden Rules

This document defines the universal standards for the Lingland Platform to ensure a professional, consistent, and high-productivity workspace.

---

## 1. Page Blueprint
Every functional page MUST follow this structural hierarchy:

1. **PageHeader**: Title, primary actions (e.g., "New Booking"), and breadcrumbs.
2. **FiltersBar**: Search, status filters, and view toggles.
3. **Workspace**: The main data view (Table, Grid, or Dashboard widgets).
4. **BottomActions**: Sticky footer for bulk actions or page-level navigation.
5. **Interaction Layer**: Non-intrusive elements like Drawers, Context Menus, and Snackbars.

---

## 2. Modal & Drawer Policy
Modals and Drawers are the primary interaction vehicles.

### Modal Types
- **ConfirmModal**: High-risk actions (Delete, Cancel).
- **FormModal**: Entity editing (Edit Client, Edit Interpreter).
- **AssignmentModal**: The UNIFIED component for all interpreter-related actions.
- **Wizard**: Complex multi-step flows (New Booking, Invoice Generation).

### Universal Rule: Success & Error
- **On Success**: 1. `closeModal()` → 2. `showToast("Success Message")` → 3. `refreshData()`.
- **On Error**: 1. `showToast("Error Message")` → 2. Keep modal open for correction.
- **Unsaved Changes**: If a user attempts to close a Form/Wizard with changes, show a confirmation dialog.

---

## 3. Table Standards (Operational Command)
Tables are not just for display; they are active control centers.

- **Row Click**: Always opens the **Side Drawer** for a quick entity preview.
- **Double Click**: Navigates to the **Full Details Page**.
- **Right Click**: Opens a **Context Menu** with quick actions.
- **Row Hover**: Must show a subtle highlight and "Quick Action" icons on the far right.
- **Bulk Selection**: Selection must trigger the **BulkActionBar** for batch operations.

---

## 4. Iconography Map
Library: `lucide-react` | Size: `18px` | Stroke: `1.75`

### Operations
- **Jobs**: `Calendar`
- **Assignments**: `UserPlus`
- **Timesheets**: `Clock`

### Network
- **Interpreters**: `Users`
- **Clients**: `Building`
- **Applications**: `UserCheck`

### Finance
- **Invoices**: `Receipt`
- **Payments**: `Wallet`
- **Reports**: `BarChart`

---

## 5. Status & Design Tokens
- **Grid System**: 8px base (8, 16, 24, 32...).
- **Typography**: Inter (UI: 500, Titles: 600, Metrics: 700).
- **Status Colors**:
    - `INCOMING`: Gray
    - `PENDING_ASSIGNMENT`: Amber
    - `BOOKED`: Blue
    - `VERIFIED`: Green
    - `INVOICED`: Slate
