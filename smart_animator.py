import numpy as np
from moviepy.editor import *
from typing import Dict, List, Tuple
import random
import cv2
from PIL import Image # Added PIL import

class AnimationElement:
    """Wrapper class for animated elements"""
    def __init__(self, image, position, element_type):
        self.image = image
        self.position = position
        self.element_type = element_type
        self.frames = []
    
    def set_position(self, x, y):
        """Set element position"""
        self.position = (x, y)
    
    def add_frame(self, frame):
        """Add animation frame"""
        self.frames.append(frame)
    
    def get_frame(self, frame_idx):
        """Get specific frame"""
        if self.frames and frame_idx < len(self.frames):
            return self.frames[frame_idx]
        return self.image


class SmartAnimator:
    """
    Creates seamless, professional context-aware animations for different object types
    Enhanced with smooth easing, coordinated movement, and seamless transitions
    """
    
    def __init__(self):
        self.animation_duration = 15
        self.canvas_size = (1280, 720)
        
        # Animation timing based on story context
        self.story_timing = {
            'morning': {'sun': 0, 'cloud': 2, 'bird': 4, 'animal': 6},
            'day': {'sun': 0, 'cloud': 1, 'animal': 3, 'bird': 2},
            'evening': {'moon': 0, 'star': 1, 'animal': 8},
            'night': {'moon': 0, 'star': 1, 'animal': 8}
        }
        
        # Global timing phases for coordination
        self.phases = {
            'intro': (0, 3),      # Elements enter smoothly
            'main': (3, 12),      # Main animation phase
            'outro': (12, 15)     # Elements exit/settle
        }
    
    def _create_smooth_easing(self, t, duration, ease_type='ease_in_out'):
        """Create smooth easing functions for natural movement"""
        if duration <= 0:
            return 1.0
            
        progress = min(t / duration, 1.0)
        
        if ease_type == 'ease_in_out':
            # Smooth acceleration and deceleration (most natural)
            return 0.5 * (1 - np.cos(np.pi * progress))
        elif ease_type == 'ease_out':
            # Quick start, slow end
            return 1 - (1 - progress) ** 3
        elif ease_type == 'ease_in':
            # Slow start, quick end
            return progress ** 3
        elif ease_type == 'bounce':
            # Bouncy easing for playful elements
            if progress < 0.5:
                return 2 * progress * progress
            else:
                return 1 - 2 * (1 - progress) * (1 - progress)
        else:
            return progress
    

    def create_coordinated_animation(self, element_clips_data, original_image_path, user_story=None):
        """Create coordinated animations where elements move in harmony"""
        print("🎬 Creating coordinated seamless animations...")
        
        all_clips = []
        scene_time = self._extract_scene_time(user_story)

        # 1. Load and add the original image as background
        try:
            original_image = Image.open(original_image_path).convert('RGB')
            original_image_np = np.array(original_image)
            # Resize original image to canvas size
            original_image_resized = cv2.resize(original_image_np, self.canvas_size, interpolation=cv2.INTER_AREA)
            background_clip = ImageClip(original_image_resized).set_duration(self.animation_duration)
            all_clips.append(background_clip)
            print("✅ Original image added as background.")
        except Exception as e:
            print(f"⚠️ Could not load or use original image as background: {e}. Using default white background.", file=sys.stderr)
            # Fallback to a white background if original image fails
            white_bg = np.full((self.canvas_size[1], self.canvas_size[0], 3), 255, dtype=np.uint8)
            background_clip = ImageClip(white_bg).set_duration(self.animation_duration)
            all_clips.append(background_clip)
        
        # Sort elements by layer for proper rendering
        layer_order = {'background': 0, 'midground': 1, 'foreground': 2}
        # Filter out elements that are too small or problematic
        filtered_elements_data = [e for e in element_clips_data if e['info']['area'] > 500] # Filter out very small elements
        filtered_elements_data.sort(key=lambda x: layer_order.get(x['classification']['layer'], 1))
        
        for i, element_data in enumerate(filtered_elements_data):
            element_clip = element_data['clip']
            classification = element_data['classification']
            element_info = element_data['info']
            
            try:
                # Apply coordinated animation based on layer
                if classification['layer'] == 'background':
                    animated_clip = self._create_background_coordination(
                        element_clip, element_info, classification, user_story, scene_time
                    )
                elif classification['layer'] == 'midground':
                    animated_clip = self._create_midground_coordination(
                        element_clip, element_info, classification, user_story, scene_time
                    )
                else:  # foreground
                    animated_clip = self._create_foreground_coordination(
                        element_clip, element_info, classification, user_story, scene_time, i
                    )
                
                if animated_clip:
                    all_clips.append(animated_clip)
                    print(f"✅ Coordinated {classification['label']} animation")
                
            except Exception as e:
                print(f"⚠️ Failed to coordinate {classification['label']}: {e}", file=sys.stderr)
                # Fallback to simple positioning if specific animation fails
                x, y = element_info['center']
                try:
                    # Ensure element_clip is a MoviePy clip
                    if not isinstance(element_clip, ImageClip):
                        # Convert numpy array to MoviePy ImageClip if it's still a numpy array
                        if isinstance(element_clip, np.ndarray):
                            element_clip = ImageClip(element_clip, duration=self.animation_duration)
                        else:
                            # If it's neither, skip or create a placeholder
                            print(f"⚠️ Element clip for {classification['label']} is not a valid type. Skipping.", file=sys.stderr)
                            continue

                    simple_clip = element_clip.set_position(lambda t: (int(x), int(y))).set_duration(self.animation_duration)
                    all_clips.append(simple_clip)
                    print(f"✅ Fallback simple animation for {classification['label']}")
                    
                except Exception as e_fallback:
                    print(f"⚠️ Final fallback failed for {classification['label']}: {e_fallback}", file=sys.stderr)
                    continue
                  
        return all_clips
    
    def _create_background_coordination(self, element_clip, element_info, classification, user_story, scene_time):
        """Background elements: subtle, continuous, seamless movement"""
        object_label = classification['label']
        
        if object_label == 'sun':
            return self._create_seamless_sun_animation(element_clip, element_info, user_story, scene_time)
        elif object_label == 'moon':
            return self._create_seamless_moon_animation(element_clip, element_info, user_story, scene_time)
        elif object_label == 'cloud':
            return self._create_seamless_cloud_animation(element_clip, element_info, user_story)
        elif object_label == 'star':
            return self._create_seamless_star_animation(element_clip, element_info)
        elif object_label == 'rainbow':
            return self._create_seamless_rainbow_animation(element_clip, element_info, self.animation_duration)
        else:
            return self._create_gentle_background_motion(element_clip, element_info)
    
    def _create_midground_coordination(self, element_clip, element_info, classification, user_story, scene_time):
        """Midground elements: moderate movement, story-responsive"""
        object_label = classification['label']
        
        if object_label in ['tree', 'grass']:
            return self._create_seamless_swaying_animation(element_clip, element_info)
        elif object_label in ['house', 'building', 'mountain']:
            return self._create_seamless_breathing_animation(element_clip, element_info)
        elif object_label in ['water', 'river']:
            return self._create_seamless_flowing_animation(element_clip, element_info)
        elif object_label == 'boat':
            return self._create_seamless_floating_animation(element_clip, element_info, self.animation_duration)
        else:
            return self._create_gentle_midground_motion(element_clip, element_info)
    
    def _create_foreground_coordination(self, element_clip, element_info, classification, user_story, scene_time, index):
        """Foreground elements: dynamic movement, main focus"""
        object_label = classification['label']
        story_cues = self._parse_story_context(user_story, object_label, scene_time)
        
        if object_label in ['animal', 'dog', 'cat', 'person', 'child']:
            return self._create_seamless_walking_animation(element_clip, element_info, story_cues, index)
        elif object_label == 'bird':
            return self._create_seamless_flying_animation(element_clip, element_info, story_cues)
        elif object_label == 'car':
            return self._create_seamless_driving_animation(element_clip, element_info, story_cues)
        elif object_label == 'flower':
            return self._create_seamless_growing_animation(element_clip, element_info, story_cues)
        elif object_label in ['fish']:
            return self._create_seamless_swimming_animation(element_clip, element_info, self.animation_duration)
        elif object_label == 'ball':
            return self._create_seamless_bouncing_animation(element_clip, element_info, self.animation_duration)
        elif object_label == 'butterfly':
            return self._create_seamless_fluttering_animation(element_clip, element_info, self.animation_duration)
        elif object_label == 'airplane':
            return self._create_seamless_flying_animation(element_clip, element_info, story_cues) # Airplanes also fly
        elif object_label == 'balloon':
            return self._create_seamless_floating_animation(element_clip, element_info, self.animation_duration)
        elif object_label == 'kite':
            return self._create_seamless_flying_animation(element_clip, element_info, story_cues) # Kites also fly
        elif object_label == 'bicycle':
            return self._create_seamless_driving_animation(element_clip, element_info, story_cues) # Bicycles also drive
        elif object_label == 'train':
            return self._create_seamless_driving_animation(element_clip, element_info, story_cues) # Trains also drive
        elif object_label == 'swing':
            return self._create_seamless_swinging_animation(element_clip, element_info, self.animation_duration)
        elif object_label == 'slide':
            return self._create_seamless_breathing_animation(element_clip, element_info) # Slides are static
        elif object_label == 'umbrella':
            return self._create_seamless_swaying_animation(element_clip, element_info) # Umbrellas can sway
        else:
            return self._create_gentle_foreground_motion(element_clip, element_info, index)
    
    def _create_seamless_sun_animation(self, element_clip, element_info, user_story, scene_time):
        """Enhanced sun animation with smooth easing and natural arc"""
        x, y, w, h = element_info['bbox']
        
        def sun_position(t):
            # Use smooth easing for natural movement
            progress = self._create_smooth_easing(t, self.animation_duration, 'ease_in_out')
            
            # Determine sun path based on story context
            if 'sunrise' in (user_story or '').lower() or scene_time == 'morning':
                start_x, end_x = 50, 640
                start_y, end_y = 350, 80
                start_time = 1
            elif 'sunset' in (user_story or '').lower() or scene_time == 'evening':
                start_x, end_x = 640, 1200
                start_y, end_y = 80, 350
                start_time = 8
            else:
                # Normal day arc
                start_x, end_x = 200, 1080
                start_y, end_y = 100, 120
                start_time = 0
            
            # Smooth horizontal movement
            x_pos = start_x + (end_x - start_x) * progress
            
            # Natural arc using sine wave with easing
            arc_height = -60
            arc_progress = np.sin(np.pi * progress)
            y_pos = start_y + (end_y - start_y) * progress + arc_height * arc_progress
            
            return (int(x_pos), int(y_pos))
        
        def sun_rotation(t):
            # Gentle rotation throughout the day
            rotation_progress = self._create_smooth_easing(t, self.animation_duration, 'ease_out')
            return 360 * rotation_progress / 6  # Very slow rotation
        
        def sun_scale(t):
            # Subtle size variation for realism
            return 1.0 + 0.05 * np.sin(2 * np.pi * t / 8)
        
        return (element_clip
               .set_position(sun_position)
               .rotate(sun_rotation)
               .resize(sun_scale)
               .set_start(0))
    
    def _create_seamless_cloud_animation(self, element_clip, element_info, user_story):
        """Enhanced cloud animation with smooth transitions"""
        x, y, w, h = element_info['bbox']
        
        def cloud_position(t):
            # Phase-based movement for seamless transitions
            if t < 2:
                # Gentle entry phase
                entry_progress = self._create_smooth_easing(t, 2, 'ease_out')
                base_x = -150 + (x + 150) * entry_progress
                base_y = y + 3 * np.sin(2 * np.pi * t / 10)
            elif t < 13:
                # Main drift phase
                drift_time = t - 2
                base_x = x + 25 * drift_time
                base_y = y + 8 * np.sin(2 * np.pi * drift_time / 12)
            else:
                # Gentle exit phase
                exit_time = t - 13
                exit_progress = self._create_smooth_easing(exit_time, 2, 'ease_in')
                base_x = x + 25 * 11 + 150 * exit_progress
                base_y = y + 8 * np.sin(2 * np.pi * (11 + exit_time) / 12)
            
            # Add natural randomness
            noise_x = 4 * np.sin(3 * np.pi * t / 13)
            noise_y = 2 * np.cos(5 * np.pi * t / 17)
            
            return (int(base_x + noise_x), int(base_y + noise_y))
        
        def cloud_opacity(t):
            # Smooth fade in/out
            if t < 1:
                return self._create_smooth_easing(t, 1, 'ease_out')
            elif t > 14:
                return 1 - self._create_smooth_easing(t - 14, 1, 'ease_in')
            else:
                return 0.9 + 0.1 * np.sin(2 * np.pi * t / 8)  # Subtle opacity variation
        
        return (element_clip
               .set_position(cloud_position)
               .set_opacity(cloud_opacity)
               .set_start(1))
    
    def _create_seamless_walking_animation(self, element_clip, element_info, story_cues, index):
        """Enhanced walking animation with perfect loops and character variation"""
        x, y, w, h = element_info['bbox']
        speed_modifier = story_cues.get('speed_modifier', 1.0)
        
        # Character-specific parameters
        char_params = {
            'base_speed': 50 + index * 10,  # Vary speed by character
            'bounce_height': 6 + index * 2,
            'bounce_frequency': 8 + index,
            'start_delay': index * 0.8
        }
        
        def walking_position(t):
            # Adjust for start delay
            effective_t = max(0, t - char_params['start_delay'])
            
            if effective_t == 0:
                return (x, y)
            
            # Create perfect loop cycle
            loop_duration = 6  # 6-second walking cycle
            loop_time = effective_t % loop_duration
            
            walk_speed = char_params['base_speed'] * speed_modifier
            
            # Smooth horizontal movement with easing
            if 'playful' in story_cues.get('special_cues', []):
                # Playful zigzag movement
                zigzag = 15 * np.sin(4 * np.pi * loop_time / loop_duration)
                new_x = x + (walk_speed * effective_t) + zigzag
            else:
                # Straight movement
                new_x = x + (walk_speed * effective_t)
            
            # Natural bouncing with perfect loop
            bounce_cycles = 4  # 4 bounces per loop
            bounce_progress = (loop_time / loop_duration) * bounce_cycles
            bounce = char_params['bounce_height'] * abs(np.sin(2 * np.pi * bounce_progress))
            
            # Add subtle randomness for natural feel
            if 'running' in story_cues.get('special_cues', []):
                bounce *= 1.5  # Higher bounces when running
            
            new_y = y - bounce
            
            # Seamless screen wrapping
            screen_width = 1280
            if new_x > screen_width + 50:
                new_x = (new_x % (screen_width + 100)) - 50
            
            return (int(new_x), int(new_y))
        
        def walking_scale(t):
            # Subtle scale variation for depth
            effective_t = max(0, t - char_params['start_delay'])
            return 1.0 + 0.02 * np.sin(6 * np.pi * effective_t)
        
        return (element_clip
               .set_position(walking_position)
               .resize(walking_scale)
               .set_start(char_params['start_delay']))
    
    def _create_seamless_flying_animation(self, element_clip, element_info, story_cues):
        """Enhanced flying animation with natural wing patterns"""
        x, y, w, h = element_info['bbox']
        
        def flying_position(t):
            if 'soaring' in story_cues.get('special_cues', []):
                # Soaring in wide, slow circles
                circle_radius = 120
                circle_frequency = 0.3
                
                center_x = 640
                center_y = 180
                
                angle = circle_frequency * 2 * np.pi * t
                new_x = center_x + circle_radius * np.cos(angle)
                new_y = center_y + circle_radius * 0.4 * np.sin(angle)  # Elliptical
            else:
                # Natural wavy flight pattern
                flight_speed = 70
                wave_amplitude = 35
                wave_frequency = 1.5
                
                # Smooth horizontal movement
                new_x = x + flight_speed * t
                
                # Natural wave pattern with varying amplitude
                wave_variation = 1 + 0.3 * np.sin(0.5 * np.pi * t)
                wave_y = wave_amplitude * wave_variation * np.sin(wave_frequency * np.pi * t)
                new_y = y + wave_y
                
                # Seamless looping
                if new_x > 1350:
                    new_x = -100
            
            return (int(new_x), int(new_y))
        
        def wing_rotation(t):
            # Realistic wing flapping with varying speed
            base_frequency = 12
            frequency_variation = 1 + 0.2 * np.sin(np.pi * t / 3)
            return 6 * np.sin(base_frequency * frequency_variation * np.pi * t)
        
        def flying_scale(t):
            # Subtle size variation for depth perception
            return 1.0 + 0.03 * np.sin(8 * np.pi * t)
        
        return (element_clip
               .set_position(flying_position)
               .rotate(wing_rotation)
               .resize(flying_scale)
               .set_start(2))
    
    def _create_seamless_swaying_animation(self, element_clip, element_info):
        """Enhanced swaying for trees with wind variation"""
        x, y, w, h = element_info['bbox']
        
        def sway_rotation(t):
            # Variable wind strength
            wind_base = 2.5
            wind_variation = 1 + 0.4 * np.sin(2 * np.pi * t / 12)  # Wind changes over time
            wind_gusts = 0.3 * np.sin(7 * np.pi * t / 8)  # Random gusts
            
            # Main sway with natural frequency
            main_sway = wind_base * wind_variation * np.sin(2 * np.pi * t / 4)
            
            # Add subtle secondary motion
            secondary_sway = 0.5 * np.sin(3 * np.pi * t / 5)
            
            return main_sway + secondary_sway + wind_gusts
        
        def sway_position(t):
            # Slight horizontal movement from swaying
            sway_offset = 2 * np.sin(2 * np.pi * t / 4)
            return (x + sway_offset, y)
        
        return (element_clip
               .set_position(sway_position)
               .rotate(sway_rotation)
               .set_start(0.5))
    
    def _create_seamless_breathing_animation(self, element_clip, element_info):
        """Enhanced breathing for static objects"""
        x, y, w, h = element_info['bbox']
        
        def breathing_scale(t):
            # Natural breathing rhythm
            breath_rate = 0.8  # Slow, calm breathing
            return 1.0 + 0.015 * np.sin(2 * np.pi * t * breath_rate)
        
        def subtle_movement(t):
            # Very subtle position variation
            micro_x = 1 * np.sin(2 * np.pi * t / 15)
            micro_y = 0.5 * np.cos(2 * np.pi * t / 18)
            return (x + micro_x, y + micro_y)
        
        return (element_clip
               .set_position(subtle_movement)
               .resize(breathing_scale)
               .set_start(0))
    
    def _create_seamless_growing_animation(self, element_clip, element_info, story_cues):
        """Enhanced growing animation for flowers"""
        x, y, w, h = element_info['bbox']
        
        def growth_scale(t):
            if t < 4:
                # Natural growth curve
                growth_progress = self._create_smooth_easing(t, 4, 'ease_out')
                return 0.1 + 0.9 * growth_progress
            else:
                # Gentle swaying after growth
                sway_time = t - 4
                base_scale = 1.0
                sway_scale = 0.03 * np.sin(2 * np.pi * sway_time / 6)
                return base_scale + sway_scale
        
        def growth_position(t):
            if t < 4:
                # Grow from ground up
                growth_progress = self._create_smooth_easing(t, 4, 'ease_out')
                offset_y = 15 * (1 - growth_progress)
                return (x, y + offset_y)
            else:
                # Gentle swaying
                sway_time = t - 4
                sway_x = 3 * np.sin(2 * np.pi * sway_time / 6)
                return (x + sway_x, y)
        
        def growth_opacity(t):
            if t < 1:
                return self._create_smooth_easing(t, 1, 'ease_out')
            else:
                return 1.0
        
        return (element_clip
               .set_position(growth_position)
               .resize(growth_scale)
               .set_opacity(growth_opacity)
               .set_start(4))
    
    def _create_seamless_driving_animation(self, element_clip, element_info, story_cues):
        """Enhanced driving animation with realistic movement"""
        x, y, w, h = element_info['bbox']
        speed_modifier = story_cues.get('speed_modifier', 1.0)
        
        def driving_position(t):
            drive_speed = 100 * speed_modifier
            
            # Smooth acceleration at start
            if t < 2:
                accel_progress = self._create_smooth_easing(t, 2, 'ease_out')
                current_speed = drive_speed * accel_progress
            else:
                current_speed = drive_speed
            
            new_x = x + current_speed * t
            
            # Realistic road vibration
            vibration = 1.5 * np.sin(25 * np.pi * t)
            new_y = y + vibration
            
            # Seamless looping
            if new_x > 1400:
                new_x = (new_x % 1500) - 100
            
            return (int(new_x), int(new_y))
        
        return element_clip.set_position(driving_position).set_start(5)
    
    def _create_seamless_star_animation(self, element_clip, element_info):
        """Enhanced twinkling for stars"""
        x, y, w, h = element_info['bbox']
        
        def twinkling_opacity(t):
            # Multiple twinkling frequencies for natural effect
            base_opacity = 0.8
            twinkle1 = 0.3 * np.sin(6 * np.pi * t)
            twinkle2 = 0.2 * np.sin(4.3 * np.pi * t)
            twinkle3 = 0.1 * np.sin(8.7 * np.pi * t)
            
            total_twinkle = twinkle1 + twinkle2 + twinkle3
            return max(0.2, base_opacity + total_twinkle)
        
        def twinkling_scale(t):
            return 1.0 + 0.15 * np.sin(6 * np.pi * t)
        
        return (element_clip
               .set_position((x, y))
               .set_opacity(twinkling_opacity)
               .resize(twinkling_scale)
               .set_start(0.5))
    def _create_seamless_rainbow_animation(self, element_info, duration_frames):
        """Create rainbow animation"""
        frames = []
        for frame_idx in range(duration_frames):
            # Create rainbow fade-in/fade-out effect
            alpha = 0.5 + 0.5 * np.sin(frame_idx * 2 * np.pi / duration_frames)
            rainbow_frame = element_info['image'].copy()
            
            # Apply alpha blending for fade effect
            if len(rainbow_frame.shape) == 3:
                rainbow_frame = cv2.cvtColor(rainbow_frame, cv2.COLOR_RGB2RGBA)
                rainbow_frame[:, :, 3] = (rainbow_frame[:, :, 3] * alpha).astype(np.uint8)
            
            frames.append(rainbow_frame)
        
        return frames

    def _create_seamless_grass_animation(self, element_info, duration_frames):
        """Create grass swaying animation"""
        frames = []
        base_image = element_info['image']
        
        for frame_idx in range(duration_frames):
            # Create subtle swaying motion
            sway_amount = 2 * np.sin(frame_idx * 2 * np.pi / duration_frames)
            
            # Apply horizontal shift for swaying
            rows, cols = base_image.shape[:2]
            M = np.float32([[1, 0, sway_amount], [0, 1, 0]])
            swayed_frame = cv2.warpAffine(base_image, M, (cols, rows))
            
            frames.append(swayed_frame)
        
        return frames
    
    def _create_breathing_animation(self, element_info, duration_frames):
        """Create subtle breathing animation for static elements"""
        frames = []
        base_image = element_info['image']
        
        for frame_idx in range(duration_frames):
            # Create subtle scale variation (breathing effect)
            scale_factor = 1.0 + 0.02 * np.sin(frame_idx * 2 * np.pi / duration_frames)
            
            # Resize image slightly
            height, width = base_image.shape[:2]
            new_height = int(height * scale_factor)
            new_width = int(width * scale_factor)
            
            scaled_frame = cv2.resize(base_image, (new_width, new_height))
            
            # Pad or crop to maintain original size
            if scaled_frame.shape[0] > height or scaled_frame.shape[1] > width:
                # Crop if larger
                y_start = (scaled_frame.shape[0] - height) // 2
                x_start = (scaled_frame.shape[1] - width) // 2
                scaled_frame = scaled_frame[y_start:y_start+height, x_start:x_start+width]
            else:
                # Pad if smaller
                pad_y = (height - scaled_frame.shape[0]) // 2
                pad_x = (width - scaled_frame.shape[1]) // 2
                scaled_frame = cv2.copyMakeBorder(
                    scaled_frame, pad_y, height-scaled_frame.shape[0]-pad_y,
                    pad_x, width-scaled_frame.shape[1]-pad_x,
                    cv2.BORDER_CONSTANT, value=[255, 255, 255]
                )
            
            frames.append(scaled_frame)
        
        return frames

    
    def _create_gentle_background_motion(self, element_clip, element_info):
        """Gentle motion for unclassified background elements"""
        x, y, w, h = element_info['bbox']
        
        def gentle_position(t):
            float_x = x + 5 * np.sin(2 * np.pi * t / 12)
            float_y = y + 3 * np.cos(2 * np.pi * t / 15)
            return (int(float_x), int(float_y))
        
        return element_clip.set_position(gentle_position).set_start(1)
    
    def _create_gentle_foreground_motion(self, element_clip, element_info, index):
        """Gentle motion for unclassified foreground elements"""
        x, y, w, h = element_info['bbox']
        start_delay = index * 0.5
        
        def gentle_position(t):
            effective_t = max(0, t - start_delay)
            float_x = x + 8 * np.sin(2 * np.pi * effective_t / 8)
            float_y = y + 4 * np.cos(2 * np.pi * effective_t / 10)
            return (int(float_x), int(float_y))
        
        return element_clip.set_position(gentle_position).set_start(start_delay)
    
    def _parse_story_context(self, story: str, object_label: str, scene_time: str) -> Dict:
        """Enhanced story parsing for better animation cues"""
        cues = {
            'start_time': 0,
            'special_cues': [],
            'direction': 'right',
            'speed_modifier': 1.0,
            'scene_time': scene_time
        }
        
        if not story:
            timing_map = self.story_timing.get(scene_time, {})
            cues['start_time'] = timing_map.get(object_label, 0)
            return cues
        
        story_lower = story.lower()
        
        # Enhanced story parsing
        if object_label in ['animal', 'dog', 'cat', 'person', 'child']:
            if any(word in story_lower for word in ['run', 'running', 'chase']):
                cues['speed_modifier'] = 2.0
                cues['special_cues'].append('running')
            elif any(word in story_lower for word in ['play', 'playing', 'dance']):
                cues['special_cues'].append('playful')
                cues['speed_modifier'] = 1.3
            elif any(word in story_lower for word in ['walk', 'walking']):
                cues['special_cues'].append('walking')
            elif any(word in story_lower for word in ['slow', 'tired']):
                cues['speed_modifier'] = 0.6
        
        elif object_label == 'bird':
            if any(word in story_lower for word in ['soar', 'soaring', 'glide']):
                cues['special_cues'].append('soaring')
                cues['speed_modifier'] = 0.7
            elif any(word in story_lower for word in ['fast', 'quick']):
                cues['speed_cues'].append('fast')
                cues['speed_modifier'] = 1.5
        
        # Direction parsing
        if any(word in story_lower for word in ['left', 'west']):
            cues['direction'] = 'left'
        elif any(word in story_lower for word in ['right', 'east']):
            cues['direction'] = 'right'
        
        return cues
    
    def _extract_scene_time(self, user_story: str) -> str:
        """Extract time of day from user story"""
        if not user_story:
            return 'day'
        
        story_lower = user_story.lower()
        
        if any(word in story_lower for word in ['morning', 'sunrise', 'dawn', 'early']):
            return 'morning'
        elif any(word in story_lower for word in ['evening', 'sunset', 'dusk', 'late']):
            return 'evening'
        elif any(word in story_lower for word in ['night', 'dark', 'moon', 'stars']):
            return 'night'
        else:
            return 'day'
    
    # Keep your existing single object animation method for backward compatibility
    def create_object_animation(self, element_clip, element_info: Dict, classification: Dict, user_story: str = None) -> ImageClip:
        """Backward compatibility method - creates single object animation"""
        # Use the coordinated system for single objects
        element_data = [{
            'clip': element_clip,
            'classification': classification,
            'info': element_info
        }]
        
        coordinated_clips = self.create_coordinated_animation(element_data, user_story)
        return coordinated_clips[0] if coordinated_clips else element_clip.set_position(element_info['center'])