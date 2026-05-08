# TaskFlow Field

[Versão em português](README.md)

TaskFlow Field is a full stack platform for field service teams to manage service orders, schedules, technicians, checklists and proof-of-work records through a web dashboard and a mobile app connected to the same API.

The project targets technical assistance, residential maintenance, internet, camera and AC installation, cleaning, inspection and independent professionals who need to replace scattered WhatsApp messages, spreadsheets and paper notes with a clearer operational workflow.

## Demo

- Frontend: https://taskflowofc.vercel.app
- Backend: https://taskflow-dlfs.onrender.com
- Mobile app: [mobile/README.md](mobile/README.md)
- Product strategy: [docs/product-strategy.md](docs/product-strategy.md)

```text
Demo username: demo@taskflow.com
Demo password: taskflow123
```

## Screenshots

| Login and positioning | Operations dashboard |
| --- | --- |
| ![TaskFlow Field login screen](docs/screenshots/web-login.png) | ![TaskFlow Field operations dashboard](docs/screenshots/web-dashboard.png) |

| Service order queue | New service order |
| --- | --- |
| ![Service order queue](docs/screenshots/web-orders.png) | ![New service order form](docs/screenshots/web-new-order.png) |

| Account and plans | Responsive view |
| --- | --- |
| ![Account, trial and subscription screen](docs/screenshots/web-account.png) | ![Responsive mobile dashboard viewport](docs/screenshots/web-mobile-dashboard.png) |

LinkedIn-ready carousel/post images are available under `docs/screenshots/linkedin-*.png`.

## Key Features

- JWT authentication with persisted sessions.
- REST API versioned under `/api/v1`.
- Web dashboard with KPIs, trial status, recent activity and next-visit radar.
- Service order CRUD with customer, phone, address, date, priority, technician, notes and checklist.
- Filters by status, technician, priority, period and text search.
- Authenticated CSV export for service orders.
- Expo mobile app for technicians with order list, details, checklist, status updates, photo proof and offline cache.
- Optional demo account with realistic sample data.
- Commercial plans, 7-day trial and checkout-intent registration.
- Custom design system with a dark industrial theme, light theme and responsive layout.

## Tech Stack

- Web: React, Vite, React Icons, CSS custom properties.
- Mobile: Expo, React Native, AsyncStorage, SecureStore, ImagePicker, Notifications.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs.
- Deployment: Vercel, Render and MongoDB Atlas.

## Architecture

```text
taskflow/
  backend/       Express API, MongoDB models, authentication and v1 routes
  src/           React/Vite web dashboard
  mobile/        Expo/React Native mobile app
  docs/          Strategy, screenshots and presentation materials
```

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Web

```bash
cp .env.example .env
npm install
npm run dev
```

### Mobile

```bash
cd mobile
cp .env.example .env
npm install
npm run start
```

You can also start the mobile app from the repository root:

```bash
npm run mobile:lan
```

## Environment Variables

### Web

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_DEMO_ACCOUNT_ENABLED=true
VITE_DEMO_USERNAME=demo@taskflow.com
VITE_DEMO_PASSWORD=taskflow123
```

### Backend

```env
PORT=5001
HOST=127.0.0.1
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=replace-with-a-strong-secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,exp://127.0.0.1:8081
DEMO_ACCOUNT_ENABLED=true
DEMO_USERNAME=demo@taskflow.com
DEMO_PASSWORD=taskflow123
DEMO_FULL_NAME=TaskFlow Demo Team
```

### Mobile

```env
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:5001/api/v1
EXPO_PUBLIC_DEMO_ACCOUNT_ENABLED=true
EXPO_PUBLIC_DEMO_USERNAME=demo@taskflow.com
EXPO_PUBLIC_DEMO_PASSWORD=taskflow123
```

## Scripts

```bash
npm run dev          # web dashboard
npm run build        # web build
npm run lint         # project lint
npm run mobile:lan   # Expo over LAN
npm run mobile:tunnel
npm run mobile:web   # mobile web preview
```

## Product Decisions

- Field operations were chosen because the domain combines admin workflows, mobile execution and a real need for traceability.
- The MVP covers the main cycle: create an order, assign a technician, track status, complete a checklist, register proof and export a report.
- The commercial flow already exists in an initial state: trial, plans, account stage and checkout intent.

## Next Steps

- Integrate a payment gateway.
- Upload proof photos to external storage.
- Add automated tests for the API and critical frontend flows.
- Implement observability, structured logs and monitoring.
- Evolve role-based permissions, organizations and multiple teams.

## Status

TaskFlow Field is ready to be presented as a full stack portfolio project and to run controlled pilots with real service providers.
