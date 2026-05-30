# Parent Dashboard Refactoring - Deployment Checklist

## Pre-Deployment (Development Testing)

- [ ] Clone repository and checkout parent dashboard branch
- [ ] Install dependencies: `npm install`
- [ ] Set up local development environment with Supabase
- [ ] Copy `.env.local.example` to `.env.local` and fill in values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Database Migration

- [ ] Backup existing Supabase database
- [ ] Review `supabase/schema.sql` changes
- [ ] Review `supabase/migration_parent_system.sql`
- [ ] Choose migration approach:
  - Option A: Use Supabase CLI: `supabase db push`
  - Option B: Copy SQL from `migration_parent_system.sql` and run in SQL Editor
  - Option C: Run `schema.sql` migrations through Supabase dashboard
- [ ] Verify enum update: `SELECT * FROM pg_enum WHERE enumlabel LIKE '%parent%'`
- [ ] Verify `students` table created: `SELECT * FROM information_schema.tables WHERE table_name='students'`
- [ ] Verify `phone` column added to profiles
- [ ] Verify RLS policies created: `SELECT * FROM pg_policies WHERE tablename IN ('students', 'profiles')`

## Code Testing

### Authentication Tests
- [ ] Test school admin login → redirects to `/schools/dashboard`
- [ ] Test parent account creation from registration link
- [ ] Test parent login → redirects to `/parent/dashboard`
- [ ] Test invalid registration link (no school_id parameter)

### Parent Flow Tests
- [ ] Parent can register with phone number
- [ ] Parent sees dashboard after registration
- [ ] Parent can add first child
- [ ] Parent can add multiple children
- [ ] Parent can edit child information
- [ ] Parent can delete child
- [ ] Parent can view school events
- [ ] Parent can see own profile info
- [ ] Parent can update profile (name, phone)
- [ ] Parent logout works correctly

### School Admin Tests
- [ ] School dashboard shows "Registered Parents" count
- [ ] School dashboard shows "Children Registered" count
- [ ] School admin can see list of registered parents
- [ ] School admin can see list of all children with parent names
- [ ] Invite page says "Invite Parents" not "Invite Students"
- [ ] Copy link functionality works
- [ ] Link format is correct: `/register?school_id=UUID`

### RLS & Security Tests
- [ ] Parent A cannot see Parent B's children
- [ ] Parent cannot edit children from different school
- [ ] Parent cannot delete other parents' children
- [ ] Non-parent users cannot access `/parent/*` routes
- [ ] School admin from School A cannot see School B's children
- [ ] Unauthenticated users redirected to login

### Navigation Tests
- [ ] Sidebar navigation visible on all parent pages
- [ ] Links in sidebar work correctly
- [ ] Sign-out button works and redirects to login

## UI/UX Testing

### Parent Dashboard
- [ ] Welcome message displays correctly with name
- [ ] School name displays correctly
- [ ] Stats cards show correct numbers
- [ ] Children section shows added children
- [ ] Empty state message appears when no children
- [ ] "Add Child" button works
- [ ] Events section displays school events correctly
- [ ] Event information is accurate (date, price, type)
- [ ] Recent activity table shows tickets (if any)

### Children Management Page
- [ ] Can add child with name and grade
- [ ] Form validates (requires name and grade)
- [ ] Success message appears after adding
- [ ] Added child appears in list
- [ ] Can edit child by clicking Edit
- [ ] Can delete child with confirmation
- [ ] Empty state message appears initially
- [ ] Multiple children can be added

### Profile Page
- [ ] Name field pre-filled with current name
- [ ] Phone field pre-filled (if exists)
- [ ] School information displayed
- [ ] Can update name
- [ ] Can update phone
- [ ] Success message appears after update

## Functionality Integration

### Ticket System (if applicable)
- [ ] Update ticket creation to include `student_id` and `parent_id`
- [ ] Verify tickets show up in parent dashboard
- [ ] Verify school can see ticket statistics
- [ ] Tickets correctly linked to both parent and child

### Events System
- [ ] Parents can see all school events
- [ ] Event details display correctly
- [ ] Event dates are in correct format
- [ ] Event prices display correctly

### Email Notifications (if applicable)
- [ ] Parent receives confirmation email on registration
- [ ] Parent receives confirmation on child registration
- [ ] School receives notification when parent registers

## Performance Testing

- [ ] Parent dashboard loads in < 2 seconds
- [ ] Children page loads quickly with many children
- [ ] School dashboard with many parents/children loads well
- [ ] No N+1 query problems
- [ ] Database indexes are active on parent_id, school_id

## Browser/Device Testing

- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Tablet (iPad, Android)
- [ ] Mobile (iPhone, Android)
- [ ] Responsive design works correctly
- [ ] Sidebar collapses on mobile
- [ ] Forms are mobile-friendly

## Documentation

- [ ] README updated with parent dashboard info
- [ ] PARENT_REFACTOR_SUMMARY.md reviewed
- [ ] IMPLEMENTATION_GUIDE.md reviewed
- [ ] DATA_MODEL_DIAGRAMS.md reviewed
- [ ] Comments added to complex code sections
- [ ] API documentation updated (if applicable)

## Pre-Production Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] No TypeScript compilation errors
- [ ] Performance is acceptable
- [ ] Security review completed
- [ ] Error handling tested
- [ ] Loading states work correctly
- [ ] Edge cases handled (empty data, errors, etc.)

## Production Deployment

- [ ] Merge pull request to main branch
- [ ] Create production database backup
- [ ] Deploy database migrations to production
  ```bash
  supabase db push --linked
  ```
- [ ] Build production bundle
  ```bash
  npm run build
  ```
- [ ] Deploy to production environment
- [ ] Verify deployment (check logs, test critical flows)
- [ ] Monitor error logs for first 24 hours
- [ ] Monitor database performance

## Post-Deployment

### Immediate (1-2 hours)
- [ ] Test parent registration with actual invite link
- [ ] Test parent login
- [ ] Test adding children
- [ ] Verify school admin dashboard shows new data
- [ ] Check for any errors in production logs

### Day 1
- [ ] Monitor performance metrics
- [ ] Check error logging for any issues
- [ ] Verify all notifications are working (if applicable)
- [ ] Spot check data in production database

### Week 1
- [ ] Gather user feedback
- [ ] Monitor support tickets for issues
- [ ] Check analytics for adoption rate
- [ ] Verify data integrity

## Rollback Plan

If critical issues occur:

1. **Database Rollback** (if needed):
   ```bash
   # Restore from backup
   supabase db pull --linked
   ```

2. **Application Rollback**:
   ```bash
   git revert <commit-hash>
   npm run build
   # Deploy previous version
   ```

3. **Communication**:
   - Notify users of temporary maintenance
   - Provide estimated resolution time
   - Update status page

## Old Student System Cleanup (Later Phase)

Once parent system is stable:

- [ ] Plan student-to-children data migration (if applicable)
- [ ] Archive old student registration flow
- [ ] Remove student dashboard routes (or redirect to parent)
- [ ] Clean up old student-related code
- [ ] Update help documentation and FAQs
- [ ] Train support team on new system

## Success Metrics

- [ ] Parent registration completion rate > 90%
- [ ] No critical errors in production logs
- [ ] Response times < 2 seconds for key pages
- [ ] Zero RLS security breaches
- [ ] User satisfaction with new system
- [ ] Adoption rate of add-children feature

## Contact & Escalation

**Issues with Database**:
- Check Supabase dashboard
- Review migration scripts
- Contact Supabase support if needed

**Issues with Frontend**:
- Review browser console
- Check Next.js build logs
- Review error tracking service

**Questions about Flow**:
- Review PARENT_REFACTOR_SUMMARY.md
- Review IMPLEMENTATION_GUIDE.md
- Check inline code comments

