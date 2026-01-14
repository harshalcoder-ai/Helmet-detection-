from ultralytics import YOLO

# Load YOLOv8n base model
model = YOLO('yolov8n.pt')

# Train on your dataset
model.train(
    data=r'D:\create-anything_\apps\web\helmet_dataset\data.yaml',
    epochs=50,
    imgsz=640,
    batch=8,
    name='helmet-detection'
)
