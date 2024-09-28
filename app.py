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
   if request.method == 'OPTIONS':
       return '', 204
  
   data = request.get_json()
   user_message = data.get('message', '')


   try:
       response = openai.ChatCompletion.create(
           model="gpt-4o-mini-2024-07-18",
           messages=[
               {"role": "system", "content": "You are a calm, patient listener who helps users explore their thoughts and feelings without offering advice or solutions. Respond with reflective questions and validation, allowing users to feel heard and understood. You prioritize understanding the user's emotional state, using reflective language to ensure they feel validated. Always remain open and accepting of any expression, while gently guiding the conversation with empathetic curiosity. Your role is to offer comfort through active listening. Respond with soft encouragement and open-ended questions that allow the user to lead the conversation. Keep responses short but supportive, and avoid providing specific instructions or advice, and use previous things said by the user to think of what to say next. If user doesn't want to share, be understanding and say you are ready to listen whenever they feel comfortable sharing. Use different phrases. Don't try to continue conversation when user doesn't want to share. If user asks for your thoughts, side with the user."},
               {"role": "user", "content": user_message}
           ]
       )
      
       ai_message = response['choices'][0]['message']['content']
       return jsonify({'response': ai_message})


   except Exception as e:
       return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
   app.run(debug=True)