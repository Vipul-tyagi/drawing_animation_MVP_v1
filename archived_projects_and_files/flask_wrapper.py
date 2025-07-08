from flask import Flask, request, jsonify
import os
import sys
from sam_element_splitter import SAMElementSplitter
from ai_element_classifier import AIElementClassifier
from smart_animator import SmartAnimator
from moviepy.editor import ImageClip, CompositeVideoClip, TextClip
import tempfile
import shutil
from uuid import uuid4

app = Flask(__name__)

# Initialize the components
sam_splitter = SAMElementSplitter()
ai_classifier = AIElementClassifier()
smart_animator = SmartAnimator()

@app.route('/animate', methods=['POST'])
def animate():
    data = request.get_json()
    image_path = data.get('image_path')
    user_story = data.get('user_story', None) # Get user_story

    if not image_path:
        return jsonify({'success': False, 'error': 'Missing image_path'}), 400

    absolute_image_path = os.path.abspath(image_path)
    if not os.path.exists(absolute_image_path):
        return jsonify({'success': False, 'error': f'Image not found at {absolute_image_path}'}), 404

    temp_video_file_path = None
    try:
        # 1. Split elements using SAM
        print(f"[Flask] Splitting elements for {absolute_image_path}", file=sys.stderr)
        elements = sam_splitter.split_drawing_elements(absolute_image_path)
        if not elements:
            return jsonify({'success': False, 'error': 'No elements found in drawing'}), 400

        # 2. Prepare elements for animation by classifying and creating MoviePy clips
        elements_for_animation = []
        for element_data in elements:
            # element_data is a dictionary from SAM, containing 'image' (numpy array), 'bbox', etc.
            element_image_np = element_data['image']
            
            # Classify the element
            classification_result = ai_classifier.classify_element(element_image_np, element_data)

            # Create a MoviePy ImageClip from the element's image (ensure RGB if RGBA)
            if element_image_np.shape[2] == 4: # If RGBA, convert to RGB
                element_image_np = element_image_np[:,:,:3]
            element_clip = ImageClip(element_image_np).set_duration(smart_animator.animation_duration) # Set a default duration

            elements_for_animation.append({
                'clip': element_clip,
                'classification': classification_result,
                'info': element_data # Original element info from SAM
            })

        print(f"[Flask] Classified and prepared {len(elements_for_animation)} elements for animation", file=sys.stderr)

        # 3. Animate the scene and get the list of clips
        print(f"[Flask] Animating scene with {len(elements_for_animation)} elements", file=sys.stderr)
        animated_clips = smart_animator.create_coordinated_animation(elements_for_animation, absolute_image_path, user_story) # Pass user_story

        # 4. Combine clips into a single video file
        if not animated_clips:
            return jsonify({'success': False, 'error': 'No animated clips were generated'}), 500

        # Create intro and outro clips
        intro_clip = smart_animator._create_title_card_clip("Your Drawing Comes to Life!", 2, is_intro=True)
        outro_clip = smart_animator._create_title_card_clip("Created by Drawing to Animation", 2, is_intro=False)

        # Set start times for main animation and outro
        main_animation_start_time = intro_clip.duration
        outro_start_time = main_animation_start_time + smart_animator.animation_duration

        # Adjust start times of animated clips
        for clip in animated_clips:
            clip.start += main_animation_start_time

        # Combine all clips
        final_clip = CompositeVideoClip([intro_clip] + animated_clips + [outro_clip], size=smart_animator.canvas_size)

        # Create a temporary file for the output video
        temp_video_file = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
        temp_video_file_path = temp_video_file.name
        temp_video_file.close()

        print(f"[Flask] Writing final video to {temp_video_file_path}", file=sys.stderr)
        final_clip.write_videofile(temp_video_file_path, fps=24, codec='libx264', preset='medium', verbose=False, logger=None)

        if not os.path.exists(temp_video_file_path):
            return jsonify({'success': False, 'error': 'Animation failed to produce a video file'}), 500

        # 5. Move the video to the Node.js static serving directory
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'tmp', 'outputs')
        os.makedirs(output_dir, exist_ok=True)
        
        video_filename = f"{uuid4()}.mp4"
        final_video_path = os.path.join(output_dir, video_filename)
        shutil.move(temp_video_file_path, final_video_path)

        # 6. Return the URL relative to the Node.js static server
        video_url = f"/outputs/{video_filename}"
        print(f"[Flask] Animation video saved to {final_video_path}, URL: {video_url}", file=sys.stderr)

        return jsonify({'success': True, 'video_url': video_url})

    except Exception as e:
        print(f"[Flask] An unexpected error occurred: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return jsonify({'success': False, 'error': f"An unexpected error occurred: {e}"}), 500
    finally:
        if temp_video_file_path and os.path.exists(temp_video_file_path):
            os.remove(temp_video_file_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
