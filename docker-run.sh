#!/bin/bash

# WebUI User Management System - Docker Run Script
# This script builds and runs the complete system using Docker Compose

echo "🚀 Starting WebUI User Management System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."

echo "📊 Service Status:"
echo "=================="

# Check PostgreSQL
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

# Check Redis
if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not running"
fi

# Check Backend
if docker-compose ps backend | grep -q "Up"; then
    echo "✅ Backend API: Running"
else
    echo "❌ Backend API: Not running"
fi

# Check Frontend
if docker-compose ps frontend | grep -q "Up"; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not running"
fi

# Check Nginx
if docker-compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx: Running"
else
    echo "⚠️  Nginx: Not running (optional)"
fi

echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "Frontend: http://localhost:3002"
echo "Backend API: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""

echo "📋 Available Commands:"
echo "======================"
echo "View logs: docker-compose logs -f [service_name]"
echo "Stop services: docker-compose down"
echo "Restart services: docker-compose restart"
echo "View service status: docker-compose ps"
echo ""

echo "🎉 WebUI User Management System is now running!"
echo "💡 Tip: Use 'docker-compose logs -f' to view real-time logs"