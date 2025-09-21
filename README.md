# Woopdi Client

This is meant as a starting point for any SaaS application and has all the things needed to build a modern application. Learn more by looking at the api repository. This project was adapted from a SaaS application I started in the healthcare field. I abstracted out the common patterns and turned it in to a starter template. I plan to make branches with more specific use cases, but this master branch will remain the core base of it. 

Next.js admin dashboard for the [Woopdi API](https://github.com/SpencerCooley/woopdi-api).

## Features

- Admin dashboards for system users and organization users
- Role-based access control (Admin, Moderator, Member)
- User authentication and organization management
- Demo applications showcasing Woopdi API capabilities

## Tech Stack

- Next.js 15.2.1 with TypeScript
- Material-UI components
- SCSS styling
- Stripe integration

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment
The api should run locally at port 8000, this is just a frontend for all the functionality in that system.

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
