from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import base64
import os
import tempfile

app = Flask(__name__)

# Initialize PaddleOCR model (English only for speed, add other languages as needed)
ocr_model = PaddleOCR(use_angle_cls=True, lang='en')

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        data = request.json
        image_base64 = data.get('imageBase64')
        if not image_base64:
            return jsonify({"error": "No imageBase64 provided"}), 400

        # Decode base64 image
        image_data = base64.b64decode(image_base64.split(",")[1])

        # Save to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(image_data)
            tmp_path = tmp.name

        # Run OCR
        result = ocr_model.ocr(tmp_path, cls=True)

        # Delete temp file
        os.remove(tmp_path)

        # Extract only the text parts from OCR results
        texts = [line[1][0] for line in result[0]]

        return jsonify({"texts": texts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000)
