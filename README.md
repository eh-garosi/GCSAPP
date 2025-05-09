# GCS (Glasgow Coma Scale) Tracking Application

This repository contains a server-based application for measuring, recording, and tracking patient Glasgow Coma Scale (GCS) scores over time. This application provides a comprehensive solution for healthcare professionals to monitor patient neurological status with historical data visualization and analytics.

## Features

- **Patient Management**: Create, update, and organize patient records
- **GCS Calculation**: Accurate calculation of GCS scores with guidance
- **Historical Tracking**: Track and visualize patient GCS scores over time
- **Bilingual Support**: English and Persian (Farsi) language support
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Capability**: Full functionality with or without server connection
- **Data Visualization**: Interactive charts showing GCS trends

## Repository Structure

```
/
├── app.py                # Flask server application
├── requirements.txt      # Python dependencies
├── static/               # Static files for web app
│   ├── index.html        # Main HTML file
│   ├── css/              # CSS styles
│   │   └── styles.css    # Main stylesheet
│   ├── js/               # JavaScript files
│   │   └── script.js     # Main application logic
│   └── images/           # Application images
├── gcs_data.db           # SQLite database (created at runtime)
└── README.md             # Documentation
```

## Setup Instructions

### Prerequisites

- Python 3.8+ installed
- Git for version control
- Visual Studio Code (recommended, but optional)
- Miniconda or Anaconda (as mentioned in your requirements)

### Server Setup (Flask Backend)

1. Clone this repository:
   ```bash
   git clone https://github.com/eh-garosi/GCSAPP.git
   cd GCSAPP
   ```

2. Create and activate a Conda environment:
   ```bash
   conda create -n gcsapp python=3.9
   conda activate gcsapp
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize and start the server:
   ```bash
   python app.py
   ```
   
   The server will start at `http://localhost:5000`

### Frontend Setup

The frontend is automatically served by the Flask server from the `static` folder. You don't need to set up any separate frontend server.

### Offline Development Mode

The application includes mock data functionality, allowing you to develop and test without running the backend server. If the server is unreachable, the frontend will automatically switch to using mock data.

## Converting to Android APK

After setting up the server, you can convert the web application to an Android APK using one of the following methods:

### Method 1: Using a WebView-Based Service

1. Use [WebIntoApp](https://www.webintoapp.com/) or [AppsGeyser](https://appsgeyser.com/) to convert the web app to an Android APK.
2. Enter your server URL (e.g., `http://your-server-ip:5000`) or upload the frontend files directly.
3. Configure app settings, icons, and permissions.
4. Download the generated APK.

### Method 2: Using Android Studio with WebView

1. Install Android Studio
2. Create a new Android project
3. Add a WebView to load your app from the server
4. Configure settings like app name and icon
5. Build the APK file

A basic Android Studio project structure would look like:

```java
// MainActivity.java
import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        WebView webView = findViewById(R.id.webView);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // Load from server
        webView.loadUrl("http://your-server-ip:5000");
        
        // For offline use, load from assets
        // webView.loadUrl("file:///android_asset/index.html");
    }
}
```

## Deployment Options

### Local Network Deployment

1. Run the Flask server on a computer in your local network
2. Access the application from other devices using the server's IP address:
   ```
   http://server-ip-address:5000
   ```

### Cloud Deployment

1. Deploy the Flask application to a cloud provider (Heroku, AWS, etc.)
2. Configure the server for production (use a production WSGI server like Gunicorn)
3. Access the application from anywhere using the cloud URL

### Standalone Desktop Application

You can use tools like PyInstaller to create a standalone desktop application that includes both the server and frontend components.

## Data Privacy and Security

This application is designed for handling sensitive patient data. When deploying in a production environment:

1. Enable HTTPS using SSL certificates
2. Implement proper authentication and authorization
3. Follow local healthcare data protection regulations (HIPAA, GDPR, etc.)
4. Use secure database configurations with regular backups

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Ensure the `gcs_data.db` file has proper write permissions
- **Server Not Starting**: Check if port 5000 is already in use by another application
- **CORS Errors**: Verify that the CORS settings in `app.py` match your deployment environment

### Development Tools

- Use browser developer tools (F12) to debug frontend issues
- Use Python debugger (pdb) for backend troubleshooting
- Check Flask logs for server-side errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support or questions, please open an issue on this repository or contact the repository owner.