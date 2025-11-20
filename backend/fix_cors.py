#!/usr/bin/env python3
"""
Quick fix for CORS issues in main.py
"""

import os
import re


def fix_cors_in_main():
    """Update CORS configuration in main.py"""

    print("🔧 Fixing CORS configuration in main.py...")

    # Read main.py
    if not os.path.exists('main.py'):
        print("❌ main.py not found. Are you in the backend directory?")
        return False

    with open('main.py', 'r') as f:
        content = f.read()

    # Check if CORS is already configured
    if 'CORSMiddleware' not in content:
        print("❌ CORSMiddleware not found in main.py")
        print("Please add CORS middleware manually")
        return False

    # Find the CORS configuration
    cors_pattern = r'app\.add_middleware\(\s*CORSMiddleware,\s*allow_origins\s*=\s*\[(.*?)\]'
    match = re.search(cors_pattern, content, re.DOTALL)

    if match:
        current_origins = match.group(1)
        print(f"Current origins: {current_origins}")

        # Check if localhost:3111 is already there
        if '3111' in current_origins:
            print("✅ Port 3111 already in CORS origins")
            return True

        # Create backup
        with open('main.py.backup', 'w') as f:
            f.write(content)
        print("✅ Created backup: main.py.backup")

        # Update CORS origins
        new_cors_config = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3111",  # Added for frontend
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3111",
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)'''

        # Replace the CORS configuration
        updated_content = re.sub(
            r'app\.add_middleware\(\s*CORSMiddleware,.*?\)',
            new_cors_config,
            content,
            flags=re.DOTALL
        )

        # Write updated content
        with open('main.py', 'w') as f:
            f.write(updated_content)

        print("✅ Updated CORS configuration in main.py")
        print("\n📝 Changes made:")
        print("- Added http://localhost:3111 to allowed origins")
        print("- Added wildcard (*) for development")
        print("- Enabled all methods and headers")

        return True
    else:
        print("❌ Could not find CORS configuration pattern")
        print("\nPlease manually update your main.py with:")
        print('''
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3111",
        "*"  # For development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
''')
        return False


def create_frontend_env():
    """Create or update frontend .env file"""

    print("\n🔧 Checking frontend .env configuration...")

    # Try to find frontend directory
    frontend_paths = ['../frontend', '../../frontend',
                      '../greencart-hackathon/frontend']
    frontend_dir = None

    for path in frontend_paths:
        if os.path.exists(path):
            frontend_dir = path
            break

    if not frontend_dir:
        print("❌ Frontend directory not found")
        return False

    env_path = os.path.join(frontend_dir, '.env')

    if os.path.exists(env_path):
        print(f"✅ Found frontend .env at: {os.path.abspath(env_path)}")

        with open(env_path, 'r') as f:
            content = f.read()

        if 'REACT_APP_API_URL' not in content:
            # Append API URL
            with open(env_path, 'a') as f:
                f.write(
                    '\n# Backend API URL\nREACT_APP_API_URL=http://localhost:8000\n')
            print("✅ Added REACT_APP_API_URL to frontend .env")
    else:
        # Create new .env
        with open(env_path, 'w') as f:
            f.write('# Frontend Environment Variables\n')
            f.write('REACT_APP_API_URL=http://localhost:8000\n')
            f.write('PORT=3111\n')
        print(f"✅ Created frontend .env at: {os.path.abspath(env_path)}")

    return True


def main():
    print("🚀 GreenCart CORS & Frontend Connection Fixer")
    print("="*45)

    # Fix CORS
    cors_fixed = fix_cors_in_main()

    # Fix frontend env
    frontend_fixed = create_frontend_env()

    if cors_fixed:
        print("\n✅ CORS configuration updated!")
        print("\n🔄 Please restart your backend server:")
        print("   Press Ctrl+C to stop, then run again:")
        print("   uvicorn main:app --reload")

    if frontend_fixed:
        print("\n✅ Frontend configuration updated!")
        print("\n🔄 Please restart your frontend server:")
        print("   Press Ctrl+C to stop, then run again:")
        print("   npm start")

    print("\n📝 Summary:")
    print("1. CORS has been configured to accept requests from localhost:3111")
    print("2. Frontend .env has been configured with backend URL")
    print("3. Restart both servers")
    print("4. Try the chat again - it should work now!")


if __name__ == "__main__":
    main()
