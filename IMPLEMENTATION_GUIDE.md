# Implementation Guide - Parent Dashboard System

## Quick Start

### 1. Deploy Database Changes
Run the updated `supabase/schema.sql` to:
- Add `parent` role to user_role enum
- Create `students` table for children
- Update `tickets` table with parent_id and student_id fields
- Add new RLS policies

```bash
# If using Supabase CLI:
supabase db push
```

### 2. Test the Flow

#### As a School Admin:
1. Log in at `/login`
2. Go to `/schools/invite`
3. Copy the invite link (will be `/register?school_id=YOUR_SCHOOL_ID`)

#### As a Parent:
1. Click the invite link or visit `/register?school_id=SCHOOL_ID`
2. Fill in: Full Name, Phone, Email, Password
3. Click "Complete Registration"
4. Redirected to `/parent/dashboard`

#### Parent Dashboard Features:
1. **Dashboard** (`/parent/dashboard`):
   - See welcome message with school name
   - View total tickets sold and funds raised
   - Quick view of registered children
   - See upcoming school events
   - View recent ticket activity

2. **My Children** (`/parent/children`):
   - Add new children (name, grade)
   - Edit child information
   - Remove children
   - Inline form with validation

3. **Profile** (`/parent/profile`):
   - Update name and phone
   - View school assignment
   - View account role

#### School Admin Dashboard Updates:
1. **Statistics** now show:
   - Registered Parents count
   - Children Registered count
   - (Previously showed only event stats)

2. **New Sections**:
   - "Registered Parents" - list of parents
   - "Children Registered" - list of all children with parent names

## File Structure

```
app/
├── actions/
│   ├── auth.ts (UPDATED - parent registration, login redirect)
│   └── parents.ts (NEW - all parent operations)
├── parent/ (NEW)
│   ├── layout.tsx (NEW - sidebar navigation)
│   ├── dashboard/
│   │   └── page.tsx (NEW)
│   ├── children/
│   │   └── page.tsx (NEW)
│   └── profile/
│       └── page.tsx (NEW)
├── register/
│   └── page.tsx (UPDATED - parent registration form)
└── schools/
    ├── dashboard/
    │   └── page.tsx (UPDATED - shows parents & children)
    └── invite/
        ├── page.tsx (UPDATED - invite parents)
        └── InviteLinkCard.tsx (UPDATED - parent invite)

supabase/
└── schema.sql (UPDATED - parent role, students table, tickets update)
```

## Key Changes Summary

### Database
- ✅ `profiles.phone` added
- ✅ `students` table created (children)
- ✅ `tickets.student_id` and `tickets.parent_id` added
- ✅ `user_role` enum includes `'parent'`
- ✅ New RLS policies for parent access

### Authentication
- ✅ `registerParentAccount()` created
- ✅ Login redirect handles parent role

### UI/Pages
- ✅ Parent registration form (`/register`)
- ✅ Parent layout with sidebar
- ✅ Parent dashboard with stats and children
- ✅ Children management page
- ✅ Parent profile page
- ✅ School dashboard updated to show parents/children

### Actions
- ✅ `app/actions/parents.ts` with all parent operations

## API Endpoints Used

### Authentication
- `POST /api/auth/signup` - Create parent account (via supabase.auth.signUp)
- `POST /api/auth/signin` - Parent login (via supabase.auth.signInWithPassword)

### Database Operations
- `profiles` - Read/update parent profile
- `students` - Create/read/update/delete children
- `events` - Read school events
- `tickets` - Create/read ticket records
- `schools` - Read school info

## Error Handling

All pages and actions include:
- ✅ Try/catch error handling
- ✅ User-friendly error messages
- ✅ Success notifications
- ✅ Loading states (isPending)
- ✅ Input validation

## Security Considerations

### RLS Policies
- Parents can only view/edit their own children
- Parents can only view events from their school
- Parents can only see tickets they purchased
- Schools can only view their registered parents/children
- Admins have full access

### Protected Routes
- All parent routes require authentication
- Parent role verification on `/parent/*` pages
- School admin verification on `/schools/*` pages

## Next Steps / Enhancements

### Ticket Purchase Flow
Update `/app/actions/tickets.ts` to:
- Accept `student_id` when creating tickets
- Set `parent_id` from current user
- Link tickets to children

### Notifications
- Email parent when child is registered for event
- Notification when ticket is purchased

### Reports
- Parent-specific ticket reports
- Child-specific event history

### Admin Functions
- View all parents and their children
- Bulk import parent/child data
- Export parent and student lists

## Troubleshooting

### Parent can't login
- Verify profile row was created with `role = 'parent'`
- Check school_id is correctly set
- Ensure email is confirmed in auth.users

### Children not showing up
- Verify parent_id matches current user
- Check students.school_id matches parent's school_id
- Verify RLS policies are active

### Invite link issues
- Ensure school_id is valid UUID
- Check link format: `/register?school_id=UUID`
- Verify school exists in schools table

## Testing Queries

### Check parent account creation
```sql
SELECT id, role, school_id, name FROM profiles WHERE role = 'parent';
```

### Check children registered
```sql
SELECT s.*, p.name as parent_name FROM students s 
JOIN auth.users u ON s.parent_id = u.id;
```

### Check RLS policies
```sql
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('students', 'profiles');
```

