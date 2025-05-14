# BizPro - Artisan Service Marketplace

BizPro is a modern web platform that connects artisans and service providers with potential customers. It allows artisans to register their businesses and services, while customers can easily find, filter, and contact them.

## Features

- **User Authentication**
  - Registration & Login
  - User profiles
  - Role-based access (Users, Artisans, Admins)

- **Artisan Features**
  - Create and manage service listings
  - Upload profile images
  - Detailed profile with contact information

- **Customer Features**
  - Search for artisans by name, category, or location
  - Browse categories
  - Contact artisans directly
  - View artisan profiles

- **Admin Features**
  - Dashboard with statistics
  - Manage users, artisans, and categories
  - Feature and verify artisans

- **UI Features**
  - Responsive design
  - Modern and clean interface
  - Animations and hover effects
  - Wavy SVG footer

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: EJS templates
- **Database**: MongoDB with Mongoose
- **Styling**: Custom CSS
- **Authentication**: Session-based with bcrypt

## Project Structure

```
bizpro/
│
├── src/                  # Server-side code
│   ├── app.js            # Entry point
│   ├── models/           # MongoDB models
│   ├── controllers/      # Route controllers
│   ├── routes/           # Express routes
│   ├── middlewares/      # Custom middlewares
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
│
├── public/               # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   ├── images/           # Static images
│   └── uploads/          # User-uploaded files
│
├── views/                # EJS templates
│   ├── layouts/          # Layout templates
│   ├── partials/         # Reusable components
│   └── pages/            # Page templates
│       ├── admin/        # Admin pages
│       ├── artisan/      # Artisan pages
│       └── customer/     # Customer pages
│
├── package.json          # Dependencies
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Tomiwamiles/rest_portfolio.git
   cd bizpro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/bizpro
   SESSION_SECRET=your_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:4002`

## Future Enhancements

- Review and rating system
- Chat functionality for direct messaging
- Map integration for location-based search
- Payment integration for premium listings
- Email notifications
- Mobile app

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Developed as an improved version of BizBridge
- Designed with a focus on user experience and modern web standards 