# Parent Dashboard System - Data Model & Flow Diagrams

## 1. Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AUTH USERS                                 │
│                    (Supabase auth.users)                            │
│  id (uuid) | email | created_at | ...                              │
└──────────────────────────────────┬────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌──────┐  ┌──────┐    ┌──────────┐
    │ADMIN │  │SCHOOL│    │PARENT    │
    └──────┘  └──────┘    └──────────┘
        │           │           │
        │           ▼           ▼
        │      ┌─────────┐  ┌─────────────┐
        │      │PROFILES │  │ STUDENTS    │
        │      │(school) │  │ (children)  │
        │      └─────────┘  └─────────────┘
        │           │           │
        │           ▼           ▼
        │      ┌─────────┐  ┌─────────────┐
        └─────►│SCHOOLS  │  │ STUDENTS    │
               │         │  │ (via school │
               └─────────┘  └─────────────┘
                    │           │
                    ▼           ▼
             ┌────────────┐  ┌──────────┐
             │  EVENTS    │  │ TICKETS  │
             │            │  │          │
             └────────────┘  └──────────┘
```

## 2. User Types & Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                         PARENT                                    │
│                                                                   │
│  auth.users (with email, password)                              │
│         │                                                         │
│         └──→ profiles (role='parent', school_id, name, phone)   │
│                  │                                               │
│                  └──→ students (many children)                   │
│                       ├─ name: "Alice"                          │
│                       ├─ grade: "Grade 5A"                      │
│                       └─ school_id: (references schools)         │
│                            │                                     │
│                            └──→ tickets (event registrations)     │
│                                 ├─ event_id                      │
│                                 ├─ student_id                    │
│                                 └─ parent_id                     │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Registration Flow - Before vs After

### BEFORE (Student-based)
```
School sends link
       │
       ▼
Student registers (/register?school_id=X)
       │
       ├─ Enter: First Name, Surname, Grade, Email, Password
       │
       ▼
Create auth.users & profiles (role='student')
       │
       ▼
Redirect to /student/dashboard
       │
       ▼
View school events & sell tickets directly
```

### AFTER (Parent-based)
```
School sends link
       │
       ▼
Parent registers (/register?school_id=X)
       │
       ├─ Enter: Full Name, Phone, Email, Password
       │
       ▼
Create auth.users & profiles (role='parent', school_id)
       │
       ▼
Redirect to /parent/dashboard
       │
       ├─ Add children (name, grade)
       │       │
       │       ▼
       │   Create students table records
       │
       ▼
View school events
       │
       ├─ Register children for events
       │
       ▼
Purchase tickets for children
       │
       ▼
Tickets linked to both parent_id and student_id
```

## 4. Data Structure Comparison

### School Admin View - BEFORE
```
School Dashboard
├─ Total Events: 5
├─ Tickets Sold: 120
├─ Total Revenue: $5,000
└─ Students
   ├─ Alice (Grade 5A)
   ├─ Bob (Grade 6B)
   └─ Charlie (Grade 5A)
```

### School Admin View - AFTER
```
School Dashboard
├─ Total Events: 5
├─ Registered Parents: 45
├─ Children Registered: 120
├─ Total Revenue: $5,000
├─ Registered Parents
│  ├─ John Smith (555-1234)
│  ├─ Jane Doe (555-5678)
│  └─ ...
└─ Children Registered
   ├─ Alice (Grade 5A) - Parent: John Smith
   ├─ Bob (Grade 6B) - Parent: Jane Doe
   └─ ...
```

## 5. RLS Policy Matrix

```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Resource        │ Parent       │ School Admin │ Admin        │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Own Profile     │ R/W          │ R/W          │ R/W/D        │
│ Own Children    │ R/W/D        │ N/A          │ R/W/D        │
│ Own Tickets     │ R            │ N/A          │ R/W/D        │
│ School Events   │ R            │ R/W/D        │ R/W/D        │
│ School Info     │ R            │ R/W          │ R/W/D        │
│ School Parents  │ N/A          │ R            │ R/W/D        │
│ School Children │ N/A          │ R            │ R/W/D        │
│ Other Parents   │ N/A          │ N/A          │ R/W/D        │
│ Other Children  │ N/A          │ N/A          │ R/W/D        │
└─────────────────┴──────────────┴──────────────┴──────────────┘

Legend: R=Read, W=Write, D=Delete, N/A=No Access
```

## 6. Ticket Purchase Flow

### BEFORE
```
Student logs in
    ▼
View events
    ▼
Buy ticket (quantity: 1 per student)
    ▼
Ticket created:
  - event_id
  - buyer_name (Student's name)
  - buyer_email (Student's email)
  - quantity: 1
  - total_amount
```

### AFTER
```
Parent logs in
    ▼
View children
    ▼
View school events
    ▼
Select child + ticket quantity
    ▼
Buy ticket
    ▼
Ticket created:
  - event_id
  - student_id (child)
  - parent_id (purchaser)
  - buyer_name (Parent's name)
  - buyer_email (Parent's email)
  - quantity (0-∞)
  - total_amount
```

## 7. URL Structure

### Parent Routes
```
/login                           → Login page
/register?school_id=UUID         → Parent registration
/parent/dashboard                → Parent home (stats, children, events)
/parent/children                 → Add/manage children
/parent/profile                  → Edit parent profile
```

### School Routes (Updated)
```
/schools/dashboard               → School dashboard (shows parents/children)
/schools/invite                  → Send parent invite links
/schools/events                  → Manage events
/schools/events/new              → Create event
/schools/events/[id]/edit        → Edit event
```

## 8. Database Queries Reference

### Get a parent with all their children
```sql
SELECT 
  p.id, p.name, p.phone, p.school_id,
  json_agg(json_build_object(
    'id', s.id,
    'name', s.name,
    'grade', s.grade
  )) as children
FROM profiles p
LEFT JOIN students s ON s.parent_id = p.id
WHERE p.role = 'parent' AND p.id = 'UUID'
GROUP BY p.id, p.name, p.phone, p.school_id;
```

### Get school statistics
```sql
SELECT 
  COUNT(DISTINCT p.id) as parent_count,
  COUNT(DISTINCT s.id) as student_count,
  COUNT(e.id) as event_count,
  SUM(t.quantity) as tickets_sold,
  SUM(t.total_amount) as total_revenue
FROM schools sc
LEFT JOIN profiles p ON p.school_id = sc.id AND p.role = 'parent'
LEFT JOIN students s ON s.school_id = sc.id
LEFT JOIN events e ON e.school_id = sc.id
LEFT JOIN tickets t ON t.event_id = e.id
WHERE sc.id = 'SCHOOL_UUID'
GROUP BY sc.id;
```

### Get a child's event tickets
```sql
SELECT 
  t.id, e.name as event_name, e.event_date,
  t.quantity, t.total_amount, t.created_at
FROM tickets t
JOIN events e ON e.id = t.event_id
WHERE t.student_id = 'STUDENT_UUID'
ORDER BY e.event_date DESC;
```

## 9. Key Differences - Parent vs Student System

| Aspect | Parent System | Student System |
|--------|--------------|-----------------|
| **Registration** | Via school invite | Via school invite |
| **Account Type** | Parent/Guardian | Student directly |
| **Children** | Can add multiple | N/A |
| **Dashboard** | Parent portal | Student dashboard |
| **Events** | View school events | View school events |
| **Tickets** | Buy for children | Buy for self |
| **Dashboard Stats** | Tickets sold by kids | Tickets sold directly |
| **RLS Control** | Own children only | Own tickets only |
| **Growth** | Scales with parents | Scales with students |

