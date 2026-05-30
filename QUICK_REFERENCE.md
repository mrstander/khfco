# Parent Dashboard System - Quick Reference

## What Changed?

### Before: Student-Based System
- Students registered directly with school
- Student dashboard showed their ticket sales
- Schools saw student count and ticket stats

### After: Parent-Based System
- Parents register with school via invite link
- Parents add their children to their account
- Parents manage children's event registrations
- School dashboard shows parent and child statistics

## Key Features

### For Parents
✅ Register with school invitation link
✅ Add multiple children to account
✅ View all children in one place
✅ Manage child information (edit/delete)
✅ See school events
✅ Track ticket purchases
✅ Update personal profile (name, phone)

### For Schools
✅ Send parent invite links (not student links)
✅ Dashboard shows registered parents count
✅ Dashboard shows total children registered
✅ View list of registered parents
✅ View list of all children with parent names
✅ Same event management as before

## New URLs

| Page | URL | Who | Purpose |
|------|-----|-----|---------|
| Parent Login | `/login` | Parent | Sign in to account |
| Parent Register | `/register?school_id=X` | Parent | Create new account |
| Parent Dashboard | `/parent/dashboard` | Parent | Home page with stats |
| My Children | `/parent/children` | Parent | Add/manage children |
| Parent Profile | `/parent/profile` | Parent | Edit info |
| School Dashboard | `/schools/dashboard` | Admin | School stats + parents/children |
| Invite Parents | `/schools/invite` | Admin | Generate parent invite link |

## Database Tables

### New: `students` table
- Stores children registered by parents
- Columns: id, parent_id, school_id, name, grade, created_at
- One parent can have multiple students

### Updated: `tickets` table
- Added: student_id (which child bought ticket for)
- Added: parent_id (who purchased)
- Maintains: buyer_name, buyer_email

### Updated: `profiles` table
- Added: phone field

### Updated: user_role enum
- Added: 'parent' role

## Registration Flow

```
1. School admin generates invite link at /schools/invite
   └─ Link: /register?school_id=ABC123

2. Parent clicks link → sees registration form
   └─ Asks for: Full Name, Phone, Email, Password

3. Form submitted → creates auth account + profile record
   └─ Sets role = 'parent', school_id = ABC123

4. Redirects to /parent/dashboard
   └─ Parent can now add children

5. Parent adds children
   └─ Stores in students table with child name & grade

6. Parent can manage children and view events
```

## File Structure

```
New Directories:
  app/parent/                      (parent portal)

New Files:
  app/actions/parents.ts           (parent server functions)
  app/parent/layout.tsx            (sidebar navigation)
  app/parent/dashboard/page.tsx    (dashboard)
  app/parent/children/page.tsx     (manage children)
  app/parent/profile/page.tsx      (edit profile)
  supabase/migration_parent_system.sql (database changes)

Modified Files:
  supabase/schema.sql
  app/actions/auth.ts
  app/register/page.tsx
  app/schools/dashboard/page.tsx
  app/schools/invite/page.tsx
  app/schools/invite/InviteLinkCard.tsx
```

## Core Functions (app/actions/parents.ts)

| Function | Purpose |
|----------|---------|
| `getParentProfile()` | Fetch parent info |
| `updateParentProfile(data)` | Save profile changes |
| `getParentChildren()` | List parent's children |
| `addChild(data)` | Add new child |
| `updateChild(id, data)` | Edit child |
| `deleteChild(id)` | Remove child |
| `getSchoolEventsForParent()` | Get school's events |
| `getParentTickets()` | Get parent's purchases |
| `getSchoolStudents(schoolId)` | Admin: see all children |

## Data Flow

```
Parent Registration:
  Email + Password → auth.users
  Name + School → profiles (role='parent')
  ↓
Add Child:
  Name + Grade → students table
  ↓
View Events:
  Query events where school_id = parent.school_id
  ↓
Buy Ticket:
  Create ticket with parent_id + student_id
  ↓
Dashboard Shows:
  Stats (tickets, revenue)
  Children list
  Events list
  Ticket history
```

## RLS Rules

| Access | Parent | School | Admin |
|--------|--------|--------|-------|
| Own children | ✅ | ❌ | ✅ |
| Own profile | ✅ | ✅ | ✅ |
| Own tickets | ✅ | ❌ | ✅ |
| School events | ✅ | ✅ | ✅ |
| School parents | ❌ | ✅ | ✅ |
| School children | ❌ | ✅ | ✅ |

## Error Messages & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid Registration Link" | No school_id parameter | Use correct invite link |
| Parent can't login | Account not created | Confirm email first |
| Can't add children | Not authenticated | Log in first |
| "Unauthorized" | Different school | Use correct school link |
| Child doesn't appear | RLS policy issue | Check database permissions |

## Common Tasks

### School Admin: Generate Parent Invite Link
1. Go to `/schools/invite`
2. Click "Copy Link"
3. Share with parents via email/WhatsApp
4. Link format: `https://app.com/register?school_id=UUID`

### Parent: Register Account
1. Click invite link from school
2. Fill in: Name, Phone, Email, Password
3. Click "Complete Registration"
4. Redirected to dashboard

### Parent: Add Child
1. Go to `/parent/children`
2. Click "+ Add Child"
3. Enter: Name, Grade
4. Click "Add Child"
5. Child appears in list

### Parent: View Events
1. On `/parent/dashboard`
2. See "Upcoming School Events" section
3. Events show: name, date, type, ticket price

### School Admin: See Registered Parents
1. Go to `/schools/dashboard`
2. See "Registered Parents" card
3. Lists all parents who registered at school

### School Admin: See All Children
1. Go to `/schools/dashboard`
2. See "Children Registered" section
3. Lists all children with parent names

## Database Queries

### Check parent account exists
```sql
SELECT * FROM profiles WHERE role = 'parent' AND school_id = 'SCHOOL_ID';
```

### Check children for parent
```sql
SELECT * FROM students WHERE parent_id = 'PARENT_ID';
```

### Check tickets for parent
```sql
SELECT * FROM tickets WHERE parent_id = 'PARENT_ID';
```

### Check school's registered parents
```sql
SELECT name, phone FROM profiles 
WHERE role = 'parent' AND school_id = 'SCHOOL_ID';
```

### Check school's children
```sql
SELECT s.name, s.grade, p.name as parent_name 
FROM students s 
JOIN profiles p ON p.id = s.parent_id 
WHERE s.school_id = 'SCHOOL_ID';
```

## Deployment Steps

1. **Backup database** (if production)
2. **Run migrations**:
   ```bash
   supabase db push  # or copy SQL to dashboard
   ```
3. **Deploy code**:
   ```bash
   npm run build
   npm start
   ```
4. **Test flows**:
   - Parent registration
   - Add children
   - View events
   - School dashboard stats

## Rollback Steps

If something breaks:
1. **Revert code**: `git revert <commit>`
2. **Revert DB** (if needed): Use Supabase backup
3. **Redeploy**: `npm run build && npm start`

## Support

### For Parents
- Can't login? → Check email confirmation
- Can't add children? → Make sure logged in as parent
- Events not showing? → Verify school assignment

### For Schools
- Invite link not working? → Copy again from `/schools/invite`
- Can't see parents? → They must use invite link to register
- Can't see children stats? → Refresh dashboard

### For Developers
- Query not working? → Check RLS policies
- Data not showing? → Verify foreign key relationships
- Performance issue? → Check database indexes

