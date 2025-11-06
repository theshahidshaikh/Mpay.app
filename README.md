# mosque Collection Management App

A comprehensive web application for managing monthly collections from households within mosque jurisdictions.

## Features

### 🏠 Household User Panel
- **Registration/Login**: Account linked to one house only
- **House Profile**: Store Jamat Number, members count, contact details
- **Payment Tracking**: Annual installment with monthly breakdown (Jan-Dec)
- **Online Payments**: UPI, Card, Net Banking support
- **Payment History**: Complete transaction history with export

### 🕌 mosque Admin Panel
- **Dashboard**: View all households under mosque area
- **Search & Filter**: Find households by name, Jamat Number, or payment status
- **Payment Management**: Color-coded status map, manual payment entry for cash
- **Reports**: Monthly/yearly collection summaries with CSV export

### 👑 Super Admin Panel
- **mosque Management**: Create and manage mosque admin accounts
- **Global Statistics**: View system-wide payment statistics
- **Admin Assignment**: Assign areas to mosque admins

## Quick Start

1. **Connect to Supabase**: Click "Connect to Supabase" in the top right corner
2. **Database Setup**: The schema will be automatically created
3. **Start Using**: Register accounts and begin managing collections

## Demo Accounts

Once Supabase is connected, you can create these demo accounts:

- **Household User**: household@demo.com / password123
- **mosque Admin**: admin@demo.com / password123
- **Super Admin**: super@demo.com / password123

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Payments**: Integrated payment gateway support
- **Reports**: CSV/PDF export functionality

## Database Schema

The app automatically creates these tables:
- `profiles` - User accounts with roles
- `mosques` - mosque information
- `households` - Household details
- `payments` - Payment records

## Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Overview

✅ Role-based authentication (3 user types)  
✅ Mobile-first responsive design  
✅ Payment calendar with status tracking  
✅ Online payment integration  
✅ Admin dashboards with analytics  
✅ CSV/PDF report generation  
✅ Real-time data synchronization  
✅ Islamic-inspired design theme  

## Support

For setup assistance or feature requests, please refer to the documentation or contact support.