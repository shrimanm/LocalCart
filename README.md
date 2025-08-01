# Myntra Ecommerce Clone

A full-featured ecommerce platform built with Next.js, TypeScript, MongoDB, and Tailwind CSS. This project replicates the core functionality of Myntra, India's leading fashion ecommerce platform.

## 🚀 Features

### User Features
- **Authentication**: OTP-based login/signup system
- **Product Catalog**: Browse products with advanced search and filtering
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products with cascade deletion
- **Order Management**: Place orders, track status, view history
- **User Profile**: Manage personal information and preferences
- **Address Management**: Multiple delivery addresses
- **Notifications**: Real-time updates on orders and offers
- **Mobile Responsive**: Fully optimized for mobile devices

### Merchant Features
- **Merchant Dashboard**: Comprehensive business overview with real-time stats
- **Product Management**: Add, edit, and manage product listings
- **Order Management**: View and process customer orders
- **Analytics**: Sales insights and performance metrics
- **Image Upload**: Cloudinary integration for product images
- **Mobile Dashboard**: Responsive design for mobile merchant management

### Admin Features
- **Admin Panel**: Platform management and oversight with mobile optimization
- **User Management**: View and manage all users with cascade deletion
- **Shop Verification**: Approve/reject merchant applications
- **Platform Analytics**: Responsive charts and performance metrics
- **Content Management**: Manage categories and platform settings
- **Role Hierarchy**: Admins can access merchant functionality without role changes
- **Real-time Updates**: Immediate stats refresh after operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: JWT tokens with role-based access
- **File Upload**: Cloudinary
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts with mobile responsiveness
- **Localization**: Indian currency formatting (₹)
- **Mobile-First**: Responsive design across all interfaces

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/myntra-ecommerce-clone.git
   cd myntra-ecommerce-clone
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/myntra-clone
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   node scripts/init-db.js
   node scripts/seed-data.js
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

\`\`\`
myntra-ecommerce-clone/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   ├── merchant/          # Merchant dashboard pages
│   ├── home/              # Main shopping pages
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── home/             # Home page components
│   └── ...
├── lib/                   # Utility functions and configurations
├── scripts/               # Database setup and seeding scripts
└── public/               # Static assets
\`\`\`

## 🔧 Configuration

### Database Setup
The application uses MongoDB. Make sure you have MongoDB installed and running, or use MongoDB Atlas for cloud hosting.

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your environment variables

### JWT Configuration
Generate a secure JWT secret for token signing:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## 🚦 Usage

### For Customers
1. **Sign up/Login**: Use your phone number to create an account
2. **Browse Products**: Explore categories and search for items
3. **Add to Cart**: Select size, color, and quantity
4. **Checkout**: Add delivery address and place order
5. **Track Orders**: Monitor order status and delivery

### For Merchants
1. **Register as Merchant**: Apply for merchant account
2. **Wait for Verification**: Admin approval required
3. **Add Products**: Upload product images and details
4. **Manage Orders**: Process customer orders
5. **View Analytics**: Track sales and performance

### For Admins
1. **Access Admin Panel**: Use admin credentials
2. **Verify Merchants**: Approve merchant applications
3. **Manage Users**: View and manage all platform users
4. **Monitor Platform**: Track overall platform metrics

## 🔐 Authentication Flow

1. User enters phone number
2. OTP is generated and sent (simulated in development)
3. User enters OTP for verification
4. JWT token is generated and stored
5. User is redirected based on role (user/merchant/admin)
6. **Role Hierarchy**: Admins have access to all merchant functionality
7. **Session Management**: Persistent login with token validation

## 📱 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/addresses` - Get user addresses
- `POST /api/user/addresses` - Add new address

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (merchant only)

### Shopping
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove cart item

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist` - Remove item with cascade deletion

### Admin APIs
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users` - Delete user with cascade cleanup
- `GET /api/admin/shops` - Get all shops
- `DELETE /api/admin/shops` - Delete shop with related data cleanup

## 🎨 Styling

The project uses Tailwind CSS for styling with a custom design system:

- **Primary Color**: Pink (#EC4899)
- **Secondary Colors**: Purple, Gray, Dark Red accents
- **Typography**: Inter font family
- **Components**: Radix UI primitives with custom styling
- **Mobile Responsive**: Breakpoint-based design (sm, md, lg, xl)
- **Indian Localization**: Currency formatting with ₹ symbol
- **Chart Styling**: Responsive charts with overflow prevention

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`
2. Start the production server:
   \`\`\`bash
   npm start
   \`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Myntra's user interface and functionality
- Built with modern web technologies and best practices
- Thanks to the open-source community for the amazing tools

## 📞 Support

If you have any questions or need help, please:
1. Check the documentation and recent improvements section
2. Review the development notes for implementation patterns
3. Search existing issues
4. Create a new issue with detailed information

### Quick Troubleshooting
- **Mobile Issues**: Check responsive breakpoints and overflow settings
- **Chart Problems**: Ensure proper container wrappers with overflow-hidden
- **Database Errors**: Verify MongoDB connection and collection indexes
- **Authentication**: Check JWT token validation and role permissions

## 🔄 Recent Improvements

### Mobile Responsiveness (Latest)
- **Admin Analytics**: Fixed chart overflow issues across all tabs
- **Admin Panel**: Mobile-optimized user and shop management
- **Merchant Dashboard**: Responsive product management interface
- **Category Filters**: Enhanced mobile filter styling with dark red borders

### Data Management
- **Cascade Deletion**: Implemented for users, shops, and wishlist items
- **Real-time Stats**: Immediate updates after admin operations
- **Indian Currency**: Proper ₹ formatting with locale support

### Access Control
- **Admin Privileges**: Admins can access merchant functionality
- **Role Hierarchy**: Proper permission management across interfaces

## 📝 Development Notes

### Key Implementation Details
- **Database Collections**: users, shops, products, orders, wishlist, bookings
- **Role System**: 'user', 'merchant', 'admin' with hierarchical access
- **Mobile Breakpoints**: Responsive design using Tailwind's sm/md/lg/xl
- **Chart Containers**: Use overflow-hidden wrappers for mobile chart display
- **Currency Format**: `formatPrice()` utility with 'en-IN' locale

### Common Patterns
- **API Routes**: Consistent error handling and JWT validation
- **Component Structure**: Reusable UI components in `/components/ui/`
- **State Management**: React Context for authentication
- **Database Queries**: MongoDB native driver with proper indexing

---

**Happy Shopping! 🛍️**
