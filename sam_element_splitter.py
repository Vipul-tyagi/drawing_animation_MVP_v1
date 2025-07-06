import torch
import cv2
import numpy as np
from PIL import Image
import os
import urllib.request
from typing import List, Dict

class SAMElementSplitter:
    """
    Enhanced element splitter using Meta's Segment Anything Model
    Provides much more accurate segmentation than traditional methods
    """
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._setup_sam()
    
    def _setup_sam(self):
        """Initialize SAM model"""
        try:
            # Try to import SAM
            from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
            
            # Download SAM checkpoint if not exists
            checkpoint_path = "sam_vit_h_4b8939.pth"
            if not os.path.exists(checkpoint_path):
                print("📥 Downloading SAM checkpoint (this may take a while)...")
                urllib.request.urlretrieve(
                    "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth",
                    checkpoint_path
                )
                print("✅ SAM checkpoint downloaded")
            
            # Load SAM model
            sam = sam_model_registry["vit_h"](checkpoint=checkpoint_path)
            sam.to(device=self.device)
            
            # Create automatic mask generator with optimized settings for children's drawings
            self.mask_generator = SamAutomaticMaskGenerator(
                model=sam,
                points_per_side=32,
                pred_iou_thresh=0.88,  # Slightly lower for children's drawings
                stability_score_thresh=0.92,  # Slightly lower for children's drawings
                crop_n_layers=1,
                crop_n_points_downscale_factor=2,
                min_mask_region_area=800,  # Filter small regions
                box_nms_thresh=0.7,
                crop_nms_thresh=0.7,
            )
            print("✅ SAM model loaded successfully")
            
        except ImportError:
            print("⚠️ SAM not installed. Install with: pip install git+https://github.com/facebookresearch/segment-anything.git")
            self.mask_generator = None
        except Exception as e:
            print(f"⚠️ SAM setup failed: {e}")
            self.mask_generator = None
    
    def split_drawing_elements(self, image_path: str) -> List[Dict]:
        """
        Split drawing using SAM - much more accurate than traditional methods
        """
        print("🎨 Analyzing drawing with Segment Anything...")
        
        if self.mask_generator is None:
            print("⚠️ SAM not available, falling back to traditional methods")
            return self._fallback_segmentation(image_path)
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                print(f"⚠️ Could not load image: {image_path}")
                return []
            
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Preprocess image for better SAM performance on children's drawings
            processed_image = self._preprocess_for_sam(image_rgb)
            
            # Generate masks with SAM
            print("🔍 Generating masks with SAM...")
            masks = self.mask_generator.generate(processed_image)
            
            # Post-process and filter masks
            elements = self._process_sam_masks(masks, image_rgb)
            
            # Sort by area and quality
            elements.sort(key=lambda x: x['area'] * x['stability_score'], reverse=True)
            
            print(f"✅ SAM found {len(elements)} high-quality elements")
            return elements[:12]  # Limit to top 12 elements
            
        except Exception as e:
            print(f"⚠️ SAM segmentation failed: {e}")
            return self._fallback_segmentation(image_path)
    
    def _preprocess_for_sam(self, image_rgb: np.ndarray) -> np.ndarray:
        """Preprocess image for better SAM performance on children's drawings"""
        # Enhance contrast for better edge detection
        lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        
        # Merge channels and convert back
        enhanced = cv2.merge([l, a, b])
        enhanced_rgb = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        # Slight denoising to reduce noise while preserving edges
        denoised = cv2.bilateralFilter(enhanced_rgb, 9, 75, 75)
        
        return denoised
    
    def _ensure_valid_bbox(self, bbox, img_shape):
        """Ensure bounding box coordinates are valid integers"""
        img_height, img_width = img_shape[:2]
        
        x, y, w, h = bbox
        x, y, w, h = int(x), int(y), int(w), int(h)
        
        # Clamp to image boundaries
        x = max(0, min(x, img_width - 1))
        y = max(0, min(y, img_height - 1))
        w = max(1, min(w, img_width - x))
        h = max(1, min(h, img_height - y))
        
        return x, y, w, h
    
    def _process_sam_masks(self, masks: List[Dict], original_image: np.ndarray) -> List[Dict]:
        """Process SAM masks into our element format"""
        elements = []
        
        for i, mask_data in enumerate(masks):
            try:
                # Extract mask information
                mask = mask_data['segmentation']
                bbox = mask_data['bbox']  # [x, y, w, h]
                area = mask_data['area']
                stability_score = mask_data['stability_score']
                predicted_iou = mask_data['predicted_iou']
                
                # Quality filtering
                if (area < 1000 or  # Too small
                    stability_score < 0.85 or  # Not stable enough
                    predicted_iou < 0.8):  # Not confident enough
                    continue
                
                # Size filtering - avoid too large masks (likely background)
                image_area = original_image.shape[0] * original_image.shape[1]
                if area > image_area * 0.6:  # Skip if mask covers more than 60% of image
                    continue
                
                # CRITICAL FIX: Ensure valid integer coordinates
                x, y, w, h = self._ensure_valid_bbox(bbox, original_image.shape)
                
                # Additional quality checks
                aspect_ratio = w / h if h > 0 else 1
                if aspect_ratio > 10 or aspect_ratio < 0.1:  # Skip extremely elongated shapes
                    continue
                
                # Extract element image with proper masking
                element_img = self._extract_element_image(original_image, mask, [x, y, w, h])
                
                if element_img is None:
                    continue
                
                elements.append({
                    'type': f'sam_segment_{i}',
                    'image': element_img,
                    'mask': mask[y:y+h, x:x+w],  # Now safe with validated coordinates
                    'bbox': (x, y, w, h),
                    'center': (x + w//2, y + h//2),
                    'area': int(area),
                    'stability_score': float(stability_score),
                    'predicted_iou': float(predicted_iou),
                    'aspect_ratio': float(aspect_ratio),
                    'sam_data': mask_data
                })
                
            except Exception as e:
                print(f"⚠️ Failed to process mask {i}: {e}")
                continue
        
        return elements
    
    def _extract_element_image(self, original_image: np.ndarray, mask: np.ndarray, bbox: List[int]) -> np.ndarray:
        """Extract element image with proper background handling"""
        try:
            x, y, w, h = bbox
            
            # CRITICAL FIX: Ensure all coordinates are integers
            x, y, w, h = int(x), int(y), int(w), int(h)
            
            # Validate coordinates
            img_height, img_width = original_image.shape[:2]
            x = max(0, min(x, img_width - 1))
            y = max(0, min(y, img_height - 1))
            w = max(1, min(w, img_width - x))
            h = max(1, min(h, img_height - y))
            
            # Create element image
            element_img = original_image.copy()
            
            # Apply mask - set non-mask areas to white
            element_img[~mask] = [255, 255, 255]
            
            # Crop to bounding box with integer coordinates
            cropped = element_img[y:y+h, x:x+w]
            
            # Ensure minimum size
            if cropped.shape[0] < 10 or cropped.shape[1] < 10:
                return None
                
            return cropped
            
        except Exception as e:
            print(f"⚠️ Element extraction failed: {e}")
            return None
    
    def _fallback_segmentation(self, image_path: str) -> List[Dict]:
        """Fallback to traditional segmentation methods if SAM fails"""
        try:
            # Import the traditional ElementSplitter
            from element_splitter import ElementSplitter
            traditional_splitter = ElementSplitter()
            return traditional_splitter.split_drawing_elements(image_path)
        except Exception as e:
            print(f"⚠️ Fallback segmentation failed: {e}")
            return []
