import cv2
import numpy as np
import torch
from PIL import Image
import clip
from transformers import pipeline
from typing import Dict, List, Tuple
import os
import logging

class AIElementClassifier:
    """
    AI-powered classifier to identify and categorize drawing elements
    Based on Meta's children's drawing animation research with enhanced functionality
    """
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.logger = self._setup_logging()
        
        # Enhanced object categories with animation behaviors (inspired by Meta's research)
        self.object_categories = {
            'sun': {'movement': 'arc_motion', 'speed': 'slow', 'pattern': 'sunrise_sunset', 'layer': 'background'},
            'cloud': {'movement': 'drift', 'speed': 'slow', 'pattern': 'floating', 'layer': 'background'},
            'tree': {'movement': 'sway', 'speed': 'very_slow', 'pattern': 'wind_sway', 'layer': 'midground'},
            'house': {'movement': 'static', 'speed': 'none', 'pattern': 'breathing', 'layer': 'midground'},
            'building': {'movement': 'static', 'speed': 'none', 'pattern': 'breathing', 'layer': 'midground'},
            'animal': {'movement': 'walk', 'speed': 'medium', 'pattern': 'ground_walk', 'layer': 'foreground'},
            'dog': {'movement': 'walk', 'speed': 'medium', 'pattern': 'playful_walk', 'layer': 'foreground'},
            'cat': {'movement': 'walk', 'speed': 'slow', 'pattern': 'graceful_walk', 'layer': 'foreground'},
            'bird': {'movement': 'fly', 'speed': 'fast', 'pattern': 'sky_flight', 'layer': 'foreground'},
            'flower': {'movement': 'grow', 'speed': 'slow', 'pattern': 'bloom', 'layer': 'foreground'},
            'car': {'movement': 'drive', 'speed': 'fast', 'pattern': 'road_drive', 'layer': 'foreground'},
            'person': {'movement': 'walk', 'speed': 'medium', 'pattern': 'human_walk', 'layer': 'foreground'},
            'child': {'movement': 'walk', 'speed': 'medium', 'pattern': 'playful_walk', 'layer': 'foreground'},
            'mountain': {'movement': 'static', 'speed': 'none', 'pattern': 'breathing', 'layer': 'background'},
            'water': {'movement': 'flow', 'speed': 'medium', 'pattern': 'wave_motion', 'layer': 'background'},
            'river': {'movement': 'flow', 'speed': 'medium', 'pattern': 'stream_flow', 'layer': 'background'},
            'rainbow': {'movement': 'appear', 'speed': 'slow', 'pattern': 'fade_in', 'layer': 'background'},
            'star': {'movement': 'twinkle', 'speed': 'fast', 'pattern': 'sparkle', 'layer': 'background'},
            'moon': {'movement': 'arc_motion', 'speed': 'very_slow', 'pattern': 'night_arc', 'layer': 'background'},
            'grass': {'movement': 'sway', 'speed': 'slow', 'pattern': 'grass_wave', 'layer': 'background'},
            'fish': {'movement': 'swim', 'speed': 'medium', 'pattern': 'underwater_swim', 'layer': 'foreground'},
            'boat': {'movement': 'float', 'speed': 'slow', 'pattern': 'water_float', 'layer': 'midground'},
            # Additional elements for comprehensive classification
            'butterfly': {'movement': 'flutter', 'speed': 'medium', 'pattern': 'butterfly_dance', 'layer': 'foreground'},
            'airplane': {'movement': 'fly', 'speed': 'fast', 'pattern': 'sky_flight', 'layer': 'background'},
            'balloon': {'movement': 'float', 'speed': 'slow', 'pattern': 'gentle_float', 'layer': 'foreground'},
            'kite': {'movement': 'fly', 'speed': 'medium', 'pattern': 'wind_dance', 'layer': 'foreground'},
            'bicycle': {'movement': 'ride', 'speed': 'medium', 'pattern': 'road_ride', 'layer': 'foreground'},
            'train': {'movement': 'drive', 'speed': 'fast', 'pattern': 'track_motion', 'layer': 'foreground'},
            'swing': {'movement': 'swing', 'speed': 'medium', 'pattern': 'pendulum', 'layer': 'foreground'},
            'slide': {'movement': 'static', 'speed': 'none', 'pattern': 'breathing', 'layer': 'midground'},
            'ball': {'movement': 'bounce', 'speed': 'fast', 'pattern': 'ball_bounce', 'layer': 'foreground'},
            'umbrella': {'movement': 'sway', 'speed': 'slow', 'pattern': 'gentle_sway', 'layer': 'foreground'}
        }
        
        self._setup_models()
    
    def _setup_logging(self):
        """Setup logging for the classifier"""
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger(__name__)
    
    def _setup_models(self):
        """Initialize AI models for object classification"""
        try:
            # CLIP for semantic understanding
            self.clip_model, self.clip_preprocess = clip.load("ViT-B/32", device=self.device)
            self.logger.info("✅ CLIP model loaded for object classification")
            
            # Object labels for classification
            self.object_labels = list(self.object_categories.keys())
            
            # Add context-aware prompts
            self.context_prompts = {
                'children_drawing': "a child's drawing of a {object}",
                'simple_drawing': "a simple drawing of a {object}",
                'cartoon': "a cartoon {object}",
                'sketch': "a sketch of a {object}",
                'colorful_drawing': "a colorful drawing of a {object}",
                'family_drawing': "a family drawing with a {object}",
                'house_tree_person': "a {object} in a house-tree-person drawing"
            }
            
        except Exception as e:
            self.logger.error(f"⚠️ AI model setup failed: {e}")
            self.clip_model = None
    
    def classify_element(self, element_image: np.ndarray, element_info: Dict, 
                        drawing_context: str = "children_drawing") -> Dict:
        """
        Classify what type of object this element represents using AI
        """
        try:
            if self.clip_model is None:
                return self._fallback_classification(element_info)
            
            # Convert to PIL Image for CLIP
            pil_image = Image.fromarray(element_image)
            
            # Preprocess for CLIP
            image_input = self.clip_preprocess(pil_image).unsqueeze(0).to(self.device)
            
            # Create context-aware text prompts
            prompt_template = self.context_prompts.get(drawing_context, "a drawing of a {object}")
            text_prompts = [prompt_template.format(object=label) for label in self.object_labels]
            text_inputs = clip.tokenize(text_prompts).to(self.device)
            
            # Get predictions
            with torch.no_grad():
                image_features = self.clip_model.encode_image(image_input)
                text_features = self.clip_model.encode_text(text_inputs)
                
                # Calculate similarities
                similarities = (100.0 * image_features @ text_features.T).softmax(dim=-1)
            
            # Get top 3 matches for better decision making
            top3_indices = similarities.argsort(descending=True)[0][:3]
            top3_scores = [similarities[0][idx].item() for idx in top3_indices]
            top3_labels = [self.object_labels[idx] for idx in top3_indices]
            
            # Add shape-based hints for better classification
            shape_hints = self._analyze_shape_hints(element_info)
            
            # Refine classification with shape hints and context
            predicted_label = self._refine_with_context(top3_labels, top3_scores, shape_hints, drawing_context)
            confidence = top3_scores[0] if predicted_label == top3_labels[0] else top3_scores[top3_labels.index(predicted_label)]
            
            # Get animation properties
            animation_props = self.object_categories.get(predicted_label, {
                'movement': 'float', 'speed': 'medium', 'pattern': 'gentle_motion', 'layer': 'foreground'
            })
            
            # Calculate psychological significance
            psychological_significance = self._assess_psychological_significance(predicted_label, element_info)
            
            return {
                'label': predicted_label,
                'confidence': confidence,
                'animation_type': animation_props['movement'],
                'animation_speed': animation_props['speed'],
                'animation_pattern': animation_props['pattern'],
                'layer': animation_props['layer'],
                'shape_hints': shape_hints,
                'top3_predictions': list(zip(top3_labels, top3_scores)),
                'psychological_significance': psychological_significance,
                'element_properties': self._extract_element_properties(element_info)
            }
            
        except Exception as e:
            self.logger.error(f"⚠️ Classification failed: {e}")
            return self._fallback_classification(element_info)
    
    def _analyze_shape_hints(self, element_info: Dict) -> Dict:
        """Analyze shape characteristics to help with classification"""
        bbox = element_info['bbox']
        x, y, w, h = bbox
        aspect_ratio = w / h if h > 0 else 1
        area = element_info['area']
        
        # Position-based hints (adapted for children's drawings)
        position_hints = {
            'is_sky_area': y < 150,  # Top area - likely sun, clouds, birds, moon, stars
            'is_ground_area': y > 350,  # Bottom area - likely animals, people, cars, flowers
            'is_middle_area': 150 <= y <= 350,  # Middle - likely trees, houses, buildings
            'is_left_side': x < 200,
            'is_right_side': x > 400,
            'is_center_horizontal': 200 <= x <= 400,
            'is_very_top': y < 100,
            'is_very_bottom': y > 450
        }
        
        # Shape-based hints
        shape_hints = {
            'is_circular': 0.8 <= aspect_ratio <= 1.2 and area > 1000,
            'is_very_circular': 0.9 <= aspect_ratio <= 1.1 and area > 1000,
            'is_horizontal_rect': aspect_ratio > 1.5,
            'is_vertical_rect': aspect_ratio < 0.7,
            'is_square': 0.8 <= aspect_ratio <= 1.2,
            'is_large': area > 8000,
            'is_medium': 2000 <= area <= 8000,
            'is_small': area < 2000,
            'is_very_small': area < 500,
            'is_elongated': aspect_ratio > 2.0 or aspect_ratio < 0.5,
            'is_compact': 0.7 <= aspect_ratio <= 1.3
        }
        
        return {**position_hints, **shape_hints}
    
    def _refine_with_context(self, top3_labels: List[str], top3_scores: List[float],
                           shape_hints: Dict, drawing_context: str) -> str:
        """Refine classification using shape hints, position, and context"""
        primary_label = top3_labels[0]
        primary_score = top3_scores[0]
        
        # If confidence is very high, trust the AI
        if primary_score > 0.7:
            return primary_label
        
        # Apply heuristic rules for children's drawings
        if shape_hints['is_sky_area']:
            # Sky area objects
            if shape_hints['is_very_circular']:
                if 'sun' in top3_labels:
                    return 'sun'
                elif 'moon' in top3_labels:
                    return 'moon'
                elif 'balloon' in top3_labels:
                    return 'balloon'
            elif shape_hints['is_horizontal_rect'] or shape_hints['is_medium']:
                if 'cloud' in top3_labels:
                    return 'cloud'
                elif 'rainbow' in top3_labels:
                    return 'rainbow'
            elif shape_hints['is_small']:
                if 'star' in top3_labels:
                    return 'star'
                elif 'bird' in top3_labels:
                    return 'bird'
                elif 'airplane' in top3_labels:
                    return 'airplane'
        
        elif shape_hints['is_ground_area']:
            # Ground area objects
            if shape_hints['is_medium'] or shape_hints['is_large']:
                # Prioritize animals and people in ground area
                for label in ['animal', 'dog', 'cat', 'person', 'child']:
                    if label in top3_labels:
                        return label
                # Then vehicles
                for label in ['car', 'bicycle', 'train']:
                    if label in top3_labels:
                        return label
            elif shape_hints['is_small']:
                if 'flower' in top3_labels:
                    return 'flower'
                elif 'ball' in top3_labels:
                    return 'ball'
        
        elif shape_hints['is_middle_area']:
            # Middle area objects
            if shape_hints['is_vertical_rect'] or (shape_hints['is_large'] and not shape_hints['is_horizontal_rect']):
                if 'tree' in top3_labels:
                    return 'tree'
            elif shape_hints['is_horizontal_rect'] or shape_hints['is_square']:
                for label in ['house', 'building']:
                    if label in top3_labels:
                        return label
        
        # Special context-based refinements
        if drawing_context == 'family_drawing':
            # Prioritize people and houses in family drawings
            for label in ['person', 'child', 'house']:
                if label in top3_labels:
                    return label
        
        elif drawing_context == 'house_tree_person':
            # Prioritize the main elements
            for label in ['house', 'tree', 'person']:
                if label in top3_labels:
                    return label
        
        # Special cases
        if shape_hints['is_horizontal_rect'] and shape_hints['is_sky_area']:
            if 'rainbow' in top3_labels:
                return 'rainbow'
        
        # If no heuristic matches, return the AI's top prediction
        return primary_label
    
    def _fallback_classification(self, element_info: Dict) -> Dict:
        """Fallback classification based on shape analysis only"""
        shape_hints = self._analyze_shape_hints(element_info)
        
        # Enhanced heuristic classification
        if shape_hints['is_sky_area'] and shape_hints['is_very_circular']:
            label = 'sun'
        elif shape_hints['is_sky_area'] and shape_hints['is_horizontal_rect']:
            label = 'cloud'
        elif shape_hints['is_sky_area'] and shape_hints['is_small']:
            label = 'star'
        elif shape_hints['is_middle_area'] and shape_hints['is_vertical_rect']:
            label = 'tree'
        elif shape_hints['is_middle_area'] and (shape_hints['is_horizontal_rect'] or shape_hints['is_square']):
            label = 'house'
        elif shape_hints['is_ground_area'] and shape_hints['is_small']:
            label = 'flower'
        elif shape_hints['is_ground_area'] and shape_hints['is_medium']:
            label = 'animal'
        elif shape_hints['is_ground_area'] and shape_hints['is_large']:
            label = 'person'
        else:
            label = 'animal'  # Default fallback
        
        animation_props = self.object_categories.get(label, {
            'movement': 'float', 'speed': 'medium', 'pattern': 'gentle_motion', 'layer': 'foreground'
        })
        
        return {
            'label': label,
            'confidence': 0.5,
            'animation_type': animation_props['movement'],
            'animation_speed': animation_props['speed'],
            'animation_pattern': animation_props['pattern'],
            'layer': animation_props['layer'],
            'shape_hints': shape_hints,
            'top3_predictions': [(label, 0.5)],
            'psychological_significance': self._assess_psychological_significance(label, element_info),
            'element_properties': self._extract_element_properties(element_info)
        }
    
    def _assess_psychological_significance(self, label: str, element_info: Dict) -> Dict:
        """Assess the psychological significance of the classified element"""
        
        # Psychological significance mapping based on art therapy research
        psychological_mapping = {
            'sun': {'emotional_valence': 'positive', 'significance': 'high', 'meaning': 'warmth, energy, optimism'},
            'cloud': {'emotional_valence': 'neutral', 'significance': 'medium', 'meaning': 'dreams, imagination, change'},
            'tree': {'emotional_valence': 'positive', 'significance': 'high', 'meaning': 'growth, stability, life force'},
            'house': {'emotional_valence': 'positive', 'significance': 'very_high', 'meaning': 'security, family, belonging'},
            'person': {'emotional_valence': 'neutral', 'significance': 'very_high', 'meaning': 'relationships, self-concept'},
            'child': {'emotional_valence': 'positive', 'significance': 'very_high', 'meaning': 'innocence, playfulness, self'},
            'animal': {'emotional_valence': 'positive', 'significance': 'medium', 'meaning': 'companionship, instincts'},
            'flower': {'emotional_valence': 'positive', 'significance': 'medium', 'meaning': 'beauty, growth, femininity'},
            'car': {'emotional_valence': 'neutral', 'significance': 'low', 'meaning': 'movement, independence, control'},
            'star': {'emotional_valence': 'positive', 'significance': 'medium', 'meaning': 'wishes, dreams, guidance'},
            'moon': {'emotional_valence': 'neutral', 'significance': 'medium', 'meaning': 'mystery, cycles, femininity'},
            'rainbow': {'emotional_valence': 'very_positive', 'significance': 'high', 'meaning': 'hope, diversity, magic'},
            'water': {'emotional_valence': 'neutral', 'significance': 'medium', 'meaning': 'emotions, unconscious, flow'},
            'mountain': {'emotional_valence': 'neutral', 'significance': 'medium', 'meaning': 'challenges, strength, permanence'}
        }
        
        default_significance = {'emotional_valence': 'neutral', 'significance': 'low', 'meaning': 'general object'}
        significance = psychological_mapping.get(label, default_significance)
        
        # Add position-based psychological insights
        bbox = element_info['bbox']
        x, y, w, h = bbox
        
        position_psychology = {
            'placement': 'center' if 200 <= x <= 400 else 'peripheral',
            'vertical_position': 'upper' if y < 200 else 'middle' if y < 400 else 'lower',
            'size_psychology': 'prominent' if element_info['area'] > 5000 else 'moderate' if element_info['area'] > 1000 else 'subtle'
        }
        
        return {
            **significance,
            'position_psychology': position_psychology,
            'developmental_indicator': self._assess_developmental_indicator(label, element_info)
        }
    
    def _assess_developmental_indicator(self, label: str, element_info: Dict) -> str:
        """Assess developmental indicators based on element characteristics"""
        
        area = element_info['area']
        bbox = element_info['bbox']
        x, y, w, h = bbox
        
        # Basic developmental assessment
        if label in ['person', 'child']:
            if area > 8000:
                return 'good_self_representation'
            elif area < 1000:
                return 'minimal_self_representation'
            else:
                return 'typical_self_representation'
        
        elif label == 'house':
            if w > 100 and h > 100:
                return 'detailed_environmental_awareness'
            else:
                return 'basic_environmental_awareness'
        
        elif label == 'tree':
            if h > w * 1.5:  # Tall tree
                return 'good_proportional_understanding'
            else:
                return 'basic_proportional_understanding'
        
        else:
            return 'typical_object_representation'
    
    def _extract_element_properties(self, element_info: Dict) -> Dict:
        """Extract additional properties of the element"""
        
        bbox = element_info['bbox']
        x, y, w, h = bbox
        area = element_info['area']
        
        return {
            'size_category': 'large' if area > 5000 else 'medium' if area > 1000 else 'small',
            'aspect_ratio': w / h if h > 0 else 1,
            'position_quadrant': self._get_position_quadrant(x, y),
            'relative_size': area / (600 * 400),  # Assuming 600x400 canvas
            'centrality': abs(x + w/2 - 300) + abs(y + h/2 - 200),  # Distance from center
            'boundary_proximity': min(x, y, 600-x-w, 400-y-h)  # Distance to nearest boundary
        }
    
    def _get_position_quadrant(self, x: int, y: int) -> str:
        """Determine which quadrant the element is in"""
        if x < 300 and y < 200:
            return 'top_left'
        elif x >= 300 and y < 200:
            return 'top_right'
        elif x < 300 and y >= 200:
            return 'bottom_left'
        else:
            return 'bottom_right'
    
    def classify_multiple_elements(self, elements: List[Dict], 
                                 drawing_context: str = "children_drawing") -> List[Dict]:
        """Classify multiple elements in a batch"""
        
        results = []
        for element_data in elements:
            element_image = element_data['image']
            element_info = element_data
            classification = self.classify_element(element_image, element_info, drawing_context)
            results.append(classification)
        
        # Add inter-element relationships
        results = self._analyze_element_relationships(results)
        
        return results
    
    def _analyze_element_relationships(self, classifications: List[Dict]) -> List[Dict]:
        """Analyze relationships between classified elements"""
        
        # Add relationship analysis
        for i, classification in enumerate(classifications):
            relationships = []
            
            for j, other_classification in enumerate(classifications):
                if i != j:
                    relationship = self._determine_relationship(classification, other_classification)
                    if relationship:
                        relationships.append({
                            'element_index': j,
                            'relationship_type': relationship,
                            'element_label': other_classification['label']
                        })
            
            classification['relationships'] = relationships
        
        return classifications
    
    def _determine_relationship(self, element1: Dict, element2: Dict) -> str:
        """Determine the relationship between two elements"""
        
        label1 = element1['label']
        label2 = element2['label']
        
        # Common relationships in children's drawings
        relationships = {
            ('person', 'house'): 'lives_in',
            ('child', 'house'): 'lives_in',
            ('person', 'car'): 'uses',
            ('child', 'car'): 'uses',
            ('tree', 'house'): 'near',
            ('flower', 'tree'): 'grows_near',
            ('sun', 'cloud'): 'sky_companions',
            ('star', 'moon'): 'night_companions',
            ('person', 'animal'): 'companion',
            ('child', 'animal'): 'companion',
            ('bird', 'tree'): 'lives_in',
            ('fish', 'water'): 'lives_in',
            ('boat', 'water'): 'floats_on'
        }
        
        return relationships.get((label1, label2)) or relationships.get((label2, label1))
    
    def get_animation_sequence(self, classifications: List[Dict]) -> Dict:
        """Generate animation sequence for all classified elements"""
        
        animation_sequence = {
            'background_elements': [],
            'midground_elements': [],
            'foreground_elements': [],
            'animation_timeline': [],
            'interaction_events': []
        }
        
        # Group by layers
        for i, classification in enumerate(classifications):
            layer = classification['layer']
            element_data = {
                'index': i,
                'label': classification['label'],
                'animation_type': classification['animation_type'],
                'animation_speed': classification['animation_speed'],
                'animation_pattern': classification['animation_pattern']
            }
            
            animation_sequence[f'{layer}_elements'].append(element_data)
        
        # Generate timeline
        animation_sequence['animation_timeline'] = self._create_animation_timeline(classifications)
        
        # Generate interaction events
        animation_sequence['interaction_events'] = self._create_interaction_events(classifications)
        
        return animation_sequence
    
    def _create_animation_timeline(self, classifications: List[Dict]) -> List[Dict]:
        """Create animation timeline for elements"""
        
        timeline = []
        
        # Background elements start first
        for i, classification in enumerate(classifications):
            if classification['layer'] == 'background':
                timeline.append({
                    'element_index': i,
                    'start_time': 0,
                    'animation_type': classification['animation_type'],
                    'duration': 'continuous'
                })
        
        # Midground elements start slightly later
        for i, classification in enumerate(classifications):
            if classification['layer'] == 'midground':
                timeline.append({
                    'element_index': i,
                    'start_time': 0.5,
                    'animation_type': classification['animation_type'],
                    'duration': 'continuous'
                })
        
        # Foreground elements start last
        for i, classification in enumerate(classifications):
            if classification['layer'] == 'foreground':
                timeline.append({
                    'element_index': i,
                    'start_time': 1.0,
                    'animation_type': classification['animation_type'],
                    'duration': 'continuous'
                })
        
        return timeline
    
    def _create_interaction_events(self, classifications: List[Dict]) -> List[Dict]:
        """Create interaction events between elements"""
        
        events = []
        
        for i, classification in enumerate(classifications):
            if 'relationships' in classification:
                for relationship in classification['relationships']:
                    if relationship['relationship_type'] in ['companion', 'uses', 'lives_in']:
                        events.append({
                            'type': 'interaction',
                            'primary_element': i,
                            'secondary_element': relationship['element_index'],
                            'interaction_type': relationship['relationship_type'],
                            'trigger_time': 2.0,
                            'duration': 1.0
                        })
        
        return events

# Utility functions for the classifier
def preprocess_drawing_for_classification(image: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
    """Preprocess drawing and extract elements for classification"""
    
    # Convert to grayscale for contour detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to get binary image
    _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    elements = []
    for contour in contours:
        # Filter out very small contours
        area = cv2.contourArea(contour)
        if area > 100:  # Minimum area threshold
            x, y, w, h = cv2.boundingRect(contour)
            
            element_info = {
                'bbox': (x, y, w, h),
                'area': area,
                'contour': contour
            }
            
            elements.append(element_info)
    
    return image, elements

def extract_element_image(full_image: np.ndarray, element_info: Dict) -> np.ndarray:
    """Extract individual element image from full drawing"""
    
    x, y, w, h = element_info['bbox']
    
    # Add padding around the element
    padding = 10
    x_start = max(0, x - padding)
    y_start = max(0, y - padding)
    x_end = min(full_image.shape[1], x + w + padding)
    y_end = min(full_image.shape[0], y + h + padding)
    
    element_image = full_image[y_start:y_end, x_start:x_end]
    
    return element_image

# Export the main class and utility functions
__all__ = [
    'AIElementClassifier',
    'preprocess_drawing_for_classification',
    'extract_element_image'
]
