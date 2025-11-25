#!/bin/bash

# Database Collections Update Script
# This script deploys the missing database collections to your MongoDB

echo "🚀 One Last AI - Database Collections Update"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  Warning: MONGODB_URI environment variable not set"
    echo "   Make sure your .env file contains the MongoDB connection string"
    echo ""
fi

# Build the project to ensure all TypeScript files are compiled
echo "🔧 Building project..."
cd backend
npm run build 2>/dev/null || echo "ℹ️  Build step skipped (no build script)"

# Run the database initialization
echo "📊 Initializing database collections..."
node init-database.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database collections updated successfully!"
    echo ""
    echo "📊 New Collections Added:"
    echo "   • jobapplications - Career application submissions"
    echo "   • contactmessages - Contact form persistence"
    echo "   • Admin dashboard API endpoints"
    echo ""
    echo "🔗 Test your new collections:"
    echo "   • Job Applications: POST /api/job-applications"
    echo "   • Contact Messages: GET/POST /api/contact"
    echo "   • Admin Dashboard: GET /api/admin/dashboard?type=overview"
    echo ""
    echo "💡 Next Steps:"
    echo "   1. Test job application form on /resources/careers"
    echo "   2. Test contact forms throughout the site"
    echo "   3. Check MongoDB Compass for new collections"
    echo ""
else
    echo ""
    echo "❌ Database initialization failed!"
    echo "   Check the error messages above and ensure:"
    echo "   • MongoDB URI is correct in .env file"
    echo "   • MongoDB server is accessible"
    echo "   • Network connectivity is available"
    echo ""
fi

cd ..
echo "🏁 Database update complete!"