from ultralytics import YOLO
import cv2
import os

# -------------------------------------------------
# ✅ SAFE & CORRECT MODEL PATH
# -------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "helmet_train",
    "helmet_model",
    "weights",
    "best.pt"
)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")

# -------------------------------------------------
# ✅ Load YOLO model
# -------------------------------------------------
model = YOLO(MODEL_PATH)
print("Model classes:", model.names)

# -------------------------------------------------
# ✅ Output folder for violations
# -------------------------------------------------
violator_dir = os.path.join(BASE_DIR, "helmet_violations")
os.makedirs(violator_dir, exist_ok=True)

# -------------------------------------------------
# 🔹 Detect on Image
# -------------------------------------------------
def detect_on_image(image_path):
    print(f"🖼️ Detecting helmets in: {image_path}")
    model.predict(source=image_path, show=True, save=True)
    print("✅ Image detection complete. Results saved in 'runs/detect/'.")

# -------------------------------------------------
# 🔹 Detect on Video
# -------------------------------------------------
def detect_on_video(video_path):
    print(f"🎥 Processing video: {video_path}")
    model.predict(source=video_path, show=True, save=True)
    print("✅ Video detection complete. Results saved in 'runs/detect/'.")

# -------------------------------------------------
# 🔹 Real-Time Detection (Webcam)
# -------------------------------------------------
def realtime_detection():
    print("📸 Starting real-time helmet detection. Press 'Q' to quit.")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Cannot access camera.")
        return

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # ✅ Confidence threshold applied
        results = model(frame, conf=0.25)

        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names[cls_id]

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # ✅ Use exact labels and colors
            if label == "With Helmet":
                color = (0, 255, 0)       # Green
            elif label == "Without Helmet":
                color = (0, 0, 255)       # Red
            else:
                color = (255, 255, 255)   # White (fallback)

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(
                frame,
                f"{label} {conf:.2f}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2
            )

            # ✅ Save violators only for "Without Helmet"
            if label == "Without Helmet":
                violator = frame[y1:y2, x1:x2]
                if violator.size != 0:
                    frame_count += 1
                    cv2.imwrite(
                        os.path.join(violator_dir, f"violator_{frame_count}.jpg"),
                        violator
                    )

        cv2.imshow("Helmet Detection - Real Time", frame)

        if cv2.waitKey(1) & 0xFF in [ord('q'), ord('Q')]:
            break

    cap.release()
    cv2.destroyAllWindows()
    print("👋 Webcam closed. Detection stopped.")

# -------------------------------------------------
# 🔹 MAIN MENU
# -------------------------------------------------
if __name__ == "__main__":
    print("\n🚦 Helmet Detection System")
    print("1️⃣  Detect on Image")
    print("2️⃣  Detect on Video")
    print("3️⃣  Real-Time Detection (Webcam)\n")

    choice = input("Enter choice (1/2/3): ").strip()

    if choice == "1":
        img_path = input("Enter full image path: ").strip()
        detect_on_image(img_path)

    elif choice == "2":
        vid_path = input("Enter full video path: ").strip()
        detect_on_video(vid_path)

    elif choice == "3":
        realtime_detection()

    else:
        print("❌ Invalid choice. Please enter 1, 2, or 3.")
