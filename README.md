🪖 Helmet Detection System AI
An AI-powered Helmet Detection System for images and videos, built using YOLOv8 and OpenCV.

📌 Overview
This system detects whether a motorcyclist is wearing a helmet or not using deep learning.
It can process images, videos, and live camera feed, highlighting helmet violations in real-time.
Use cases:
Road safety enforcement
Traffic monitoring
Smart city surveillance
Construction site monitoring

✨ Features
Real-time helmet detection
Supports images, videos, and webcam input
Automatically draws bounding boxes around detections
Saves results in runs/detect/exp folder
Easy-to-run Python scripts
Fast inference using YOLOv8

🧰 Technologies & Libraries
Python 3.11+
YOLOv8
OpenCV
PyTorch
NumPy


⚙️ Installation
1️⃣ Clone the repository
git clone https://github.com/harshalcoder-ai/Helmet-detection-.git
cd Helmet-detection-
2️⃣ Install dependencies
pip install -r requirements.txt
3️⃣ Install YOLOv8 (if not included)
pip install ultralytics
▶️ How to Run
Using an image
python detect.py --source path_to_image.jpg
Using a video
python detect.py --source path_to_video.mp4

Results are saved in:

runs/detect/exp
📸 Example Output
Helmet Detected	No Helmet Detected

	
🎥 Demo GIF (Optional)

You can also show a short video demo converted into GIF:

![Demo](outputs/demo.gif)
🚀 Future Improvements

Number plate detection

Automatic license plate recognition (OCR)

Traffic violation detection

Automatic violation reporting via WhatsApp/email

Real-time web dashboard for authorities

🏆 GitHub Badges (Optional)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-orange)
![OpenCV](https://img.shields.io/badge/OpenCV-4.x-green)
👨‍💻 Author

Harshal Sonkusare
B.Tech – AI & Data Science, Priyadarshini College of Engineering, Nagpur

Skills: Machine Learning | Computer Vision | Python | Deep Learning | AI Systems

⭐ Support

If you like this project:
⭐ Star the repository | 🍴 Fork it | 🤝 Contribute improvements

📜 License

This project is for educational and research purposes.
