"""
Quick Launcher & Environment Setup Script for Gen Z Dictionary
Checks for dependencies, initializes virtual environment if needed,
and launches the Flask server on http://127.0.0.1:5000.
"""

import sys
import os
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def main():
    print("==================================================")
    print("🔥 Gen Z Dictionary - Full-Stack College Project")
    print("==================================================")

    # Check if Flask is installed in current python environment
    try:
        import flask
        print(f"✅ Found Flask {flask.__version__}")
    except ImportError:
        print("⚙️ Flask not found in current environment. Installing requirements...")
        req_file = os.path.join(os.path.dirname(__file__), 'requirements.txt')
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', req_file])
        print("✅ Requirements installed successfully!")

    # Start Flask Server
    print("\n🚀 Starting Flask Backend on http://127.0.0.1:5000 ...")
    print("👉 Open your browser to: http://127.0.0.1:5000")
    print("Press Ctrl+C to stop the server.\n")

    import server
    port = int(os.environ.get('PORT', 5000))
    server.app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    main()
