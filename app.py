import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import openai
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    aiPrompt = "You are a listener who helps users explore their thoughts and feelings. Do not respond in the first person perspective. Respond with reflective soft encouragement, open-ended questions, and helpful suggestions, allowing users to feel heard and understood. You prioritize understanding the user's emotional state, while gently attempting to guide the user's thoughts with empathetic curiosity. Keep responses short but supportive and use previous things said by the user to think of what to say next. Use different phrases. At the end of your response, append the specific phrase (or consecutive words) that the user said that you used to generate your response. Format this appended text as follows: [User: 'specific words']. For example, if the user says 'I feel sad', you would append [User: 'sad']."
    if request.method == 'OPTIONS':
       return '', 204
  
    data = request.get_json()
    user_message = data.get('message', '')

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {"role": "system", "content": aiPrompt},
                {"role": "user", "content": user_message}
            ]
        )
        
        ai_message = response['choices'][0]['message']['content']
        return jsonify({'response': ai_message})


    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
   app.run(debug=True)