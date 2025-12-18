import os
import random
import shutil

SOURCE_DIR = "datasets/rice_raw"
DEST_DIR = "datasets/rice"
SPLIT_RATIO = 0.8  # 80% train, 20% val

classes = os.listdir(SOURCE_DIR)

for cls in classes:
    src_cls_path = os.path.join(SOURCE_DIR, cls)
    images = os.listdir(src_cls_path)
    random.shuffle(images)

    split_point = int(len(images) * SPLIT_RATIO)
    train_imgs = images[:split_point]
    val_imgs = images[split_point:]

    for split, split_imgs in [("train", train_imgs), ("val", val_imgs)]:
        dest_cls_path = os.path.join(DEST_DIR, split, cls)
        os.makedirs(dest_cls_path, exist_ok=True)

        for img in split_imgs:
            shutil.copy(
                os.path.join(src_cls_path, img),
                os.path.join(dest_cls_path, img)
            )

    print(f"{cls}: {len(train_imgs)} train, {len(val_imgs)} val")

print("✅ Dataset split completed!")
