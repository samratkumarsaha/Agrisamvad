import json
import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DB_FILE = 'users.json'

def load_users():
    if not os.path.exists(DB_FILE):
        default_admin = {"admin": "1234"}
        save_users(default_admin)
        return default_admin
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_users(users_dict):
    with open(DB_FILE, 'w') as f:
        json.dump(users_dict, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/auth', methods=['POST'])
def auth():
    users = load_users()
    data = request.json
    action, user, pw = data.get('action'), data.get('user'), data.get('pw')
    if action == 'login':
        if user in users and users[user] == pw:
            return jsonify({"status": "success", "user": user})
        return jsonify({"status": "error", "msg": "Invalid credentials"})
    elif action == 'create':
        if user in users:
            return jsonify({"status": "error", "msg": "Username exists"})
        users[user] = pw
        save_users(users)
        return jsonify({"status": "success", "msg": "Account created!"})

@app.route('/update_profile', methods=['POST'])
def update_profile():
    users = load_users()
    data = request.json
    old_user, new_user, new_pw = data.get('oldUser'), data.get('newUser'), data.get('newPw')
    if old_user in users:
        if old_user != new_user:
            if new_user in users: return jsonify({"status": "error", "msg": "Username taken"})
            users[new_user] = new_pw
            del users[old_user]
        else:
            users[old_user] = new_pw
        save_users(users)
        return jsonify({"status": "success", "msg": "Updated!"})
    return jsonify({"status": "error", "msg": "User not found"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)